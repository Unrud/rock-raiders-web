import { Frustum, Mesh, Object3D, PerspectiveCamera, PositionalAudio, Raycaster, Scene, Sprite, Vector2, Vector3 } from 'three'
import { LevelConfData } from './LevelLoader'
import { BirdViewControls } from '../scene/BirdViewControls'
import { BuildPlacementMarker } from './model/building/BuildPlacementMarker'
import { EntityType } from './model/EntityType'
import { GameSelection } from './model/GameSelection'
import { GameState } from './model/GameState'
import { Terrain } from './terrain/Terrain'
import { TerrainLoader } from './TerrainLoader'
import { WorldManager } from './WorldManager'
import { BirdViewCamera } from '../scene/BirdViewCamera'
import { TorchLightCursor } from '../scene/TorchLightCursor'
import { SceneRenderer } from '../scene/SceneRenderer'
import { Updatable, updateSafe } from './model/Updateable'
import { CAMERA_FOV, DEV_MODE, MIN_CAMERA_HEIGHT_ABOVE_TERRAIN, NATIVE_UPDATE_INTERVAL, TILESIZE } from '../params'
import { SaveGameManager } from '../resource/SaveGameManager'
import { SoundManager } from '../audio/SoundManager'
import { AnimatedSceneEntity } from '../scene/AnimatedSceneEntity'
import { AnimationGroup } from '../scene/AnimationGroup'
import { SceneSelectionComponent } from './component/SceneSelectionComponent'
import { createCanvas } from '../core/ImageHelper'
import { FollowerRenderer } from '../scene/FollowerRenderer'
import { EventKey } from '../event/EventKeyEnum'
import { LeveledAmbientLight } from '../scene/LeveledAmbientLight'
import { EventBroker } from '../event/EventBroker'

export class SceneManager implements Updatable {
    static readonly VEC_DOWN: Vector3 = new Vector3(0, -1, 0)
    readonly scene: Scene
    readonly cameraBird: BirdViewCamera
    readonly cameraShoulder: PerspectiveCamera
    readonly cameraFPV: PerspectiveCamera
    readonly renderer: SceneRenderer
    readonly birdViewControls: BirdViewControls
    readonly entities: AnimatedSceneEntity[] = []
    readonly miscAnims: AnimationGroup[] = []
    readonly sprites: (Sprite & Updatable)[] = []
    readonly lastCameraWorldPos: Vector3 = new Vector3()
    readonly raycaster: Raycaster = new Raycaster()
    ambientLight: LeveledAmbientLight
    terrain: Terrain
    cursor: TorchLightCursor
    buildMarker: BuildPlacementMarker
    followerRenderer: FollowerRenderer
    shakeTimeout: number = 0
    bumpTimeout: number = 0
    cameraActive: PerspectiveCamera

    constructor(readonly worldMgr: WorldManager, canvas: HTMLCanvasElement) {
        this.worldMgr.sceneMgr = this
        this.scene = new Scene()
        const aspect = canvas.width / canvas.height
        this.cameraBird = new BirdViewCamera(aspect)
        this.cameraShoulder = new PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 8 * TILESIZE) // TODO Adjust camera parameters
        this.cameraFPV = new PerspectiveCamera(CAMERA_FOV, aspect, 0.1, 8 * TILESIZE) // TODO Adjust camera parameters
        this.renderer = new SceneRenderer(canvas)
        this.birdViewControls = new BirdViewControls(this.cameraBird, canvas)
        if (!DEV_MODE) this.birdViewControls.addEventListener('change', () => this.forceCameraBirdAboveFloor())
        this.setActiveCamera(this.cameraBird)
        EventBroker.subscribe(EventKey.DYNAMITE_EXPLOSION, () => {
            this.shakeTimeout = 1000
            this.bumpTimeout = 0
        })
        EventBroker.subscribe(EventKey.SELECTION_CHANGED, () => {
            this.setActiveCamera(this.cameraBird) // TODO Only reset camera, when camera parent is affected
        })
        EventBroker.subscribe(EventKey.COMMAND_CHANGE_PREFERENCES, () => {
            this.ambientLight?.setLightLevel(SaveGameManager.currentPreferences.gameBrightness)
        })
    }

    setActiveCamera(camera: PerspectiveCamera) {
        const isBirdView = camera === this.cameraBird
        if (this.cursor) this.cursor.visible = isBirdView
        this.birdViewControls.disabled = !isBirdView
        // TODO Showing/hiding sprites does not work since they blink or their visibility is user controlled by space key
        this.cameraActive = camera
        this.cameraActive.add(SoundManager.sceneAudioListener)
        this.renderer.camera = camera
    }

    getEntitiesInFrustum(r1x: number, r1y: number, r2x: number, r2y: number): GameSelection {
        const startPoint = new Vector3(r1x, r1y, 0.5)
        const endPoint = new Vector3(r2x, r2y, 0.5)
        // Avoid invalid frustum
        if (startPoint.x === endPoint.x) {
            endPoint.x += Number.EPSILON
        }
        if (startPoint.y === endPoint.y) {
            endPoint.y += Number.EPSILON
        }
        // update camera
        this.cameraActive.updateProjectionMatrix()
        this.cameraActive.updateMatrixWorld()
        // update frustum
        const tmpPoint = new Vector3()
        tmpPoint.copy(startPoint)
        tmpPoint.x = Math.min(startPoint.x, endPoint.x)
        tmpPoint.y = Math.max(startPoint.y, endPoint.y)
        endPoint.x = Math.max(startPoint.x, endPoint.x)
        endPoint.y = Math.min(startPoint.y, endPoint.y)

        const vecNear = new Vector3()
        const vecTopLeft = new Vector3()
        const vecTopRight = new Vector3()
        const vecDownRight = new Vector3()
        const vecDownLeft = new Vector3()
        vecNear.setFromMatrixPosition(this.cameraActive.matrixWorld)
        vecTopLeft.copy(tmpPoint)
        vecTopRight.set(endPoint.x, tmpPoint.y, 0)
        vecDownRight.copy(endPoint)
        vecDownLeft.set(tmpPoint.x, endPoint.y, 0)

        vecTopLeft.unproject(this.cameraActive)
        vecTopRight.unproject(this.cameraActive)
        vecDownRight.unproject(this.cameraActive)
        vecDownLeft.unproject(this.cameraActive)

        const vectemp1 = new Vector3()
        const vectemp2 = new Vector3()
        const vectemp3 = new Vector3()
        vectemp1.copy(vecTopLeft).sub(vecNear)
        vectemp2.copy(vecTopRight).sub(vecNear)
        vectemp3.copy(vecDownRight).sub(vecNear)
        vectemp1.normalize()
        vectemp2.normalize()
        vectemp3.normalize()

        const deep = Number.MAX_VALUE
        vectemp1.multiplyScalar(deep)
        vectemp2.multiplyScalar(deep)
        vectemp3.multiplyScalar(deep)
        vectemp1.add(vecNear)
        vectemp2.add(vecNear)
        vectemp3.add(vecNear)

        const frustum = new Frustum()
        const planes = frustum.planes

        planes[0].setFromCoplanarPoints(vecNear, vecTopLeft, vecTopRight)
        planes[1].setFromCoplanarPoints(vecNear, vecTopRight, vecDownRight)
        planes[2].setFromCoplanarPoints(vecDownRight, vecDownLeft, vecNear)
        planes[3].setFromCoplanarPoints(vecDownLeft, vecTopLeft, vecNear)
        planes[4].setFromCoplanarPoints(vecTopRight, vecDownRight, vecDownLeft)
        planes[5].setFromCoplanarPoints(vectemp3, vectemp2, vectemp1)
        planes[5].normal.multiplyScalar(-1)

        const selection = new GameSelection()
        selection.raiders.push(...this.worldMgr.entityMgr.raiders.filter((r) => {
            const pickSphere = this.worldMgr.ecs.getComponents(r.entity).get(SceneSelectionComponent).pickSphere
            return r.isInSelection() && SceneManager.isInFrustum(pickSphere, frustum)
        }))
        const hasRaiderSelected = selection.raiders.length > 0
        selection.vehicles.push(...this.worldMgr.entityMgr.vehicles.filter((v) => {
            const pickSphere = this.worldMgr.ecs.getComponents(v.entity).get(SceneSelectionComponent).pickSphere
            return v.isInSelection() && (!hasRaiderSelected || v.driver) && SceneManager.isInFrustum(pickSphere, frustum)
        }))
        if (selection.isEmpty()) selection.building = this.worldMgr.entityMgr.buildings.find((b) => {
            const pickSphere = this.worldMgr.ecs.getComponents(b.entity).get(SceneSelectionComponent).pickSphere
            return SceneManager.isInFrustum(pickSphere, frustum)
        })
        return selection
    }

    private static isInFrustum(pickSphere: Mesh, frustum: Frustum) {
        if (!pickSphere) return false
        const selectionCenter = new Vector3()
        pickSphere.getWorldPosition(selectionCenter)
        return frustum.containsPoint(selectionCenter)
    }

    setupScene(levelConf: LevelConfData) {
        this.scene.clear()
        this.ambientLight = new LeveledAmbientLight()
        this.ambientLight.setLightLevel(SaveGameManager.currentPreferences.gameBrightness)
        this.scene.add(this.ambientLight)

        this.cursor = new TorchLightCursor()
        this.scene.add(this.cursor)

        this.buildMarker = new BuildPlacementMarker(this.worldMgr)
        this.scene.add(this.buildMarker.group)
        this.setBuildModeSelection(null)

        this.terrain = TerrainLoader.loadTerrain(levelConf, this.worldMgr)
        this.terrain.forEachSurface((s) => {
            this.terrain.floorGroup.add(s.mesh)
        })
        this.scene.add(this.terrain.floorGroup)

        // gather level start details for game result score calculation
        GameState.totalDiggables = this.terrain.countDiggables()
        GameState.totalCrystals = this.terrain.countCrystals()
        GameState.numTotalOres = this.terrain.countOres()

        const followerCanvas = createCanvas(158, 158)
        this.followerRenderer = new FollowerRenderer(followerCanvas, this.scene, this.worldMgr.ecs)
    }

    async startScene(): Promise<void> {
        return this.renderer.startRendering(this.scene)
    }

    update(elapsedMs: number) {
        updateSafe(this.terrain, elapsedMs)
        this.entities.forEach((e) => updateSafe(e, elapsedMs))
        this.miscAnims.forEach((a) => updateSafe(a, elapsedMs))
        this.sprites.forEach((s) => updateSafe(s, elapsedMs))
        updateSafe(this.cursor, elapsedMs)
        this.birdViewControls?.updateControlsSafe(elapsedMs)
        this.shakeScene(elapsedMs)
    }

    private shakeScene(elapsedMs: number) {
        if (this.shakeTimeout <= 0) return
        this.shakeTimeout -= elapsedMs
        this.bumpTimeout += elapsedMs
        if (this.bumpTimeout > NATIVE_UPDATE_INTERVAL) {
            this.scene.position.random().multiplyScalar(2)
            this.bumpTimeout = 0
        }
        if (this.shakeTimeout <= 0) {
            this.shakeTimeout = 0
            this.bumpTimeout = 0
            this.scene.position.setScalar(0)
        }
    }

    disposeScene() {
        this.scene.clear()
        this.renderer.stopRendering()
        this.followerRenderer?.stopRendering()
        GameState.remainingDiggables = this.terrain?.countDiggables() || 0
        this.terrain?.dispose()
        this.terrain = null
        this.entities.forEach((e) => e.dispose())
        this.entities.length = 0
        this.miscAnims.forEach((a) => a.dispose())
        this.miscAnims.length = 0
    }

    resize(width: number, height: number) {
        this.renderer.setSize(width, height)
        const aspect = width / height
        this.cameraBird.aspect = aspect
        this.cameraBird.updateProjectionMatrix()
        this.cameraShoulder.aspect = aspect
        this.cameraShoulder.updateProjectionMatrix()
        this.cameraFPV.aspect = aspect
        this.cameraFPV.updateProjectionMatrix()
    }

    setCursorFloorPosition(position: Vector2) {
        this.cursor.position.copy(this.terrain.getFloorPosition(position))
    }

    getFloorPosition(world: Vector2) {
        return this.terrain.getFloorPosition(world)
    }

    hasBuildModeSelection(): boolean {
        return !!this.buildMarker?.hasBuildMode()
    }

    setBuildModeSelection(entityType: EntityType) {
        this.buildMarker.setBuildMode(entityType)
    }

    addMeshGroup(meshGroup: AnimatedSceneEntity): void {
        this.entities.add(meshGroup)
        this.scene.add(meshGroup)
    }

    removeMeshGroup(meshGroup: AnimatedSceneEntity): void {
        this.entities.remove(meshGroup)
        this.scene.remove(meshGroup)
    }

    addMiscAnim(lwsFilename: string, position: Vector3, heading: number, loop: boolean, onRemove?: () => unknown) {
        const group = new AnimationGroup(lwsFilename, loop ? null : () => {
            this.removeMiscAnim(group)
            if (onRemove) onRemove()
        }).setup().play()
        group.position.copy(position)
        group.rotateOnAxis(Object3D.DEFAULT_UP, heading)
        this.miscAnims.add(group)
        this.scene.add(group)
        return group
    }

    removeMiscAnim(group: AnimationGroup) {
        this.miscAnims.remove(group)
        this.scene.remove(group)
        group.dispose()
    }

    addSprite(sprite: (Sprite & Updatable)) {
        this.sprites.add(sprite)
    }

    removeSprite(sprite: (Sprite & Updatable)) {
        this.sprites.remove(sprite)
    }

    addPositionalAudio(parent: Object3D, sfxName: string, autoPlay: boolean, loop: boolean): PositionalAudio {
        const audio = new PositionalAudio(SoundManager.sceneAudioListener)
        audio.setRefDistance(TILESIZE * 5)
        audio.setRolloffFactor(10)
        const sfxVolume = SaveGameManager.getSfxVolume()
        audio.setVolume(sfxVolume)
        audio.loop = loop
        SoundManager.playingAudio.add(audio)
        if (!audio.loop) {
            audio.onEnded = () => {
                parent.remove(audio)
                SoundManager.playingAudio.delete(audio)
            }
        }
        const audioBuffer = SoundManager.getSoundBuffer(sfxName)
        if (audioBuffer) {
            audio.setBuffer(audioBuffer)
            parent.add(audio)
            if (autoPlay && sfxVolume > 0) audio.play() // TODO retry playing sound for looped ones, when audio context fails
        }
        return audio
    }

    private forceCameraBirdAboveFloor() {
        this.cameraBird.getWorldPosition(this.lastCameraWorldPos)
        this.lastCameraWorldPos.y += TILESIZE
        this.raycaster.set(this.lastCameraWorldPos, SceneManager.VEC_DOWN)
        const terrainIntersectionPoint = this.raycaster.intersectObject(this.terrain.floorGroup, true)?.[0]?.point
        if (!terrainIntersectionPoint) return
        const minCameraPosY = terrainIntersectionPoint.y + MIN_CAMERA_HEIGHT_ABOVE_TERRAIN
        const centerPosition = this.birdViewControls.target.clone()
        centerPosition.y = 0
        const groundPosition = this.cameraBird.position.clone()
        groundPosition.y = 0
        const origin = new Vector2(this.birdViewControls.target.y, 0)
        const remote = new Vector2(minCameraPosY, centerPosition.distanceTo(groundPosition))
        this.birdViewControls.maxPolarAngle = Math.atan2(remote.y - origin.y, remote.x - origin.x)
    }
}

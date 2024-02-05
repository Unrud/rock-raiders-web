import { MapControls } from 'three/examples/jsm/controls/MapControls'
import { Camera, MOUSE, Vector3 } from 'three'
import { DEV_MODE, KEY_PAN_SPEED, NATIVE_UPDATE_INTERVAL, USE_KEYBOARD_SHORTCUTS } from '../params'
import { MOUSE_BUTTON } from '../event/EventTypeEnum'
import { degToRad } from 'three/src/math/MathUtils'
import { GameConfig } from '../cfg/GameConfig'

export enum CameraRotation {
    NONE = -1,
    LEFT = 0,
    UP = 1,
    RIGHT = 2,
    DOWN = 3,
}

export class BirdViewControls extends MapControls {
    private lockBuild: boolean = false
    moveTarget: Vector3 = null
    lastPanKey: string = ''

    constructor(camera: Camera, readonly domElement: HTMLCanvasElement) { // overwrite domElement to make addEventListener below return KeyboardEvents
        super(camera, domElement)
        this.mouseButtons = {LEFT: null, MIDDLE: MOUSE.ROTATE, RIGHT: MOUSE.PAN}
        this.listenToKeyEvents(domElement)
        this.keyPanSpeed = this.keyPanSpeed * KEY_PAN_SPEED
        if (!DEV_MODE) {
            this.minDistance = GameConfig.instance.main.minDist
            this.maxDistance = GameConfig.instance.main.maxDist
            this.minPolarAngle = Math.PI / 2 - degToRad(GameConfig.instance.main.maxTilt)
            this.maxPolarAngle = Math.PI / 2 - degToRad(GameConfig.instance.main.minTilt)
        }
        if (!USE_KEYBOARD_SHORTCUTS) this.useWASDToPanAndArrowKeysToRotate()
    }

    private useWASDToPanAndArrowKeysToRotate() {
        this.keys = {LEFT: 'KeyA', UP: 'KeyW', RIGHT: 'KeyD', BOTTOM: 'KeyS'}
        ;[{code: 'ArrowUp', rot: CameraRotation.UP}, {code: 'ArrowLeft', rot: CameraRotation.LEFT}, {code: 'ArrowDown', rot: CameraRotation.DOWN}, {code: 'ArrowRight', rot: CameraRotation.RIGHT}].forEach((pair) => {
            this.domElement.addEventListener('keydown', (event: KeyboardEvent) => {
                if (event.code === pair.code) this.rotate(pair.rot)
            })
        })
    }

    zoom(zoom: number) {
        this.domElement.dispatchEvent(new WheelEvent('wheel', {deltaY: 120 * zoom, deltaMode: 0}))
    }

    rotate(rotationIndex: CameraRotation) {
        if (rotationIndex === CameraRotation.NONE) return
        const dx = rotationIndex === CameraRotation.LEFT ? 1 : (rotationIndex === CameraRotation.RIGHT ? -1 : 0)
        const dy = rotationIndex === CameraRotation.UP ? 1 : (rotationIndex === CameraRotation.DOWN ? -1 : 0)
        const px = (this.domElement as HTMLElement).clientWidth / 2
        const py = (this.domElement as HTMLElement).clientHeight / 2
        const step = py / 8 // => 16 clicks for a 360 no-scope
        this.domElement.dispatchEvent(new PointerEvent('pointerdown', {pointerId: 1, button: MOUSE_BUTTON.MIDDLE, clientX: px, clientY: py}))
        this.domElement.dispatchEvent(new PointerEvent('pointermove', {pointerId: 1, clientX: px + dx * step, clientY: py + dy * step}))
        this.domElement.dispatchEvent(new PointerEvent('pointerup', {pointerId: 1, button: MOUSE_BUTTON.MIDDLE, clientX: px + dx * step, clientY: py + dy * step}))
    }

    jumpTo(location: { x: number, y: number, z: number }) {
        const offsetTargetToCamera = this.object.position.clone().sub(this.target)
        this.object.position.set(location.x, location.y, location.z).add(offsetTargetToCamera)
        this.target.set(location.x, location.y, location.z)
        this.update()
    }

    updateControlsSafe(elapsedMs: number) {
        try {
            this.updateForceMove(elapsedMs)
            this.updateAutoPan() // XXX This should consider elapsed time independent for game speed
        } catch (e) {
            console.error(e)
        }
    }

    updateForceMove(elapsedMs: number) {
        if (!this.moveTarget) return
        if (this.target.distanceToSquared(this.moveTarget) < 1) {
            this.moveTarget = null
            this.enabled = !this.lockBuild
        } else {
            const nextCameraTargetPos = this.target.clone().add(this.moveTarget.clone().sub(this.target)
                .clampLength(0, GameConfig.instance.main.CameraSpeed * elapsedMs / NATIVE_UPDATE_INTERVAL))
            this.jumpTo(nextCameraTargetPos)
        }
    }

    forceMoveToTarget(target: Vector3) {
        this.enabled = false
        this.moveTarget = target
    }

    unlockCamera() {
        this.enabled = !this.lockBuild
    }

    setBuildLock(locked: boolean) {
        this.lockBuild = locked
        this.enabled = !this.lockBuild && !this.moveTarget
    }

    setAutoPan(key: string) {
        this.lastPanKey = key
    }

    updateAutoPan() {
        if (!this.lastPanKey) return
        const panSpeed = this.keyPanSpeed
        this.keyPanSpeed = 24
        this.domElement.dispatchEvent(new KeyboardEvent('keydown', {code: this.lastPanKey, key: this.lastPanKey}))
        this.keyPanSpeed = panSpeed
    }
}

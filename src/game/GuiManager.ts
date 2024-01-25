import { EventBus } from '../event/EventBus'
import { EventKey } from '../event/EventKeyEnum'
import { CameraControl, ChangeBuildingPowerState, ChangePriorityList, ChangeRaiderSpawnRequest, PlaySoundEvent, RequestVehicleSpawn, SelectBuildMode, SelectedRaiderPickTool, TrainRaider, UpgradeVehicle } from '../event/GuiCommand'
import { CameraViewMode, ChangeCameraEvent, DeselectAll, SelectionChanged, UpdatePriorities } from '../event/LocalEvents'
import { JobCreateEvent, RequestedRaidersChanged, RequestedVehiclesChanged } from '../event/WorldEvents'
import { EntityType } from './model/EntityType'
import { ManVehicleJob } from './model/job/ManVehicleJob'
import { EatJob } from './model/job/raider/EatJob'
import { GetToolJob } from './model/job/raider/GetToolJob'
import { TrainRaiderJob } from './model/job/raider/TrainRaiderJob'
import { UpgradeRaiderJob } from './model/job/raider/UpgradeRaiderJob'
import { WorldManager } from './WorldManager'
import { SurfaceType } from './terrain/SurfaceType'
import { BuildingSite } from './model/building/BuildingSite'
import { SoundManager } from '../audio/SoundManager'
import { SaveGameManager } from '../resource/SaveGameManager'
import { SelectionFrameComponent } from './component/SelectionFrameComponent'
import { BeamUpComponent } from './component/BeamUpComponent'
import { CameraRotation } from '../scene/BirdViewControls'
import { RepairBuildingJob } from './model/job/raider/RepairBuildingJob'
import { MaterialSpawner } from './entity/MaterialSpawner'
import { GenericDeathEvent } from '../event/WorldLocationEvent'
import { PositionComponent } from './component/PositionComponent'
import { RaiderTool } from './model/raider/RaiderTool'
import { GameConfig } from '../cfg/GameConfig'

export class GuiManager {
    buildingCycleIndex: number = 0

    constructor(worldMgr: WorldManager) {
        const sceneMgr = worldMgr.sceneMgr
        const cameraControls = sceneMgr.controls
        const entityMgr = worldMgr.entityMgr
        EventBus.registerEventListener(EventKey.COMMAND_PICK_TOOL, (event: SelectedRaiderPickTool) => {
            entityMgr.selection.raiders.forEach((r) => {
                if (r.hasTool(event.tool)) return
                const pathToToolstation = r.findShortestPath(r.worldMgr.entityMgr.getGetToolTargets())
                if (pathToToolstation) r.setJob(new GetToolJob(entityMgr, event.tool, pathToToolstation.target.building))
            })
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_CREATE_POWER_PATH, () => {
            entityMgr.selection.surface.setSurfaceType(SurfaceType.POWER_PATH_BUILDING_SITE)
            BuildingSite.createImproveSurfaceSite(worldMgr, entityMgr.selection.surface)
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_MAKE_RUBBLE, () => {
            entityMgr.selection.surface?.makeRubble(2)
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_PLACE_FENCE, () => {
            const targetSurface = entityMgr.selection.surface
            if (targetSurface) {
                entityMgr.getClosestBuildingByType(targetSurface.getCenterWorld(), EntityType.TOOLSTATION)?.spawnFence(targetSurface)
                targetSurface.fenceRequested = true
            }
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_FENCE_BEAMUP, () => {
            const fence = entityMgr.selection.fence
            EventBus.publishEvent(new GenericDeathEvent(fence.worldMgr.ecs.getComponents(fence.entity).get(PositionComponent)))
            fence.worldMgr.ecs.getComponents(fence.entity).get(SelectionFrameComponent)?.deselect()
            fence.worldMgr.ecs.removeComponent(fence.entity, SelectionFrameComponent)
            fence.worldMgr.entityMgr.removeEntity(fence.entity)
            fence.targetSurface.fence = null
            fence.targetSurface.fenceRequested = false
            fence.worldMgr.ecs.addComponent(fence.entity, new BeamUpComponent(fence))
        })
        EventBus.registerEventListener(EventKey.COMMAND_CHANGE_RAIDER_SPAWN_REQUEST, (event: ChangeRaiderSpawnRequest) => {
            if (event.increase) {
                worldMgr.requestedRaiders++
            } else {
                worldMgr.requestedRaiders--
            }
            EventBus.publishEvent(new RequestedRaidersChanged(worldMgr.requestedRaiders))
        })
        EventBus.registerEventListener(EventKey.COMMAND_CREATE_DRILL_JOB, () => {
            entityMgr.selection.surface?.setupDrillJob()
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_CREATE_REINFORCE_JOB, () => {
            entityMgr.selection.surface?.setupReinforceJob()
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_CREATE_DYNAMITE_JOB, () => {
            entityMgr.selection.surface?.setupDynamiteJob()
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_CANCEL_SURFACE_JOBS, () => {
            entityMgr.selection.surface?.cancelJobs()
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_CREATE_CLEAR_RUBBLE_JOB, () => {
            entityMgr.selection.surface?.setupClearRubbleJob()
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_REPAIR_BUILDING, () => {
            if (!entityMgr.selection.building) return
            EventBus.publishEvent(new JobCreateEvent(new RepairBuildingJob(entityMgr.selection.building)))
        })
        EventBus.registerEventListener(EventKey.COMMAND_UPGRADE_BUILDING, () => {
            entityMgr.selection.building?.upgrade()
        })
        EventBus.registerEventListener(EventKey.COMMAND_BUILDING_BEAMUP, () => {
            const building = entityMgr.selection.building
            if (!building) return
            for (let c = 0; c < building.stats.CostOre; c++) {
                MaterialSpawner.spawnMaterial(building.worldMgr, EntityType.ORE, building.primarySurface.getRandomPosition())
            }
            for (let c = 0; c < building.stats.CostCrystal; c++) {
                MaterialSpawner.spawnMaterial(building.worldMgr, EntityType.CRYSTAL, building.primarySurface.getRandomPosition())
            }
            building.carriedItems.forEach((m) => building.worldMgr.entityMgr.placeMaterial(m, building.primarySurface.getRandomPosition()))
            building.beamUp()
        })
        EventBus.registerEventListener(EventKey.COMMAND_CHANGE_BUILDING_POWER_STATE, (event: ChangeBuildingPowerState) => {
            entityMgr.selection.building?.setPowerSwitch(event.state)
        })
        EventBus.registerEventListener(EventKey.COMMAND_RAIDER_EAT, () => {
            entityMgr.selection.raiders.forEach((r) => !r.isDriving() && r.setJob(new EatJob()))
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_RAIDER_UPGRADE, () => {
            entityMgr.selection.raiders.forEach((r) => {
                if (r.level >= r.stats.Levels) return
                const closestToolstation = r.findShortestPath(entityMgr.getRaiderUpgradePathTarget())
                if (closestToolstation) r.setJob(new UpgradeRaiderJob(closestToolstation.target.building))
            })
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_RAIDER_BEAMUP, () => {
            entityMgr.selection.raiders.forEach((r) => r.beamUp())
        })
        EventBus.registerEventListener(EventKey.COMMAND_TRAIN_RAIDER, (event: TrainRaider) => {
            entityMgr.selection.raiders.forEach((r) => !r.hasTraining(event.training) && r.setJob(new TrainRaiderJob(entityMgr, event.training, null)))
            EventBus.publishEvent(new DeselectAll())
            return true
        })
        EventBus.registerEventListener(EventKey.COMMAND_RAIDER_DROP, () => {
            entityMgr.selection.raiders.forEach((r) => r.stopJob())
        })
        EventBus.registerEventListener(EventKey.COMMAND_SELECT_BUILD_MODE, (event: SelectBuildMode) => {
            sceneMgr.setBuildModeSelection(event.entityType)
        })
        EventBus.registerEventListener(EventKey.COMMAND_CANCEL_BUILD_MODE, () => {
            sceneMgr.setBuildModeSelection(null)
        })
        EventBus.registerEventListener(EventKey.COMMAND_CANCEL_CONSTRUCTION, () => {
            entityMgr.selection.surface.site?.cancelSite()
        })
        EventBus.registerEventListener(EventKey.COMMAND_REQUEST_VEHICLE_SPAWN, (event: RequestVehicleSpawn) => {
            EventBus.publishEvent(new RequestedVehiclesChanged(event.vehicle, event.numRequested))
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_VEHICLE_GET_MAN, () => {
            entityMgr.selection.vehicles.forEach((v) => {
                if (!v.callManJob && !v.driver) EventBus.publishEvent(new JobCreateEvent(new ManVehicleJob(v)))
            })
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_VEHICLE_BEAMUP, () => {
            entityMgr.selection.vehicles.forEach((v) => {
                const surface = v.getSurface()
                const spawnSurface = [surface, ...surface.neighbors].find((s) => s.isWalkable())
                if (spawnSurface) {
                    for (let c = 0; c < v.stats.CostOre; c++) MaterialSpawner.spawnMaterial(v.worldMgr, EntityType.ORE, spawnSurface.getRandomPosition())
                    for (let c = 0; c < v.stats.CostCrystal; c++) MaterialSpawner.spawnMaterial(v.worldMgr, EntityType.CRYSTAL, spawnSurface.getRandomPosition())
                }
                v.dropDriver()
                v.beamUp()
            })
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_VEHICLE_DRIVER_GET_OUT, () => {
            entityMgr.selection.vehicles.forEach((v) => v.dropDriver())
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_VEHICLE_UNLOAD, () => {
            entityMgr.selection.vehicles.forEach((v) => v.stopJob())
        })
        EventBus.registerEventListener(EventKey.COMMAND_CHANGE_PRIORITY_LIST, (event: ChangePriorityList) => {
            EventBus.publishEvent(new UpdatePriorities(event.priorityList))
        })
        EventBus.registerEventListener(EventKey.COMMAND_CAMERA_CONTROL, (event: CameraControl) => {
            if (event.zoom) {
                cameraControls.zoom(event.zoom)
            }
            if (event.cycleBuilding) {
                this.buildingCycleIndex = (this.buildingCycleIndex + 1) % entityMgr.buildings.length
                const target = entityMgr.buildings[this.buildingCycleIndex].primarySurface.getCenterWorld()
                cameraControls.jumpTo(target)
            }
            if (event.rotationIndex !== CameraRotation.NONE) cameraControls.rotate(event.rotationIndex)
            if (event.jumpToWorld) {
                const jumpTo = worldMgr.sceneMgr.terrain.getFloorPosition(event.jumpToWorld.getPosition2D())
                cameraControls.jumpTo(jumpTo)
            }
        })
        EventBus.registerEventListener(EventKey.COMMAND_REPAIR_LAVA, () => {
            BuildingSite.createImproveSurfaceSite(worldMgr, entityMgr.selection.surface)
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_PLAY_SOUND, (event: PlaySoundEvent) => {
            SoundManager.playSample(event.sample, event.isVoice)
        })
        EventBus.registerEventListener(EventKey.COMMAND_REMOVE_SELECTION, () => {
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_CHANGE_PREFERENCES, () => {
            SaveGameManager.savePreferences()
            SoundManager.setupSfxAudioTarget()
            sceneMgr.setLightLevel(SaveGameManager.currentPreferences.gameBrightness)
            const sfxVolume = SaveGameManager.getSfxVolume()
            SoundManager.playingAudio.forEach((a) => a.setVolume(sfxVolume))
            const gameSpeedIndex = Math.round(SaveGameManager.currentPreferences.gameSpeed * 5)
            worldMgr.gameSpeedMultiplier = [0.5, 0.75, 1, 1.5, 2, 2.5, 3][gameSpeedIndex] // XXX Publish speed change as event for state reconstruction
        })
        EventBus.registerEventListener(EventKey.COMMAND_UPGRADE_VEHICLE, (event: UpgradeVehicle) => {
            entityMgr.selection.assignUpgradeJob(event.upgrade)
            EventBus.publishEvent(new DeselectAll())
        })
        EventBus.registerEventListener(EventKey.COMMAND_DROP_BIRD_SCARER, () => {
            entityMgr.selection.raiders.forEach((r) => {
                if (!r.hasTool(RaiderTool.BIRDSCARER)) return
                r.removeTool(RaiderTool.BIRDSCARER)
                if (r.selected) EventBus.publishEvent(new SelectionChanged(entityMgr))
                const birdScarer = worldMgr.ecs.addEntity()
                const position = r.getPosition()
                worldMgr.ecs.addComponent(birdScarer, new PositionComponent(position, r.getSurface()))
                entityMgr.addEntity(birdScarer, EntityType.BIRD_SCARER)
                sceneMgr.addMiscAnim(GameConfig.instance.miscObjects.BirdScarer, position, Math.random() * 2 * Math.PI, false, () => {
                    entityMgr.removeEntity(birdScarer)
                    worldMgr.ecs.removeEntity(birdScarer)
                })
            })
        })
        EventBus.registerEventListener(EventKey.COMMAND_CAMERA_VIEW, (event: ChangeCameraEvent) => {
            const entity = entityMgr.selection.getPrimarySelected()
            if (!entity) {
                console.warn('No entity seems selected')
                return
            }
            const camJoints = entity.sceneEntity.animationGroups.flatMap((a) => a.meshList.filter((m) => m.name.equalsIgnoreCase('cam_null')))
            if (camJoints.length != 2) {
                console.warn(`Unexpected number ${camJoints.length} camera joints found in mesh`, entity.sceneEntity, camJoints)
                return
            }
            const [headJoint, shoulderJoint] = camJoints
            if (event.viewMode === CameraViewMode.BIRD) {
                worldMgr.sceneMgr.setActiveCamera(worldMgr.sceneMgr.cameraBird)
                return
            } else if (event.viewMode === CameraViewMode.FPV) {
                headJoint.add(worldMgr.sceneMgr.cameraFPV)
                worldMgr.sceneMgr.setActiveCamera(worldMgr.sceneMgr.cameraFPV)
            } else if (event.viewMode === CameraViewMode.SHOULDER) {
                shoulderJoint.add(worldMgr.sceneMgr.cameraShoulder)
                worldMgr.sceneMgr.setActiveCamera(worldMgr.sceneMgr.cameraShoulder)
            }
        })
    }
}

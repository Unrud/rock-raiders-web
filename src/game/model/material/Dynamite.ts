import { Sample } from '../../../audio/Sample'
import { AnimatedSceneEntity } from '../../../scene/AnimatedSceneEntity'
import { WorldManager } from '../../WorldManager'
import { DynamiteActivity } from '../anim/AnimationActivity'
import { EntityType } from '../EntityType'
import { PriorityIdentifier } from '../job/PriorityIdentifier'
import { Surface } from '../map/Surface'
import { PathTarget } from '../PathTarget'
import { RaiderTraining } from '../raider/RaiderTraining'
import { MaterialEntity } from './MaterialEntity'
import { ResourceManager } from "../../../resource/ResourceManager"

export class Dynamite extends MaterialEntity {
    constructor(worldMgr: WorldManager, readonly targetSurface: Surface) {
        super(worldMgr, EntityType.DYNAMITE, PriorityIdentifier.DESTRUCTION, RaiderTraining.DEMOLITION)
        this.sceneEntity = new AnimatedSceneEntity(this.worldMgr.sceneMgr, ResourceManager.configuration.miscObjects.Dynamite)
        this.sceneEntity.changeActivity()
    }

    findCarryTargets(): PathTarget[] {
        if (this.targetSurface?.isDigable()) {
            return this.targetSurface.getDigPositions().map((p) => PathTarget.fromLocation(p, this.sceneEntity.getRadiusSquare() / 4))
        } else {
            return this.worldMgr.entityMgr.getBuildingCarryPathTargets(EntityType.TOOLSTATION)
        }
    }

    onCarryJobComplete(): void {
        super.onCarryJobComplete()
        this.sceneEntity.headTowards(this.targetSurface.getCenterWorld2D())
        this.sceneEntity.changeActivity(DynamiteActivity.TickDown, () => {
            this.sceneEntity.disposeFromScene()
            this.targetSurface.collapse()
            this.worldMgr.addMiscAnim(ResourceManager.configuration.miscObjects.Explosion, this.sceneEntity.position, this.sceneEntity.getHeading())
            this.sceneEntity.playPositionalAudio(Sample[Sample.SFX_Dynamite], false)
            // TODO damage raider, vehicle, buildings
        })
    }
}

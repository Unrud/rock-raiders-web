import { ResourceManager } from '../../../resource/ResourceManager'
import { SceneEntity } from '../../../scene/SceneEntity'
import { WorldManager } from '../../WorldManager'
import { EntityType } from '../EntityType'
import { PriorityIdentifier } from '../job/PriorityIdentifier'
import { PathTarget } from '../PathTarget'
import { RaiderTraining } from '../raider/RaiderTraining'
import { MaterialEntity } from './MaterialEntity'
import { GameState } from '../GameState'
import { EventBus } from '../../../event/EventBus'
import { MaterialAmountChanged } from '../../../event/WorldEvents'
import { SceneSelectionComponent } from '../../component/SceneSelectionComponent'

export class Ore extends MaterialEntity {
    constructor(worldMgr: WorldManager) {
        super(worldMgr, EntityType.ORE, PriorityIdentifier.ORE, RaiderTraining.NONE)
        this.sceneEntity = new SceneEntity(this.worldMgr.sceneMgr)
        this.sceneEntity.addToMeshGroup(ResourceManager.getLwoModel(ResourceManager.configuration.miscObjects.Ore))
        this.worldMgr.ecs.addComponent(this.entity, new SceneSelectionComponent(this.sceneEntity.group, {gameEntity: this.entity, entityType: this.entityType}, ResourceManager.configuration.stats.ore))
    }

    findCarryTargets(): PathTarget[] {
        const sites = this.worldMgr.entityMgr.buildingSites.filter((b) => b.needs(this.entityType))
        if (sites.length > 0) return sites.map((s) => PathTarget.fromSite(s, s.getRandomDropPosition()))
        const oreRefineries = this.worldMgr.entityMgr.getBuildingCarryPathTargets(EntityType.ORE_REFINERY)
        if (oreRefineries.length > 0) return oreRefineries
        return this.worldMgr.entityMgr.getBuildingCarryPathTargets(EntityType.TOOLSTATION)
    }

    onDeposit() {
        super.onDeposit()
        GameState.numOre++
        EventBus.publishEvent(new MaterialAmountChanged())
    }
}

import { CollectableEntity } from '../collect/CollectableEntity'
import { ElectricFence } from '../collect/ElectricFence'
import { EntityType } from '../EntityType'
import { FulfillerEntity } from '../FulfillerEntity'
import { PathTarget } from '../PathTarget'
import { PublicJob } from './Job'
import { JobType } from './JobType'
import { PriorityIdentifier } from './PriorityIdentifier'

export class CollectJob extends PublicJob {

    item: CollectableEntity

    constructor(item: CollectableEntity) {
        super(JobType.COLLECT)
        this.item = item
    }

    getWorkplaces(): PathTarget[] {
        return [new PathTarget(this.item.getPosition2D())]
    }

    isQualified(fulfiller: FulfillerEntity) {
        return fulfiller.carries === null && this.item.hasTarget()
    }

    getPriorityIdentifier(): PriorityIdentifier {
        return this.item.getPriorityIdentifier()
    }

    onJobComplete() {
        super.onJobComplete()
        if (this.item.entityType === EntityType.ELECTRIC_FENCE) {
            const electricFence = this.item as ElectricFence
            if (electricFence.targetSurface.canPlaceFence()) {
                this.item.worldMgr.sceneManager.scene.add(this.item.group)
                electricFence.targetSurface.fence = electricFence
            } // TODO else dispose item entity with mesh
        }
    }

}

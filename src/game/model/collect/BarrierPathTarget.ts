import { BarrierActivity } from '../activities/BarrierActivity'
import { BarrierLocation } from './BarrierLocation'
import { CollectableEntity } from './CollectableEntity'
import { CollectPathTarget } from './CollectPathTarget'

export class BarrierPathTarget extends CollectPathTarget {

    heading: number

    constructor(location: BarrierLocation, site) {
        super(location.location, site, null)
        this.heading = location.heading
    }

    gatherItem(item: CollectableEntity) {
        item.targetSite.addItem(item)
        item.group.position.copy(item.worldMgr.getFloorPosition(this.targetLocation))
        item.group.rotation.y = this.heading
        item.changeActivity(BarrierActivity.Expand, () => {
            item.changeActivity(BarrierActivity.Long)
        })
    }

    canGatherItem(): boolean {
        return true
    }

}
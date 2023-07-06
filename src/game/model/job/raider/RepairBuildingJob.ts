import { RaiderJob } from './RaiderJob'
import { BuildingEntity } from '../../building/BuildingEntity'
import { PathTarget } from '../../PathTarget'
import { Raider } from '../../raider/Raider'
import { VehicleEntity } from '../../vehicle/VehicleEntity'
import { JobFulfiller } from '../Job'
import { AnimationActivity, RaiderActivity } from '../../anim/AnimationActivity'
import { BubblesCfg } from '../../../../cfg/BubblesCfg'
import { HealthComponent } from '../../../component/HealthComponent'
import { RaiderTool } from '../../raider/RaiderTool'
import { RaiderTraining } from '../../raider/RaiderTraining'
import { PriorityIdentifier } from '../PriorityIdentifier'
import { Sample } from '../../../../audio/Sample'

export class RepairBuildingJob extends RaiderJob {
    building: BuildingEntity
    workplaces: PathTarget[]

    constructor(building: BuildingEntity) {
        super()
        this.building = building
        this.workplaces = building.getTrainingTargets()
        this.requiredTool = RaiderTool.SPANNER
        this.requiredTraining = RaiderTraining.ENGINEER
        this.priorityIdentifier = PriorityIdentifier.REPAIR
        this.workSound = [Sample.SND_screw1, Sample.SND_screw3, Sample.SND_screw3].random() // TODO this should be played as part of the LWS file with AddNullObject SFX,...
    }

    getWorkplace(entity: Raider | VehicleEntity): PathTarget {
        const healthComponent = this.building.worldMgr.ecs.getComponents(this.building.entity).get(HealthComponent)
        if (healthComponent.health >= healthComponent.maxHealth) return null
        return entity.findShortestPath(this.workplaces)?.target
    }

    onJobComplete(fulfiller: JobFulfiller): void {
        const healthComponent = this.building.worldMgr.ecs.getComponents(this.building.entity).get(HealthComponent)
        healthComponent.changeHealth(fulfiller.getRepairValue())
        if (healthComponent.health >= healthComponent.maxHealth) super.onJobComplete(fulfiller)
    }

    getWorkActivity(): AnimationActivity {
        return RaiderActivity.Repair
    }

    getJobBubble(): keyof BubblesCfg {
        return 'bubbleRepair'
    }
}

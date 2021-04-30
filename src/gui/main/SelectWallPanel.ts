import { EventBus } from '../../event/EventBus'
import { EventKey } from '../../event/EventKeyEnum'
import { EntityDeselected } from '../../event/LocalEvents'
import { JobCreateEvent, SpawnDynamiteEvent } from '../../event/WorldEvents'
import { EntityType } from '../../game/model/EntityType'
import { GameState } from '../../game/model/GameState'
import { JobType } from '../../game/model/job/JobType'
import { DrillJob } from '../../game/model/job/surface/DrillJob'
import { ReinforceJob } from '../../game/model/job/surface/ReinforceJob'
import { SurfaceJob } from '../../game/model/job/surface/SurfaceJob'
import { Surface } from '../../game/model/map/Surface'
import { RaiderSkill } from '../../game/model/raider/RaiderSkill'
import { Panel } from '../base/Panel'
import { IconPanelButton } from './IconPanelButton'
import { SelectBasePanel } from './SelectBasePanel'

export class SelectWallPanel extends SelectBasePanel {

    constructor(onBackPanel: Panel) {
        super(4, onBackPanel)
        const itemDrill = this.addWallMenuItem('Interface_MenuItem_Dig', JobType.DRILL, (s) => new DrillJob(s))
        itemDrill.isDisabled = () => !(GameState.selectedSurface?.isDrillable()) &&
            !(GameState.selectedSurface?.isDrillableHard()) // TODO implement vehicle check for drill hard skill
        const itemReinforce = this.addWallMenuItem('Interface_MenuItem_Reinforce', JobType.REINFORCE, (s) => new ReinforceJob(s))
        itemReinforce.isDisabled = () => !(GameState.selectedSurface?.isReinforcable())
        const itemDynamite = this.addWallMenuItem('Interface_MenuItem_Dynamite', JobType.BLOW, null)
        itemDynamite.isDisabled = () => !GameState.hasBuildingWithUpgrades(EntityType.TOOLSTATION, 2) &&
            !GameState.raiders.some((r) => r.hasSkill(RaiderSkill.DEMOLITION))
        const itemDeselect = this.addMenuItem('InterfaceImages', 'Interface_MenuItem_DeselectDig')
        itemDeselect.isDisabled = () => false
        itemDeselect.onClick = () => {
            const selectedSurface = GameState.selectedEntities[0] as Surface
            selectedSurface.cancelJobs()
            EventBus.publishEvent(new EntityDeselected())
        }
        EventBus.registerEventListener(EventKey.SELECTED_SURFACE, () => {
            itemDrill.updateState(false)
            itemReinforce.updateState(false)
            itemDynamite.updateState(false)
            this.notifyRedraw()
        })
    }

    addWallMenuItem(itemKey: string, jobType: JobType, createJob: (surface: Surface) => SurfaceJob): IconPanelButton {
        const item = this.addMenuItem('InterfaceImages', itemKey)
        item.onClick = () => {
            const selectedSurface = GameState.selectedSurface
            if (selectedSurface) {
                if (jobType === JobType.BLOW) {
                    EventBus.publishEvent(new SpawnDynamiteEvent(selectedSurface))
                } else if (!selectedSurface.hasJobType(jobType)) {
                    EventBus.publishEvent(new JobCreateEvent(createJob(selectedSurface)))
                }
                EventBus.publishEvent(new EntityDeselected())
            }
        }
        return item
    }

}

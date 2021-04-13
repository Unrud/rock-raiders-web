import { Panel } from '../base/Panel'
import { IconPanelButton } from './IconPanelButton'
import { SelectBasePanel } from './SelectBasePanel'
import { GameState } from '../../model/GameState'
import { EatJob } from '../../model/job/EatJob'
import { EventBus } from '../../../event/EventBus'
import { EntityDeselected } from '../../../event/LocalEvents'

export class SelectRaiderPanel extends SelectBasePanel {

    getToolItem: IconPanelButton
    trainItem: IconPanelButton

    constructor(onBackPanel: Panel) {
        super(10, onBackPanel)
        const feedItem = this.addMenuItem('InterfaceImages', 'Interface_MenuItem_GoFeed')
        feedItem.isDisabled = () => false
        feedItem.onClick = () => {
            GameState.selectedRaiders.forEach((r) => !r.isDriving() && r.setJob(new EatJob()))
            EventBus.publishEvent(new EntityDeselected())
        }
        this.addMenuItem('InterfaceImages', 'Interface_MenuItem_UnLoadMinifigure')
        this.addMenuItem('InterfaceImages', 'Interface_MenuItem_MinifigurePickUp')
        this.getToolItem = this.addMenuItem('InterfaceImages', 'Interface_MenuItem_GetTool')
        this.getToolItem.isDisabled = () => false
        this.addMenuItem('InterfaceImages', 'Interface_MenuItem_DropBirdScarer')
        this.addMenuItem('InterfaceImages', 'Interface_MenuItem_UpgradeMan')
        this.trainItem = this.addMenuItem('InterfaceImages', 'Interface_MenuItem_TrainSkill')
        this.trainItem.isDisabled = () => false
        this.addMenuItem('InterfaceImages', 'Interface_MenuItem_GotoFirstPerson')
        this.addMenuItem('InterfaceImages', 'Interface_MenuItem_GotoSecondPerson')
        this.addMenuItem('InterfaceImages', 'Interface_MenuItem_DeleteMan')
    }

}
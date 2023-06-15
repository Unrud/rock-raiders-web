import { CancelBuilding } from '../../../event/GuiCommand'
import { BaseElement } from '../../base/BaseElement'
import { Panel } from '../../base/Panel'
import { SelectBasePanel } from './SelectBasePanel'
import { ResourceManager } from '../../../resource/ResourceManager'

export class SelectSitePanel extends SelectBasePanel {
    constructor(parent: BaseElement, onBackPanel: Panel) {
        super(parent, 1, onBackPanel)
        const cancelBuilding = this.addMenuItem(ResourceManager.configuration.interfaceImages, 'Interface_MenuItem_CancelConstruction')
        cancelBuilding.isDisabled = () => false
        cancelBuilding.onClick = () => this.publishEvent(new CancelBuilding())
    }
}

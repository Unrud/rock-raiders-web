import { Panel } from '../base/Panel'
import { IconSubPanel } from './IconSubPanel'

export class LargeVehiclePanel extends IconSubPanel {

    constructor(onBackPanel: Panel) {
        super(5, onBackPanel)
        this.addMenuItem('InterfaceBuildImages', 'BullDozer')
        this.addMenuItem('InterfaceBuildImages', 'WalkerDigger')
        this.addMenuItem('InterfaceBuildImages', 'LargeMLP')
        this.addMenuItem('InterfaceBuildImages', 'LargeDigger')
        this.addMenuItem('InterfaceBuildImages', 'LargeCat')
    }

}

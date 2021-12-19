import { InfoMessagesCfg } from '../gui/infodock/InfoMessagesCfg'
import { TextInfoMessageCfg } from '../gui/messagepanel/TextInfoMessageCfg'
import { BaseConfig } from './BaseConfig'
import { BubblesCfg } from './BubblesCfg'
import { IconPanelBackButtonCfg } from './ButtonCfg'
import { ButtonsCfg } from './ButtonsCfg'
import { DialogCfg } from './DialogCfg'
import { GameStatsCfg } from './GameStatsCfg'
import { LevelsCfg } from './LevelsCfg'
import { MainCfg } from './MainCfg'
import { GameMenuCfg } from './MenuCfg'
import { PanelsCfg } from './PanelCfg'
import { PanelRotationControlCfg } from './PanelRotationControlCfg'
import { PointerCfg } from './PointerCfg'
import { PrioritiesImagePositionsCfg, PriorityButtonsCfg } from './PriorityButtonsCfg'
import { RewardCfg } from './RewardCfg'
import { TexturesCfg } from './TexturesCfg'

export class GameConfig extends BaseConfig {
    main: MainCfg = new MainCfg()
    dialog: DialogCfg = new DialogCfg()
    reward: RewardCfg = new RewardCfg()
    menu: GameMenuCfg = new GameMenuCfg()
    pointers: PointerCfg = new PointerCfg()
    // interfaceImages: InterfaceImagesCfg = new InterfaceImagesCfg()
    panelRotationControl: PanelRotationControlCfg = new PanelRotationControlCfg()
    panels: PanelsCfg = new PanelsCfg()
    buttons: ButtonsCfg = new ButtonsCfg()
    interfaceBackButton: IconPanelBackButtonCfg = null
    // interfaceBuildImages: InterfaceBuildImagesCfg = new InterfaceBuildImagesCfg()
    // interfaceSurroundImages: InterfaceSurroundImagesCfg = new InterfaceSurroundImagesCfg()
    priorityImages: PriorityButtonsCfg = new PriorityButtonsCfg()
    prioritiesImagePositions: PrioritiesImagePositionsCfg = new PrioritiesImagePositionsCfg()
    // miscObjects: MiscObjectsCfg = new MiscObjectsCfg()
    bubbles: BubblesCfg = new BubblesCfg()
    textMessagesWithImages: TextInfoMessageCfg = new TextInfoMessageCfg()
    // samples: SamplesCfg = new SamplesCfg()
    textures: TexturesCfg = new TexturesCfg()
    // vehicleTypes: VehicleTypesCfg = new VehicleTypesCfg()
    // rockMonsterTypes: RockMonsterTypesCfg = new RockMonsterTypesCfg()
    // buildingTypes: BuildingTypesCfg = new BuildingTypesCfg()
    // upgradeTypes: UpgradeTypesCfg = new UpgradeTypesCfg()
    infoMessages: InfoMessagesCfg = new InfoMessagesCfg()
    stats: GameStatsCfg = new GameStatsCfg()
    // dependencies: DependenciesCfg = new DependenciesCfg()
    levels: LevelsCfg = new LevelsCfg()

    assignValue(objKey: string, unifiedKey: string, cfgValue: any): boolean {
        if ('Main'.equalsIgnoreCase(unifiedKey)) {
            this.main.setFromCfgObj(cfgValue)
        } else if ('Dialog'.equalsIgnoreCase(unifiedKey)) {
            this.dialog.setFromCfgObj(cfgValue)
        } else if ('Reward'.equalsIgnoreCase(unifiedKey)) {
            this.reward.setFromCfgObj(cfgValue)
        } else if ('Menu'.equalsIgnoreCase(unifiedKey)) {
            this.menu.setFromCfgObj(cfgValue)
        } else if ('Pointers'.equalsIgnoreCase(unifiedKey)) {
            this.pointers.setFromCfgObj(cfgValue)
        // } else if ('InterfaceImages'.equalsIgnoreCase(unifiedKey)) {
        //     this.interfaceImages.setFromCfgObj(cfgValue)
        } else if ('PanelRotationControl'.equalsIgnoreCase(unifiedKey)) {
            this.panelRotationControl.setFromCfgObj(cfgValue)
        } else if ('Panels640x480'.equalsIgnoreCase(unifiedKey)) {
            this.panels.setFromCfgObj(cfgValue)
        } else if ('Buttons640x480'.equalsIgnoreCase(unifiedKey)) {
            this.buttons.setFromCfgObj(cfgValue)
        } else if ('InterfaceBackButton'.equalsIgnoreCase(unifiedKey)) {
            this.interfaceBackButton = new IconPanelBackButtonCfg(cfgValue)
        // } else if ('InterfaceBuildImages'.equalsIgnoreCase(unifiedKey)) {
        //     this.interfaceBuildImages.setFromCfgObj(cfgValue)
        // } else if ('InterfaceSurroundImages'.equalsIgnoreCase(unifiedKey)) {
        //     this.interfaceSurroundImages.setFromCfgObj(cfgValue)
        } else if ('PriorityImages'.equalsIgnoreCase(unifiedKey)) {
            this.priorityImages.setFromCfgObj(cfgValue)
        } else if ('PrioritiesImagePositions'.equalsIgnoreCase(unifiedKey)) {
            this.prioritiesImagePositions.setFromCfgObj(cfgValue)
        // } else if ('MiscObjects'.equalsIgnoreCase(unifiedKey)) {
        //     this.miscObjects.setFromCfgObj(cfgValue)
        } else if ('Bubbles'.equalsIgnoreCase(unifiedKey)) {
            this.bubbles.setFromCfgObj(cfgValue)
        } else if ('TextMessagesWithImages'.equalsIgnoreCase(unifiedKey)) {
            this.textMessagesWithImages.setFromCfgObj(cfgValue)
        // } else if ('Samples'.equalsIgnoreCase(unifiedKey)) {
        //     this.samples.setFromCfgObj(cfgValue)
        } else if ('Textures'.equalsIgnoreCase(unifiedKey)) {
            this.textures.setFromCfgObj(cfgValue)
        // } else if ('VehicleTypes'.equalsIgnoreCase(unifiedKey)) {
        //     this.vehicleTypes.setFromCfgObj(cfgValue)
        // } else if ('RockMonsterTypes'.equalsIgnoreCase(unifiedKey)) {
        //     this.rockMonsterTypes.setFromCfgObj(cfgValue)
        // } else if ('BuildingTypes'.equalsIgnoreCase(unifiedKey)) {
        //     this.buildingTypes.setFromCfgObj(cfgValue)
        // } else if ('UpgradeTypes'.equalsIgnoreCase(unifiedKey)) {
        //     this.upgradeTypes.setFromCfgObj(cfgValue)
        } else if ('InfoMessages'.equalsIgnoreCase(unifiedKey)) {
            this.infoMessages.setFromCfgObj(cfgValue)
        } else if ('Stats'.equalsIgnoreCase(unifiedKey)) {
            this.stats.setFromCfgObj(cfgValue)
        // } else if ('Dependencies'.equalsIgnoreCase(unifiedKey)) {
        //     this.dependencies.setFromCfgObj(cfgValue)
        } else if ('Levels'.equalsIgnoreCase(unifiedKey)) {
            this.levels.setFromCfgObj(cfgValue)
        } else {
            return super.assignValue(objKey, unifiedKey, cfgValue)
        }
        return true
    }
}
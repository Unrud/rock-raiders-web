import { EventBus } from '../../event/EventBus'
import { EventKey } from '../../event/EventKeyEnum'
import { SurfaceChanged, SurfaceSelectedEvent } from '../../event/LocalEvents'
import { EntityAddedEvent, EntityRemovedEvent, RaiderRequested } from '../../event/WorldEvents'
import { EntitySuperType, EntityType } from '../../game/model/EntityType'
import { GameState } from '../../game/model/GameState'
import { Surface } from '../../game/model/map/Surface'
import { MAX_RAIDER_REQUEST } from '../../params'
import { Panel } from '../base/Panel'
import { BuildingPanel } from './BuildingPanel'
import { GetToolPanel } from './GetToolPanel'
import { IconPanelButtonLabel } from './IconPanelButtonLabel'
import { IconSubPanel } from './IconSubPanel'
import { LargeVehiclePanel } from './LargeVehiclePanel'
import { SelectBuildingPanel } from './SelectBuildingPanel'
import { SelectFloorPanel } from './SelectFloorPanel'
import { SelectRaiderPanel } from './SelectRaiderPanel'
import { SelectRubblePanel } from './SelectRubblePanel'
import { SelectVehiclePanel } from './SelectVehiclePanel'
import { SelectWallPanel } from './SelectWallPanel'
import { SmallVehiclePanel } from './SmallVehiclePanel'
import { TrainRaiderPanel } from './TrainRaiderPanel'

export class MainPanel extends Panel {

    subPanels: IconSubPanel[] = []
    mainPanel: IconSubPanel // don't use root itself, since sub panel must be decoupled from (animated) main panel position
    selectWallPanel: SelectWallPanel
    selectFloorPanel: SelectFloorPanel
    selectRubblePanel: SelectRubblePanel

    constructor() {
        super()
        this.relX = this.xOut = 640 - 16
        this.xIn = 640 + 95
        this.relY = this.yOut = this.yIn = 9
        this.movedIn = false
        this.mainPanel = this.addSubPanel(new IconSubPanel(4))
        this.mainPanel.relX = this.mainPanel.xOut
        this.mainPanel.relY = this.mainPanel.yOut
        this.mainPanel.movedIn = false

        const buildingPanel = this.addSubPanel(new BuildingPanel(this.mainPanel))
        const smallVehiclePanel = this.addSubPanel(new SmallVehiclePanel(this.mainPanel))
        const largeVehiclePanel = this.addSubPanel(new LargeVehiclePanel(this.mainPanel))
        this.selectWallPanel = this.addSubPanel(new SelectWallPanel(this.mainPanel))
        this.selectFloorPanel = this.addSubPanel(new SelectFloorPanel(this.mainPanel))
        this.selectRubblePanel = this.addSubPanel(new SelectRubblePanel(this.mainPanel))
        const selectBuildingPanel = this.addSubPanel(new SelectBuildingPanel(this.mainPanel))
        const selectRaiderPanel = this.addSubPanel(new SelectRaiderPanel(this.mainPanel))
        const trainRaiderPanel = this.addSubPanel(new TrainRaiderPanel(selectRaiderPanel))
        selectRaiderPanel.trainItem.onClick = () => selectRaiderPanel.toggleState(() => trainRaiderPanel.toggleState())
        const getToolPanel = this.addSubPanel(new GetToolPanel(selectRaiderPanel))
        selectRaiderPanel.getToolItem.onClick = () => selectRaiderPanel.toggleState(() => getToolPanel.toggleState())
        const selectVehiclePanel = this.addSubPanel(new SelectVehiclePanel(this.mainPanel))
        const teleportRaider = this.mainPanel.addMenuItem('InterfaceImages', 'Interface_MenuItem_TeleportMan')
        teleportRaider.isDisabled = () => GameState.raiders.length >= GameState.getMaxRaiders() || GameState.requestedRaiders >= MAX_RAIDER_REQUEST ||
            !GameState.hasOneBuildingOf(EntityType.TOOLSTATION, EntityType.TELEPORT_PAD)
        teleportRaider.updateState()
        EventBus.registerEventListener(EventKey.RAIDER_REQUESTED, () => teleportRaider.updateState())
        EventBus.registerEventListener(EventKey.ENTITY_ADDED, (event: EntityAddedEvent) => {
            // TODO add event inheritance by using event key prefix checking
            if (event.superType === EntitySuperType.BUILDING || event.superType === EntitySuperType.RAIDER) teleportRaider.updateState()
        })
        EventBus.registerEventListener(EventKey.ENTITY_REMOVED, (event: EntityRemovedEvent) => {
            // TODO add event inheritance by using event key prefix checking
            if (event.superType === EntitySuperType.BUILDING || event.superType === EntitySuperType.RAIDER) teleportRaider.updateState()
        })
        teleportRaider.onClick = () => {
            GameState.requestedRaiders++
            EventBus.publishEvent(new RaiderRequested())
        }
        // TODO add decrease requested raider spawn option (needs right click for gui elements)
        teleportRaider.addChild(new IconPanelButtonLabel(teleportRaider))
        const buildingItem = this.mainPanel.addMenuItem('InterfaceImages', 'Interface_MenuItem_BuildBuilding')
        buildingItem.isDisabled = () => false
        buildingItem.onClick = () => this.mainPanel.toggleState(() => buildingPanel.toggleState())
        const smallVehicleItem = this.mainPanel.addMenuItem('InterfaceImages', 'Interface_MenuItem_BuildSmallVehicle')
        smallVehicleItem.isDisabled = () => false
        smallVehicleItem.onClick = () => this.mainPanel.toggleState(() => smallVehiclePanel.toggleState())
        const largeVehicleItem = this.mainPanel.addMenuItem('InterfaceImages', 'Interface_MenuItem_BuildLargeVehicle')
        largeVehicleItem.isDisabled = () => false
        largeVehicleItem.onClick = () => this.mainPanel.toggleState(() => largeVehiclePanel.toggleState())
        EventBus.registerEventListener(EventKey.SELECTED_SURFACE, (event: SurfaceSelectedEvent) => {
            this.onSelectedSurfaceChange(event.surface)
        })
        EventBus.registerEventListener(EventKey.SURFACE_CHANGED, (event: SurfaceChanged) => {
            if (GameState.selectedSurface === event.surface) this.onSelectedSurfaceChange(event.surface)
        })
        EventBus.registerEventListener(EventKey.DESELECTED_ENTITY, () => this.selectSubPanel(this.mainPanel))
        EventBus.registerEventListener(EventKey.SELECTED_BUILDING, () => this.selectSubPanel(selectBuildingPanel))
        EventBus.registerEventListener(EventKey.SELECTED_RAIDER, () => this.selectSubPanel(selectRaiderPanel))
        EventBus.registerEventListener(EventKey.SELECTED_VEHICLE, () => this.selectSubPanel(selectVehiclePanel))
    }

    reset() {
        super.reset()
        this.relX = this.xOut
        this.relY = this.yOut
        this.movedIn = false
        this.updatePosition()
        this.mainPanel.relX = this.mainPanel.xOut
        this.mainPanel.relY = this.mainPanel.yOut
        this.mainPanel.movedIn = false
        this.mainPanel.updatePosition()
    }

    addSubPanel<T extends IconSubPanel>(childPanel: T): T {
        this.addChild(childPanel)
        this.subPanels.push(childPanel)
        return childPanel
    }

    selectSubPanel(targetPanel: IconSubPanel) {
        this.subPanels.forEach((subPanel) => subPanel !== targetPanel && subPanel.setMovedIn(true))
        targetPanel.setMovedIn(false)
    }

    onSelectedSurfaceChange(surface: Surface) {
        if (surface.surfaceType.floor) {
            if (surface.hasRubble()) {
                this.selectSubPanel(this.selectRubblePanel)
            } else {
                this.selectSubPanel(this.selectFloorPanel)
            }
        } else {
            this.selectSubPanel(this.selectWallPanel)
        }
    }

}
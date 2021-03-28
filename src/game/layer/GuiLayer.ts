import { ScaledLayer } from '../../screen/ScreenLayer'
import { ResourceManager } from '../../resource/ResourceManager'
import { InfoDockPanel, Panel, TopPanel } from '../gui/ingame/panel/Panel'
import { BaseElement } from '../gui/base/BaseElement'
import { RadarPanel } from '../gui/ingame/panel/RadarPanel'
import { MessagePanel } from '../gui/ingame/panel/MessagePanel'
import { PanelCrystalSideBar } from '../gui/ingame/panel/PanelCrystalSideBar'
import { MainPanel } from '../gui/ingame/panel/MainPanel'

export class GuiLayer extends ScaledLayer {

    rootElement: BaseElement = new BaseElement()
    panelRadar: RadarPanel
    panelMessages: MessagePanel
    panelMessagesSide: Panel
    panelCrystalSideBar: PanelCrystalSideBar
    panelTopPanel: TopPanel
    panelInformation: Panel
    panelPriorityList: Panel
    panelCameraControl: Panel
    panelInfoDock: InfoDockPanel
    panelEncyclopedia: Panel
    panelIcons: MainPanel

    constructor() {
        super()
        const panelsCfg = ResourceManager.cfg('Panels640x480')
        const buttonsCfg = ResourceManager.cfg('Buttons640x480')
        const layer = this
        this.rootElement.notifyRedraw = () => layer.redraw() // TODO performance only redraw updated parts
        // created in reverse order compared to cfg, earlier in cfg means higher z-value // TODO add some z layering at least to panels
        this.panelEncyclopedia = this.addPanel(new Panel('Panel_Encyclopedia', panelsCfg, buttonsCfg))
        this.panelInfoDock = this.addPanel(new InfoDockPanel('Panel_InfoDock', panelsCfg, buttonsCfg))
        this.panelCameraControl = this.addPanel(new Panel('Panel_CameraControl', panelsCfg, buttonsCfg))
        this.panelPriorityList = this.addPanel(new Panel('Panel_PriorityList', panelsCfg, buttonsCfg))
        this.panelInformation = this.addPanel(new Panel('Panel_Information', panelsCfg, buttonsCfg))
        this.panelTopPanel = this.addPanel(new TopPanel('Panel_TopPanel', panelsCfg, buttonsCfg))
        this.panelIcons = this.addPanel(new MainPanel())
        this.panelCrystalSideBar = this.addPanel(new PanelCrystalSideBar('Panel_CrystalSideBar', panelsCfg, buttonsCfg))
        this.panelMessagesSide = this.addPanel(new Panel('Panel_MessagesSide', panelsCfg, buttonsCfg))
        this.panelMessages = this.addPanel(new MessagePanel('Panel_Messages', panelsCfg, buttonsCfg))
        this.panelRadar = this.addPanel(new RadarPanel('Panel_Radar', panelsCfg, buttonsCfg))
        // link panels
        this.panelTopPanel.btnPriorities.onClick = () => {
            const pressed = this.panelTopPanel.btnPriorities.pressed // TODO this requires toggle buttons
            // this.panelIcons.setMovedIn(!pressed, () => this.panelPriorityList.setMovedIn(pressed));
        }
        this.onRedraw = (context: CanvasRenderingContext2D) => {
            context.clearRect(0, 0, context.canvas.width, context.canvas.height)
            this.rootElement.onRedraw(context)
        }
    }

    addPanel<T extends Panel>(panel: T): T {
        this.rootElement.addChild(panel)
        return panel
    }

    handlePointerEvent(eventType: string, event: PointerEvent): boolean {
        const [cx, cy] = this.toCanvasCoords(event.clientX, event.clientY)
        const [sx, sy] = this.toScaledCoords(event.clientX, event.clientY)
        const hit = this.context && this.context.getImageData(cx, cy, 1, 1).data[3] > 0
        let needsRedraw = false
        if (hit) {
            event.preventDefault()
            if (eventType === 'pointermove') {
                needsRedraw = this.rootElement.checkHover(sx, sy) || needsRedraw
            } else if (eventType === 'pointerdown') {
                needsRedraw = this.rootElement.checkClick(sx, sy) || needsRedraw
            } else if (eventType === 'pointerup') {
                needsRedraw = this.rootElement.checkRelease(sx, sy) || needsRedraw
            }
        } else if (eventType === 'pointermove') {
            needsRedraw = this.rootElement.release() || needsRedraw
        }
        if (needsRedraw) this.redraw() // TODO performance: only redraw certain buttons/panels?
        return hit
    }

    handleWheelEvent(eventType: string, event: WheelEvent): boolean {
        const [cx, cy] = this.toCanvasCoords(event.clientX, event.clientY)
        return !this.context || this.context.getImageData(cx, cy, 1, 1).data[3] > 0
    }

}

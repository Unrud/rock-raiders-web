import { SAMPLE } from '../audio/Sample'
import { SoundManager } from '../audio/SoundManager'
import { MenuLabelItemCfg } from '../cfg/MenuLabelItemCfg'
import { SpriteContext, SpriteImage } from '../core/Sprite'
import { ChangeTooltip, HideTooltip } from '../event/GuiCommand'
import { ResourceManager } from '../resource/ResourceManager'
import { MainMenuBaseItem } from './MainMenuBaseItem'
import { MainMenuLayer } from './MainMenuLayer'
import { UiElementCallback } from './UiElementState'
import { TOOLTIP_DELAY_TEXT_MENU } from '../params'
import { GameConfig } from '../cfg/GameConfig'
import { EventBroker } from '../event/EventBroker'

export class MainMenuIconButton extends MainMenuBaseItem {
    imgNormal: SpriteImage = null
    imgHover: SpriteImage = null
    imgPressed: SpriteImage = null

    constructor(layer: MainMenuLayer, cfg: MenuLabelItemCfg) {
        super()
        this.imgNormal = ResourceManager.getImage(cfg.imgNormal)
        this.imgHover = ResourceManager.getImage(cfg.imgHover)
        this.imgPressed = ResourceManager.getImage(cfg.imgPressed)
        const tooltipText = GameConfig.instance.getTooltipText(cfg.tooltipKey)
        this.state.onShowTooltip = () => EventBroker.publish(new ChangeTooltip(tooltipText, TOOLTIP_DELAY_TEXT_MENU))
        this.state.onHideTooltip = () => EventBroker.publish(new HideTooltip(tooltipText))
        this.width = Math.max(this.imgNormal.width, this.imgHover.width, this.imgPressed.width)
        this.height = Math.max(this.imgNormal.height, this.imgHover.height, this.imgPressed.height)
        this.x = layer.cfg.autoCenter ? (layer.fixedWidth - this.width) / 2 : layer.cfg.position[0] + cfg.x
        this.y = layer.cfg.position[1] + cfg.y
        this.actionName = cfg.actionName
        if (this.actionName?.equalsIgnoreCase('Next')) this.targetIndex = Number(cfg.target.slice('menu'.length)) - 1
    }

    set onPressed(callback: UiElementCallback) {
        super.onPressed = () => {
            SoundManager.playSample(SAMPLE.SFX_ButtonPressed, false)
            callback()
        }
    }

    draw(context: SpriteContext) {
        super.draw(context)
        let img = this.imgNormal
        if (this.state.hover) img = this.imgHover
        if (this.state.pressed) img = this.imgPressed
        context.drawImage(img, this.x, this.y)
    }
}

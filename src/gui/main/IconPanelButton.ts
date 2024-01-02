import { MenuItemCfg } from '../../cfg/ButtonCfg'
import { BaseElement } from '../base/BaseElement'
import { Button } from '../base/Button'
import { ChangeTooltip } from '../../event/GuiCommand'
import { DEV_MODE, TOOLTIP_DELAY_SFX, TOOLTIP_DELAY_TEXT_MENU } from '../../params'
import { SpriteContext, SpriteImage } from '../../core/Sprite'
import { EntityType, getEntityTypeByName } from '../../game/model/EntityType'
import { EventKey } from '../../event/EventKeyEnum'
import { BuildingsChangedEvent, RaidersAmountChangedEvent } from '../../event/LocalEvents'
import { EntityDependency, EntityDependencyChecked } from '../../cfg/GameConfig'
import { ResourceManager } from '../../resource/ResourceManager'

export class IconPanelButton extends Button {
    tooltipDisabled: string = null
    tooltipDisabledSfx: string = null
    hotkey: string = null
    isDisabled: () => boolean = () => true
    hasRaider: boolean = false
    discoveredBuildingsMaxLevel: Map<EntityType, number> = new Map()
    dependencyTooltipImage: SpriteImage = null
    showDependencies: boolean = false
    hasUnfulfilledDependency: boolean = false

    constructor(parent: BaseElement, menuItemCfg: MenuItemCfg, itemKey: string, parentWidth: number, menuIndex: number) {
        super(parent, menuItemCfg)
        this.buttonType = itemKey
        this.relX = parentWidth - 59
        this.relY = 9 + this.height * menuIndex
        this.hoverFrame = true
        this.tooltipDisabled = menuItemCfg.tooltipDisabled
        this.tooltipDisabledSfx = menuItemCfg.tooltipDisabledSfx
        this.hotkey = menuItemCfg.hotkey
        this.onClick = () => console.log(`menu item pressed: ${this.buttonType}`)
        this.addDependencyCheck(getEntityTypeByName(itemKey))
    }

    addDependencyCheck(entityType: EntityType) {
        if (!entityType) return
        const dependencies = ResourceManager.configuration.dependencies.get(entityType)
        if (!dependencies) return
        if (dependencies.some((d) => d.entityType === EntityType.PILOT)) {
            this.registerEventListener(EventKey.RAIDER_AMOUNT_CHANGED, (event: RaidersAmountChangedEvent) => {
                this.hasRaider = event.hasRaider
                this.updateDependenciesSprite(dependencies)
            })
        }
        this.registerEventListener(EventKey.BUILDINGS_CHANGED, (event: BuildingsChangedEvent) => {
            this.discoveredBuildingsMaxLevel = event.discoveredBuildingsMaxLevel
            this.updateDependenciesSprite(dependencies)
        })
    }

    private updateDependenciesSprite(dependencies: EntityDependency[]) {
        const checked: EntityDependencyChecked[] = dependencies.map((d: EntityDependency): EntityDependencyChecked => ({
            entityType: d.entityType,
            itemKey: d.itemKey,
            minLevel: d.minLevel,
            isOk: (d.entityType === EntityType.PILOT && this.hasRaider)
                || (this.discoveredBuildingsMaxLevel.getOrDefault(d.entityType, -1) >= d.minLevel),
        }))
        this.hasUnfulfilledDependency = !DEV_MODE && checked.some((d) => !d.isOk)
        ResourceManager.createDependenciesSprite(checked).then((dependencySprite) => this.dependencyTooltipImage = dependencySprite)
        this.updateState(true)
    }

    showTooltipDisabled() {
        super.showTooltipDisabled()
        if (this.tooltipDisabled || this.tooltipDisabledSfx) {
            this.publishEvent(new ChangeTooltip(this.tooltipDisabled, TOOLTIP_DELAY_TEXT_MENU, this.tooltipDisabledSfx, TOOLTIP_DELAY_SFX))
        }
    }

    reset() {
        super.reset()
        this.hasUnfulfilledDependency = false
        this.hasRaider = false
        this.discoveredBuildingsMaxLevel = new Map()
        this.updateState(false)
    }

    updateState(autoRedraw: boolean = true) {
        const targetState = this.isDisabled()
        const stateChanged = this.disabled !== targetState
        this.disabled = targetState
        if (stateChanged && autoRedraw) this.notifyRedraw()
        return stateChanged
    }

    onRedraw(context: SpriteContext) {
        super.onRedraw(context)
        if (this.showDependencies && this.dependencyTooltipImage) {
            context.drawImage(this.dependencyTooltipImage, this.x - this.dependencyTooltipImage.width, this.y + (this.imgNormal.height - this.dependencyTooltipImage.height) / 2)
        }
    }

    isInRect(sx: number, sy: number): boolean {
        const inRect = super.isInRect(sx, sy)
        this.showDependencies = inRect
        return inRect
    }
}

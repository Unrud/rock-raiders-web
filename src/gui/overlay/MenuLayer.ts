import { MenuEntryCfg } from '../../cfg/MenuEntryCfg'
import { BitmapFont } from '../../core/BitmapFont'
import { SpriteContext, SpriteImage } from '../../core/Sprite'
import { NATIVE_SCREEN_HEIGHT, NATIVE_SCREEN_WIDTH } from '../../params'
import { OffscreenCache } from '../../worker/OffscreenCache'
import { BaseElement } from '../base/BaseElement'
import { MenuCycleItem } from './MenuCycleItem'
import { MenuLabelItem } from './MenuLabelItem'
import { MenuSliderItem } from './MenuSliderItem'

export class MenuLayer extends BaseElement {
    menuImage: SpriteImage
    titleImage: SpriteImage
    loFont: BitmapFont
    hiFont: BitmapFont
    itemsTrigger: MenuLabelItem[] = []
    itemsNext: MenuLabelItem[] = []
    itemsCycle: MenuCycleItem[] = []
    itemsSlider: MenuSliderItem[] = []

    constructor(parent: BaseElement, menuCfg: MenuEntryCfg) {
        super(parent)
        this.relX = menuCfg.position[0]
        this.relY = menuCfg.position[1]
        this.menuImage = OffscreenCache.getImageOrNull(menuCfg.menuImage[0]) // menuImage has 4 parameter here
        this.titleImage = OffscreenCache.getBitmapFont(menuCfg.menuFont).createTextImage(menuCfg.fullName)
        this.loFont = OffscreenCache.getBitmapFont(menuCfg.loFont)
        this.hiFont = OffscreenCache.getBitmapFont(menuCfg.hiFont)
        menuCfg.itemsLabel.forEach((itemCfg) => {
            const item = this.addChild(new MenuLabelItem(this, itemCfg, menuCfg.autoCenter))
            if (itemCfg.actionName.toLowerCase() === 'trigger') {
                this.itemsTrigger.push(item)
            } else {
                this.itemsNext.push(item)
            }
        })
        this.itemsCycle = menuCfg.itemsCycle.map((itemCfg) => this.addChild(new MenuCycleItem(this, itemCfg)))
        this.itemsSlider = menuCfg.itemsSlider.map((itemCfg) => this.addChild(new MenuSliderItem(this, itemCfg)))
        this.hidden = true
    }

    reset() {
        super.reset()
        this.hidden = true
    }

    onRedraw(context: SpriteContext) {
        if (this.hidden) return
        context.drawImage(this.menuImage, (NATIVE_SCREEN_WIDTH - this.menuImage.width) / 2, (NATIVE_SCREEN_HEIGHT - this.menuImage.height) / 2)
        context.drawImage(this.titleImage, (NATIVE_SCREEN_WIDTH - this.titleImage.width) / 2, this.y)
        super.onRedraw(context)
    }
}

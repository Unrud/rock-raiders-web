import { PanelCfg } from '../../cfg/PanelCfg'
import { BitmapFont } from '../../core/BitmapFont'
import { SpriteContext, SpriteImage } from '../../core/Sprite'
import { OffscreenCache } from '../../worker/OffscreenCache'
import { BaseElement } from '../base/BaseElement'
import { Panel } from '../base/Panel'

export class InformationPanel extends Panel {
    font: BitmapFont = null
    textImage: SpriteImage = null

    constructor(parent: BaseElement, panelCfg: PanelCfg) {
        super(parent, panelCfg)
        this.font = OffscreenCache.getDefaultFont()
    }

    setText(text?: string) {
        this.textImage = this.font.createTextImage(text, this.img.width - 80)
        this.notifyRedraw()
    }

    onRedraw(context: SpriteContext) {
        super.onRedraw(context)
        if (this.textImage) context.drawImage(this.textImage, this.x + (this.img.width - this.textImage.width) / 2, this.y + 12)
    }
}

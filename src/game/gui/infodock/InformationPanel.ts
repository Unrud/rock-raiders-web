import { Panel } from '../base/Panel'
import { PanelCfg } from '../../../cfg/PanelsCfg'
import { ResourceManager } from '../../../resource/ResourceManager'
import { BitmapFont } from '../../../core/BitmapFont'

export class InformationPanel extends Panel {

    font: BitmapFont = null
    textImage = null

    constructor(panelCfg: PanelCfg) {
        super(panelCfg)
        this.font = ResourceManager.getBitmapFont('Interface/Fonts/Font5_Hi.bmp')
    }

    setText(text?: string) {
        this.textImage = text ? this.font.createTextImage(text, this.img.width - 80) : null
        this.notifyRedraw()
    }

    onRedraw(context: CanvasRenderingContext2D) {
        super.onRedraw(context)
        if (this.textImage) context.drawImage(this.textImage, this.x + (this.img.width - this.textImage.width) / 2, this.y + 12)
    }

}
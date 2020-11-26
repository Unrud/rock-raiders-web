import { ResourceManager } from '../resource/ResourceManager';
import { MainMenuLabelButton } from './MainMenuLabelButton';
import { ScaledLayer } from '../screen/ScreenLayer';
import { MenuCfg } from '../resource/wadworker/MenuCfg';
import { BitmapFont } from '../core/BitmapFont';
import { MOUSE_BUTTON } from '../event/EventManager';
import { MainMenuScreen } from '../screen/MainMenuScreen';
import { MainMenuIconButton } from './MainMenuIconButton';
import { MainMenuBaseItem } from './MainMenuBaseItem';
import { MainMenuLevelButton } from './MainMenuLevelButton';

export class MainMenuLayer extends ScaledLayer {

    screen: MainMenuScreen;
    cfg: MenuCfg;
    fullName: string;
    titleImage: HTMLCanvasElement;
    title: string;
    menuFont: BitmapFont;
    loFont: BitmapFont;
    hiFont: BitmapFont;
    menuImage: HTMLCanvasElement;
    items: MainMenuBaseItem[] = [];
    scrollY: number = 0;

    constructor(screen: MainMenuScreen, menuCfg: MenuCfg) {
        super();
        this.screen = screen;
        this.cfg = menuCfg;
        this.fullName = menuCfg.fullName.replace(/_/g, ' ');
        this.title = menuCfg.title.replace(/_/g, ' ');
        this.menuFont = menuCfg.menuFont ? ResourceManager.getBitmapFont(menuCfg.menuFont) : null;
        this.loFont = menuCfg.loFont ? ResourceManager.getBitmapFont(menuCfg.loFont) : null;
        this.hiFont = menuCfg.hiFont ? ResourceManager.getBitmapFont(menuCfg.hiFont) : null;
        this.menuImage = menuCfg.menuImage ? ResourceManager.getImage(menuCfg.menuImage) : null;
        this.titleImage = this.loFont.createTextImage(this.fullName);

        menuCfg.items.forEach((item) => {
            if (item.label) {
                this.items.push(new MainMenuLabelButton(this, item));
            } else {
                this.items.push(new MainMenuIconButton(this, item));
            }
        });

        this.items.sort((a, b) => MainMenuBaseItem.compareZ(a, b));

        this.onRedraw = (context) => {
            context.drawImage(this.menuImage, 0, -this.scrollY);
            if (menuCfg.displayTitle) context.drawImage(this.titleImage, (this.fixedWidth - this.titleImage.width) / 2, this.cfg.position[1]);
            this.items.forEach((item, index) => (this.items[this.items.length - 1 - index]).draw(context));
        };
    }

    handlePointerEvent(eventType: string, event: PointerEvent): boolean {
        if (eventType === 'pointermove') { // TODO scroll when close to menu top/bottom border
            const [sx, sy] = this.toScaledCoords(event.clientX, event.clientY);
            let hovered = false;
            this.items.forEach((item) => {
                if (!hovered) {
                    const absY = sy + (item.scrollAffected ? this.scrollY : 0);
                    hovered = item.checkHover(sx, absY);
                } else {
                    if (item.hover) item.needsRedraw = true;
                    item.hover = false;
                    item.setReleased();
                }
            });
        } else if (eventType === 'pointerdown') {
            if (event.button === MOUSE_BUTTON.MAIN) {
                this.items.forEach((item) => item.checkSetPressed());
            }
        } else if (eventType === 'pointerup') {
            if (event.button === MOUSE_BUTTON.MAIN) {
                this.items.forEach((item) => {
                    if (item.pressed) {
                        item.setReleased();
                        if (item.actionName.toLowerCase() === 'next') {
                            this.screen.showMainMenu(item.targetIndex);
                        } else if (item.actionName.toLowerCase() === 'selectlevel') {
                            this.screen.selectLevel((item as MainMenuLevelButton).levelKey);
                        } else if (item.actionName) {
                            console.warn('not implemented: ' + item.actionName + ' - ' + item.targetIndex);
                        }
                    }
                });
            }
        }
        if (this.needsRedraw()) this.redraw();
        return false;
    }

    handleWheelEvent(eventType: string, event: WheelEvent): boolean {
        if (!this.cfg.canScroll) return false;
        this.scrollY = Math.min(Math.max(this.scrollY + event.deltaY, 0), this.menuImage.height - this.fixedHeight);
        this.redraw();
        return true;
    }

    needsRedraw(): boolean {
        return this.items.some((item) => item.needsRedraw);
    }

}
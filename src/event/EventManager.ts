import { ScreenLayer } from '../screen/ScreenLayer'
import { BaseScreen } from '../screen/BaseScreen'

// noinspection JSUnusedGlobalSymbols
export enum MOUSE_BUTTON {
    MAIN = 0,
    MIDDLE = 1,
    SECONDARY = 2
}

export enum POINTER_EVENT {
    MOVE,
    DOWN,
    UP,
}

export enum KEY_EVENT {
    DOWN,
    UP,
}

export class EventManager {

    constructor(screen: BaseScreen) {
        screen.gameCanvasContainer.addEventListener('contextmenu', (event: MouseEvent) => {
            if (screen.isInRect(event)) event.preventDefault()
        })
        new Map<string, POINTER_EVENT>([
            ['pointermove', POINTER_EVENT.MOVE],
            ['pointerdown', POINTER_EVENT.DOWN],
            ['pointerup', POINTER_EVENT.UP],
        ]).forEach((eventEnum, eventType) => {
            screen.gameCanvasContainer.addEventListener(eventType, (event: PointerEvent) => {
                if (!screen.isInRect(event)) return
                event.preventDefault()
                // all event attibutes used by controls: clientX, clientY, deltaY, keyCode, touches, pointerType, button, ctrlKey, metaKey, shiftKey
                const nonBubblingClone = new PointerEvent(event.type, {
                    bubbles: false, // disable bubbling otherwise we'll trigger this same event handler again
                    clientX: event.clientX,
                    clientY: event.clientY,
                    pointerType: event.pointerType,
                    button: event.button,
                    ctrlKey: event.ctrlKey,
                    metaKey: event.metaKey,
                    shiftKey: event.shiftKey,
                })
                screen.layers.filter(l => l.isActive())
                    .sort((a, b) => ScreenLayer.compareZ(a, b))
                    .some(l => l.handlePointerEvent(eventEnum, nonBubblingClone))
            })
        })
        new Map<string, KEY_EVENT>([
            ['keydown', KEY_EVENT.DOWN],
            ['keyup', KEY_EVENT.UP],
        ]).forEach((eventEnum, eventType) => {
            screen.gameCanvasContainer.addEventListener(eventType, (event: KeyboardEvent) => {
                // event.preventDefault(); // otherwise page reload with F5 stops working (may be intended in future)
                screen.layers.filter(l => l.isActive())
                    .sort((a, b) => ScreenLayer.compareZ(a, b))
                    .some(l => l.handleKeyEvent(eventEnum, event))
            })
        })
        screen.gameCanvasContainer.addEventListener('wheel', (event: WheelEvent) => {
            if (!screen.isInRect(event)) return
            // all event attibutes used by controls: clientX, clientY, deltaY, keyCode, touches, pointerType, button, ctrlKey, metaKey, shiftKey
            const nonBubblingClone = new WheelEvent(event.type, {
                bubbles: false, // disable bubbling otherwise we'll trigger this same event handler again
                clientX: event.clientX,
                clientY: event.clientY,
                deltaX: event.deltaX,
                deltaY: event.deltaY,
                deltaZ: event.deltaZ,
                button: event.button,
                ctrlKey: event.ctrlKey,
                metaKey: event.metaKey,
                shiftKey: event.shiftKey,
            })
            screen.layers.filter(l => l.isActive())
                .sort((a, b) => ScreenLayer.compareZ(a, b))
                .some(l => l.handleWheelEvent(nonBubblingClone))
        })
    }

}

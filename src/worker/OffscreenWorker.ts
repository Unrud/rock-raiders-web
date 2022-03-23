import { EventKey } from '../event/EventKeyEnum'
import { GameEvent } from '../event/GameEvent'
import { GameKeyboardEvent } from '../event/GameKeyboardEvent'
import { GamePointerEvent } from '../event/GamePointerEvent'
import { GameWheelEvent } from '../event/GameWheelEvent'
import { IEventHandler } from '../event/IEventHandler'
import { OffscreenCache } from './OffscreenCache'
import { NATIVE_SCREEN_HEIGHT, NATIVE_SCREEN_WIDTH } from '../params'
import { WorkerMessageType } from '../resource/wadworker/WorkerMessageType'
import { OffscreenWorkerMessage } from './OffscreenWorkerMessage'
import { WorkerEventResponse } from './WorkerEventResponse'
import { WorkerPublishEvent } from './WorkerPublishEvent'
import { WorkerResponse } from './WorkerResponse'

export abstract class OffscreenWorker implements IEventHandler {
    readonly eventListener = new Map<EventKey, ((event: GameEvent) => any)[]>()

    canvas: OffscreenCanvas = null
    context: OffscreenCanvasRenderingContext2D = null

    constructor(readonly worker: Worker) {
    }

    redraw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
    }

    abstract reset(): void

    abstract onCacheReady(): void

    setCanvas(canvas: OffscreenCanvas) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.context.scale(this.canvas.width / NATIVE_SCREEN_WIDTH, this.canvas.height / NATIVE_SCREEN_HEIGHT)
        this.redraw()
    }

    handlePointerEvent(event: GamePointerEvent): boolean {
        return false
    }

    handleKeyEvent(event: GameKeyboardEvent): boolean {
        return false
    }

    handleWheelEvent(event: GameWheelEvent): boolean {
        return false
    }

    sendResponse(response: WorkerResponse) {
        this.worker.postMessage(response)
    }

    sendEventResponse(response: WorkerEventResponse) {
        this.sendResponse(response)
    }

    processMessage(msg: OffscreenWorkerMessage) {
        if (msg.type === WorkerMessageType.INIT) {
            OffscreenCache.resourceByName = msg.resourceByName
            OffscreenCache.configuration = msg.cfg
            this.onCacheReady()
        } else if (msg.type === WorkerMessageType.CANVAS) {
            this.setCanvas(msg.canvas)
        } else if (msg.type === WorkerMessageType.EVENT_POINTER) {
            const consumed = this.handlePointerEvent(msg.inputEvent as GamePointerEvent)
            this.sendEventResponse({
                type: WorkerMessageType.RESPONSE_EVENT,
                eventId: msg.eventId,
                eventConsumed: consumed,
            })
        } else if (msg.type === WorkerMessageType.EVENT_KEY) {
            const consumed = this.handleKeyEvent(msg.inputEvent as GameKeyboardEvent)
            this.sendEventResponse({
                type: WorkerMessageType.RESPONSE_EVENT,
                eventId: msg.eventId,
                eventConsumed: consumed,
            })
        } else if (msg.type === WorkerMessageType.EVENT_WHEEL) {
            const consumed = this.handleWheelEvent(msg.inputEvent as GameWheelEvent)
            this.sendEventResponse({
                type: WorkerMessageType.RESPONSE_EVENT,
                eventId: msg.eventId,
                eventConsumed: consumed,
            })
        } else if (msg.type === WorkerMessageType.RESET) {
            this.reset()
        } else if (msg.type === WorkerMessageType.REDRAW) {
            this.redraw()
        } else if (msg.type === WorkerMessageType.GAME_EVENT) {
            const event = msg.gameEvent
            this.eventListener.getOrUpdate(event.eventKey, () => []).forEach((callback) => callback(event))
        } else if (!this.onProcessMessage(msg)) {
            console.warn(`Worker ignores message of type: ${WorkerMessageType[msg.type]}`)
        }
        return true
    }

    publishEvent(event: GameEvent): void {
        this.sendResponse(new WorkerPublishEvent(event))
    }

    registerEventListener(eventKey: EventKey, callback: (event: GameEvent) => any): void {
        this.eventListener.getOrUpdate(eventKey, () => []).push(callback)
    }

    abstract onProcessMessage(msg: OffscreenWorkerMessage): boolean
}

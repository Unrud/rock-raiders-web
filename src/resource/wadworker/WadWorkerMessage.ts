import { GameStatsCfg } from '../../cfg/GameStatsCfg'
import { WorldEvent } from '../../event/WorldEvents'
import { WorkerMessageType } from './WorkerMessageType'

export class WadWorkerMessage {

    type: WorkerMessageType = null
    text?: string
    resourceByName?: Map<string, any>
    cfg?: any
    stats?: any
    totalResources?: number
    assetNames?: string[]
    assetObj?: any
    loadingTimeSeconds?: string
    messageState?: boolean
    worldEvent?: WorldEvent

    constructor(type: WorkerMessageType) {
        this.type = type
    }

    static createTextMessage(msg: string): WadWorkerMessage {
        return {type: WorkerMessageType.MSG, text: msg}
    }

    static createCfgLoaded(cfg: any, totalResources: number): WadWorkerMessage {
        return {
            type: WorkerMessageType.CFG,
            cfg: cfg,
            stats: new GameStatsCfg(cfg['Stats']),
            totalResources: totalResources,
        }
    }

    static createAssetLoaded(assetIndex: number, assetNames: string[], assetObj: any): WadWorkerMessage {
        return {type: WorkerMessageType.ASSET, assetNames: assetNames, assetObj: assetObj}
    }

    static createLoadDone(totalResources: number, loadingTimeSeconds: string): WadWorkerMessage {
        return {type: WorkerMessageType.DONE, totalResources: totalResources, loadingTimeSeconds: loadingTimeSeconds}
    }

}

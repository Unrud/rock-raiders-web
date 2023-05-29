import { LevelEntryCfg, LevelRewardConfig } from '../../cfg/LevelsCfg'
import { ADDITIONAL_RAIDER_PER_SUPPORT } from '../../params'
import { EntityManager } from '../EntityManager'
import { GameState } from './GameState'

export enum GameResultState {
    UNDECIDED,
    QUIT,
    COMPLETE,
    FAILED,
}

export class GameResult {
    levelFullName: string
    numBuildings: number
    numRaiders: number
    numMaxRaiders: number
    defencePercent: number
    airLevelPercent: number
    score: number
    // fields below are only used to debug score calculations
    rewardConfig: LevelRewardConfig = null
    scoreCrystals: number = 0
    scoreTimer: number = 0
    scoreCaverns: number = 0
    scoreConstructions: number = 0
    scoreOxygen: number = 0
    scoreFigures: number = 0

    constructor(
        readonly levelName: string,
        levelConf: LevelEntryCfg,
        readonly state: GameResultState,
        entityMgr: EntityManager,
        readonly gameTimeSeconds: number,
        readonly screenshot: HTMLCanvasElement
    ) {
        this.levelFullName = levelConf.fullName
        this.numBuildings = entityMgr.buildings.length
        this.numRaiders = entityMgr.raiders.length
        this.numMaxRaiders = entityMgr.getMaxRaiders()
        this.defencePercent = 100 // TODO defence report is either 0% or 100%
        this.airLevelPercent = GameState.airLevel * 100
        this.rewardConfig = levelConf?.reward
        if (this.rewardConfig) {
            const quota = this.rewardConfig.quota
            const importance = this.rewardConfig.importance
            this.scoreCrystals = GameState.numCrystal >= (quota.crystals || Infinity) ? importance.crystals : 0
            this.scoreTimer = this.gameTimeSeconds <= (quota.timer || 0) ? importance.timer : 0
            this.scoreCaverns = quota.caverns ? Math.min(1, GameState.discoveredCaverns / quota.caverns) * importance.caverns : 0
            this.scoreConstructions = quota.constructions ? Math.min(1, this.numBuildings / quota.constructions) * importance.constructions : 0
            this.scoreOxygen = GameState.airLevel * importance.oxygen
            this.scoreFigures = this.numRaiders >= ADDITIONAL_RAIDER_PER_SUPPORT ? importance.figures : 0
            this.score = Math.max(0, Math.min(100, Math.round(this.scoreCrystals + this.scoreTimer + this.scoreCaverns + this.scoreConstructions + this.scoreOxygen + this.scoreFigures)))
        }
    }
}

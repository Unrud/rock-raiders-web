import { PriorityIdentifier, priorityIdentifierFromString } from '../game/model/job/PriorityIdentifier'
import { BaseConfig } from './BaseConfig'

export class LevelsCfg extends BaseConfig {
    levelCfgByName: Map<string, LevelEntryCfg> = new Map()

    setFromCfgObj(cfgObj: any): this {
        Object.keys(cfgObj).forEach((levelKey) => {
            if (!levelKey.startsWith('Tutorial') && !levelKey.startsWith('Level')) return // ignore incomplete test levels and duplicates
            this.levelCfgByName.set(levelKey, new LevelEntryCfg().setFromCfgObj(cfgObj[levelKey]))
        })
        return this
    }
}

export class LevelEntryCfg extends BaseConfig {
    fullName: string = ''
    endGameAvi1: string = ''
    endGameAvi2: string = ''
    allowRename: boolean = false
    recallOLObjects: boolean = false
    generateSpiders: boolean = false
    video: string = ''
    disableEndTeleport: boolean = false
    disableStartTeleport: boolean = false
    emergeTimeOut: number = 0
    boulderAnimation: any = ''
    noMultiSelect: boolean = false
    noAutoEat: boolean = false
    disableToolTipSound: boolean = false
    blockSize: number = 40
    digDepth: number = 40
    roughLevel: number = 6
    roofHeight: number = 40
    useRoof: string = ''
    selBoxHeight: number = 10
    fpRotLightRGB: any = ''
    fogColourRGB: any = ''
    highFogColourRGB: any = ''
    fogRate: number = 0
    fallinMultiplier: number = 0
    numberOfLandSlidesTillCaveIn: number = 0
    noFallins: boolean = false
    oxygenRate: number = 0 // 0 - 100
    surfaceMap: string = ''
    predugMap: string = ''
    terrainMap: string = ''
    emergeMap: string = ''
    erodeMap: string = ''
    fallinMap: string = ''
    blockPointersMap: string = ''
    cryOreMap: string = ''
    pathMap: string = ''
    noGather: boolean = false
    textureSet: string = null
    rockFallStyle: string = ''
    emergeCreature: string = ''
    safeCaverns: boolean = true
    seeThroughWalls: boolean = false
    oListFile: string = ''
    ptlFile: string = ''
    nerpFile: string = ''
    nerpMessageFile: string = ''
    objectiveText: string = ''
    objectiveImage640x480: ObjectiveImageCfg = null
    erodeTriggerTime: number = 0 // 1, 20, 40, 60, 120 time in seconds until erosion starts after level start
    erodeErodeTime: number = 0 // 1, 5, 7, 20, 30, 40, 60 time in seconds until next erosion level is reached
    erodeLockTime: number = 0 // 1, 300, 500, 600 grace time no erosion happens on surface with power path
    nextLevel: any = ''
    levelLinks: any = ''
    frontEndX: number = 0
    frontEndY: number = 0
    frontEndOpen: boolean = false
    priorities: LevelPrioritiesEntryConfig[] = [] // priority order matters!
    reward: LevelRewardConfig = null
    menuBMP: string[] = []

    parseValue(unifiedKey: string, cfgValue: any): any {
        if (unifiedKey === 'fullName'.toLowerCase()) {
            return cfgValue.replace(/_/g, ' ')
        } else if (unifiedKey === 'priorities') {
            return Object.entries<boolean>(cfgValue)
                .filter(([name]) => !name.equalsIgnoreCase('AI_Priority_GetTool')) // not used in the game
                .map(([name, enabled]) => new LevelPrioritiesEntryConfig(name, enabled))
        } else if (unifiedKey === 'reward') {
            return new LevelRewardConfig().setFromCfgObj(cfgValue)
        } else if (unifiedKey === 'objectiveimage640x480') {
            return new ObjectiveImageCfg(cfgValue)
        } else if (unifiedKey === 'textureset') {
            return (Array.isArray(cfgValue) ? cfgValue[0] : cfgValue).toLowerCase()
        } else {
            return super.parseValue(unifiedKey, cfgValue)
        }
    }
}

export class LevelPrioritiesEntryConfig {
    key: PriorityIdentifier
    enabled: boolean

    constructor(name: string, enabled: boolean) {
        this.key = priorityIdentifierFromString(name)
        this.enabled = enabled
    }
}

export class LevelRewardConfig extends BaseConfig {
    enable: boolean = true
    modifier: number = null
    importance: LevelRewardImportanceConfig = null
    quota: LevelRewardQuotaConfig = null

    parseValue(unifiedKey: string, cfgValue: any): any {
        if (unifiedKey === 'importance') {
            return new LevelRewardImportanceConfig().setFromCfgObj(cfgValue)
        } else if (unifiedKey === 'quota') {
            return new LevelRewardQuotaConfig().setFromCfgObj(cfgValue)
        } else {
            return super.parseValue(unifiedKey, cfgValue)
        }
    }
}

export class LevelRewardImportanceConfig extends BaseConfig {
    crystals: number = 0
    timer: number = 0
    caverns: number = 0
    constructions: number = 0
    oxygen: number = 0
    figures: number = 0
}

export class LevelRewardQuotaConfig extends BaseConfig {
    crystals: number = 0
    timer: number = 0
    caverns: number = 0
    constructions: number = 0
}

export class ObjectiveImageCfg {
    filename: string
    x: number
    y: number

    constructor(cfgValue: any) {
        [this.filename, this.x, this.y] = cfgValue
    }
}

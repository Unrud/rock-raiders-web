import { WadFileSelectionModal } from '../site/modal/WadFileSelectionModal'
import { GameState } from './game/model/GameState'
import { ResourceManager } from './resource/ResourceManager'
import { GameScreen } from './screen/GameScreen'
import { LoadingScreen } from './screen/LoadingScreen'
import { MainMenuScreen } from './screen/MainMenuScreen'
import { RewardScreen } from './screen/RewardScreen'

// define constants

export const DEV_MODE = process.env.WEBPACK_MODE === 'development'
if (DEV_MODE) console.warn('DEV MODE ACTIVE')

export const JOB_SCHEDULE_INTERVAL = 1000 // milliseconds
export const CHECK_CLEARRUBBLE_INTERVAL = 5000 // milliseconds
export const JOB_ACTION_RANGE = 5
export const CHECK_SPANW_RAIDER_TIMER = 1000 // milliseconds
export const MAX_RAIDER_BASE = 12
export const MAX_RAIDER_REQUEST = 9
export const ADDITIONAL_RAIDER_PER_SUPPORT = 10
export const UPDATE_OXYGEN_TIMER = 5000 // milliseconds

export const PANEL_ANIMATION_MULTIPLIER = 3
export const HEIGHT_MULTIPLER = 0.1
export const SEQUENCE_TEXTURE_FRAMERATE = 5

// native constants (do not change)

export const SPRITE_RESOLUTION_WIDTH = 640
export const SPRITE_RESOLUTION_HEIGHT = 480
export const TILESIZE = 40
export const NATIVE_FRAMERATE = 30

// setup and link all components

const loadingScreen = new LoadingScreen()
const wadFileSelectModal = new WadFileSelectionModal('game-container')

wadFileSelectModal.onStart = (wad0Url, wad1Url) => {
    ResourceManager.startLoadingFromUrl(wad0Url, wad1Url)
}
ResourceManager.onMessage = (msg: string) => {
    loadingScreen.setLoadingMessage(msg)
}
ResourceManager.onCacheMissed = () => {
    wadFileSelectModal.show()
}
ResourceManager.onInitialLoad = (totalResources: number) => {
    wadFileSelectModal.hide()
    loadingScreen.enableGraphicMode(totalResources)
}
ResourceManager.onAssetLoaded = () => {
    loadingScreen.increaseLoadingState()
}
ResourceManager.onLoadDone = () => {
    // complete setup
    const mainMenuScreen = new MainMenuScreen()
    const gameScreen = new GameScreen()
    const rewardScreen = new RewardScreen()

    mainMenuScreen.onLevelSelected = (levelName) => {
        try {
            gameScreen.startLevel(levelName)
        } catch (e) {
            console.error('Could not load level: ' + levelName, e)
            gameScreen.hide()
            mainMenuScreen.showLevelSelection()
        }
    }
    gameScreen.onLevelEnd = () => {
        gameScreen.hide()
        rewardScreen.show()
    }
    rewardScreen.onAdvance = () => {
        GameState.reset()
        mainMenuScreen.showLevelSelection()
    }

    // setup complete
    loadingScreen.hide()
    const params = new URLSearchParams(window.location.search)
    const entry = params.get('entry')
    if (DEV_MODE && entry) {
        GameState.numOre = Number(params.get('numOre')) || 0
        GameState.numCrystal = Number(params.get('numCrystal')) || 0
        if (entry === 'level') mainMenuScreen.showLevelSelection()
        else if (entry === 'reward') rewardScreen.show()
        else if (entry) mainMenuScreen.selectLevel(entry)
    } else {
        mainMenuScreen.showMainMenu()
    }
}

// start the game engine with loading resources

loadingScreen.show()
ResourceManager.startLoadingFromCache()

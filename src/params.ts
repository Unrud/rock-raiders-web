export const DEV_MODE = import.meta.env.MODE === 'development'
export const VERBOSE = !DEV_MODE
export const ASSET_CACHE_DB_NAME = 'RockRaidersWeb'
export const ASSET_CACHE_VERSION = 2
export const JOB_SCHEDULE_INTERVAL = 1000 // milliseconds
export const CHECK_CLEAR_RUBBLE_INTERVAL = 5000 // milliseconds
export const CHECK_SPAWN_RAIDER_TIMER = 1000 // milliseconds
export const CHECK_SPAWN_VEHICLE_TIMER = 2000 // milliseconds
export const MAX_RAIDER_BASE = 12
export const MAX_RAIDER_REQUEST = 9
export const ADDITIONAL_RAIDER_PER_SUPPORT = 10
export const PANEL_ANIMATION_MULTIPLIER = 3
export const HEIGHT_MULTIPLIER = 0.1
export const SEQUENCE_TEXTURE_INTERVAL_MS = 1000 / 5
export const KEY_PAN_SPEED = 20
export const SPIDER_SLIP_RANGE_SQ = 49
export const ITEM_ACTION_RANGE_SQ = 49
export const UPDATE_INTERVAL_MS = Math.round(1000 / 30)
export const BRICK_ORE_VALUE = 5
export const CAMERA_FOV = 40
export const CAMERA_MAX_DISTANCE = 5000
export const NUM_OF_LEVELS_TO_COMPLETE_GAME = 25
export const SAVE_GAME_SCREENSHOT_WIDTH = 160
export const SAVE_GAME_SCREENSHOT_HEIGHT = 120
export const RAIDER_CARRY_SLOWDOWN = 0.7
export const SURFACE_NUM_SEAM_LEVELS = 4
export const SURFACE_NUM_CONTAINED_ORE = 4
export const DEFAULT_GAME_SPEED_MULTIPLIER = 0.6
export const DEFAULT_SFX_VOLUME = 0.5
export const DEFAULT_MUSIC_VOLUME = 0
export const DEFAULT_GAME_BRIGHTNESS = 0.5
export const DEFAULT_SHOW_HELP_WINDOW = false
export const DEFAULT_WALL_DETAILS = true
export const DEFAULT_MUSIC_TOGGLE = false
export const DEFAULT_SFX_TOGGLE = true
export const DEFAULT_AUTO_GAME_SPEED = false
export const TOOLTIP_DELAY_TEXT_MENU = 50
export const TOOLTIP_DELAY_TEXT_SCENE = 1000
export const TOOLTIP_DELAY_SFX = 1000
export const DEFAULT_FONT_NAME = 'Interface/Fonts/Font5_Hi.bmp'
export const TOOLTIP_FONT_NAME = 'Interface/Fonts/tooltipfont.bmp'
export const MIN_CAMERA_HEIGHT_ABOVE_TERRAIN = 5
export const AIR_LEVEL_WARNING_STEP = 10 / 100 // % -> each 10 percent down triggers warning
export const AIR_LEVEL_LEVEL_LOW = 25 / 100 // % -> below 20 percent trigger low level warning
export const NERP_EXECUTION_INTERVAL = 500
export const CURSOR_MAX_HEIGHT = 32 // px; limited by browsers
export const MAP_PANEL_SURFACE_RECT_MARGIN = 1
export const MAP_MAX_UPDATE_INTERVAL = Math.round(1000 / 15)

// native constants (do not change)

export const NATIVE_SCREEN_WIDTH = 640
export const NATIVE_SCREEN_HEIGHT = 480
export const TILESIZE = 40
export const NATIVE_FRAMERATE = 30
export const NATIVE_UPDATE_INTERVAL = 1000 / NATIVE_FRAMERATE

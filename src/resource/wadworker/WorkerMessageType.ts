export enum WorkerMessageType {
    // wad worker
    MSG,
    CFG,
    CACHE_MISS,
    SFX,
    ASSET,
    DOWNLOAD_PROGRESS,
    DONE,

    // gui/scene worker
    INIT,
    RESIZE,
    RESET,
    EVENT_POINTER,
    EVENT_KEY,
    EVENT_WHEEL,
    RESPONSE_EVENT,
    OVERLAY_SETUP,
    SPACE_TO_CONTINUE,
    TOGGLE_ALARM,
    SHOW_OPTIONS,
    GAME_ABORT,
    GAME_RESTART,
    GAME_EVENT,
}

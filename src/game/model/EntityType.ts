export enum EntityType {
    NONE = 0,
    // RAIDER
    PILOT = 1, // start with 1 otherwise entity type may fail truthiness test

    // BUILDING
    TOOLSTATION,
    TELEPORT_PAD,
    DOCKS,
    POWER_STATION,
    BARRACKS,
    UPGRADE,
    GEODOME,
    ORE_REFINERY,
    GUNSTATION,
    TELEPORT_BIG,

    POWER_PATH,

    // MONSTER
    BAT,
    SMALL_SPIDER,
    SLUG,
    ROCK_MONSTER,
    ICE_MONSTER,
    LAVA_MONSTER,

    // MATERIAL
    DYNAMITE,
    ELECTRIC_FENCE,
    CRYSTAL,
    ORE,
    BRICK,
    BARRIER,

    // VEHICLE
    HOVERBOARD,
    SMALL_DIGGER,
    SMALL_TRUCK,
    SMALL_CAT,
    SMALL_MLP,
    SMALL_HELI,
    BULLDOZER,
    WALKER_DIGGER,
    LARGE_MLP,
    LARGE_DIGGER,
    LARGE_CAT,
    LARGE_HELI,

    // OTHERS
    TV_CAMERA,
    LASER_SHOT,
    FREEZER_SHOT,
    PUSHER_SHOT,
}

export type MaterialEntityType = EntityType.ORE | EntityType.CRYSTAL | EntityType.BRICK | EntityType.BARRIER | EntityType.DYNAMITE | EntityType.ELECTRIC_FENCE

export type VehicleEntityType = EntityType.HOVERBOARD | EntityType.SMALL_DIGGER | EntityType.SMALL_TRUCK | EntityType.SMALL_CAT | EntityType.SMALL_MLP | EntityType.SMALL_HELI | EntityType.BULLDOZER | EntityType.WALKER_DIGGER | EntityType.LARGE_MLP | EntityType.LARGE_DIGGER | EntityType.LARGE_CAT | EntityType.LARGE_HELI

export type MonsterEntityType = EntityType.NONE | EntityType.SMALL_SPIDER | EntityType.BAT | EntityType.SLUG | EntityType.ICE_MONSTER | EntityType.LAVA_MONSTER | EntityType.ROCK_MONSTER

export function getEntityTypeByName(type: string): EntityType {
    if ('TVCamera'.equalsIgnoreCase(type)) {
        return EntityType.TV_CAMERA
    } else if ('Pilot'.equalsIgnoreCase(type)) {
        return EntityType.PILOT
    } else if ('Toolstation'.equalsIgnoreCase(type)) {
        return EntityType.TOOLSTATION
    } else if ('TeleportPad'.equalsIgnoreCase(type)) {
        return EntityType.TELEPORT_PAD
    } else if ('Docks'.equalsIgnoreCase(type)) {
        return EntityType.DOCKS
    } else if ('PowerStation'.equalsIgnoreCase(type)) {
        return EntityType.POWER_STATION
    } else if ('Barracks'.equalsIgnoreCase(type)) {
        return EntityType.BARRACKS
    } else if ('Upgrade'.equalsIgnoreCase(type)) {
        return EntityType.UPGRADE
    } else if ('GEO-Dome'.equalsIgnoreCase(type) || 'geodome'.equalsIgnoreCase(type)) {
        return EntityType.GEODOME
    } else if ('OreRefinery'.equalsIgnoreCase(type)) {
        return EntityType.ORE_REFINERY
    } else if ('GunStation'.equalsIgnoreCase(type)) {
        return EntityType.GUNSTATION
    } else if ('TeleportBIG'.equalsIgnoreCase(type)) {
        return EntityType.TELEPORT_BIG
    } else if ('Path'.equalsIgnoreCase(type)) {
        return EntityType.POWER_PATH
    } else if ('Bat'.equalsIgnoreCase(type)) {
        return EntityType.BAT
    } else if ('SmallSpider'.equalsIgnoreCase(type)) {
        return EntityType.SMALL_SPIDER
    } else if ('RockMonster'.equalsIgnoreCase(type)) {
        return EntityType.ROCK_MONSTER
    } else if ('IceMonster'.equalsIgnoreCase(type)) {
        return EntityType.ICE_MONSTER
    } else if ('LavaMonster'.equalsIgnoreCase(type)) {
        return EntityType.LAVA_MONSTER
    } else if ('Dynamite'.equalsIgnoreCase(type)) {
        return EntityType.DYNAMITE
    } else if ('ElectricFence'.equalsIgnoreCase(type)) {
        return EntityType.ELECTRIC_FENCE
    } else if ('PowerCrystal'.equalsIgnoreCase(type)) {
        return EntityType.CRYSTAL
    } else if ('Ore'.equalsIgnoreCase(type)) {
        return EntityType.ORE
    } else if ('Brick'.equalsIgnoreCase(type)) {
        return EntityType.BRICK
    } else if ('Barrier'.equalsIgnoreCase(type)) {
        return EntityType.BARRIER
    } else if ('Hoverboard'.equalsIgnoreCase(type)) {
        return EntityType.HOVERBOARD
    } else if ('SmallDigger'.equalsIgnoreCase(type)) {
        return EntityType.SMALL_DIGGER
    } else if ('SmallTruck'.equalsIgnoreCase(type)) {
        return EntityType.SMALL_TRUCK
    } else if ('SmallCat'.equalsIgnoreCase(type)) {
        return EntityType.SMALL_CAT
    } else if ('SmallMLP'.equalsIgnoreCase(type)) {
        return EntityType.SMALL_MLP
    } else if ('SmallHeli'.equalsIgnoreCase(type)) {
        return EntityType.SMALL_HELI
    } else if ('Bulldozer'.equalsIgnoreCase(type)) {
        return EntityType.BULLDOZER
    } else if ('WalkerDigger'.equalsIgnoreCase(type)) {
        return EntityType.WALKER_DIGGER
    } else if ('LargeMLP'.equalsIgnoreCase(type)) {
        return EntityType.LARGE_MLP
    } else if ('LargeDigger'.equalsIgnoreCase(type)) {
        return EntityType.LARGE_DIGGER
    } else if ('LargeCat'.equalsIgnoreCase(type)) {
        return EntityType.LARGE_CAT
    } else if ('LargeHeli'.equalsIgnoreCase(type)) {
        return EntityType.LARGE_HELI
    } else {
        return EntityType.NONE
    }
}

export function getMonsterEntityTypeByName(type: string): MonsterEntityType | EntityType.NONE {
    if ('Bat'.equalsIgnoreCase(type)) {
        return EntityType.BAT
    } else if ('SmallSpider'.equalsIgnoreCase(type)) {
        return EntityType.SMALL_SPIDER
    } else if ('RockMonster'.equalsIgnoreCase(type)) {
        return EntityType.ROCK_MONSTER
    } else if ('IceMonster'.equalsIgnoreCase(type)) {
        return EntityType.ICE_MONSTER
    } else if ('LavaMonster'.equalsIgnoreCase(type)) {
        return EntityType.LAVA_MONSTER
    } else {
        console.warn(`Could not find monster entity type for given '${type}'`)
        return EntityType.NONE
    }
}

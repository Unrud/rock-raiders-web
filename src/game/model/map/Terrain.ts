import { Group, Vector2, Vector3 } from 'three'
import { EventBus } from '../../../event/EventBus'
import { EventKey } from '../../../event/EventKeyEnum'
import { EntityAddedEvent } from '../../../event/WorldEvents'
import { TILESIZE } from '../../../params'
import { WorldManager } from '../../WorldManager'
import { EntitySuperType } from '../EntityType'
import { PathTarget } from '../PathTarget'
import { astar, Graph } from './astar'
import { Surface } from './Surface'
import { SurfaceType } from './SurfaceType'
import { TerrainPath } from './TerrainPath'

export class Terrain {

    worldMgr: WorldManager
    textureSet: any = {}
    width: number = 0
    height: number = 0
    surfaces: Surface[][] = []
    floorGroup: Group = new Group()
    roofGroup: Group = new Group()
    graphWalk: Graph = null
    cachedPaths = new Map<string, TerrainPath>()

    constructor(worldMgr: WorldManager) {
        this.worldMgr = worldMgr
        this.floorGroup.scale.set(TILESIZE, TILESIZE, TILESIZE)
        this.roofGroup.visible = false // keep roof hidden unless switched to other camera
        EventBus.registerEventListener(EventKey.ENTITY_ADDED, (event: EntityAddedEvent) => {
            if (event.superType !== EntitySuperType.BUILDING) return
            event.entity.surfaces.forEach((s) => s.neighbors.forEach((n) => n.updateTexture()))
        })
    }

    getSurfaceFromWorld(worldPosition: Vector3): Surface | null {
        return this.getSurfaceFromWorldXZ(worldPosition.x, worldPosition.z)
    }

    getSurfaceFromWorld2D(worldPosition: Vector2): Surface | null {
        return this.getSurfaceFromWorldXZ(worldPosition.x, worldPosition.y)
    }

    getSurfaceFromWorldXZ(worldX: number, worldZ: number): Surface | null {
        return this.getSurface(worldX / TILESIZE, worldZ / TILESIZE)
    }

    getSurface(x, y): Surface {
        x = Math.floor(x)
        y = Math.floor(y)
        return this.getSurfaceOrNull(x, y) || new Surface(this, SurfaceType.SOLID_ROCK, x, y, 0)
    }

    getSurfaceOrNull(x, y): Surface | null {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.surfaces[x][y]
        } else {
            return null
        }
    }

    updateSurfaceMeshes(force: boolean = false) {
        this.forEachSurface((s) => s.updateMesh(force))
        this.floorGroup.updateWorldMatrix(true, true) // otherwise ray intersection is not working before rendering
        this.resetGraphWalk()
    }

    resetGraphWalk() {
        this.graphWalk.init()
        this.cachedPaths.clear()
        console.log('Cached paths cleared')
    }

    findPath(start: Vector2, target: PathTarget): TerrainPath {
        const end = target.targetLocation
        const startSurface = this.getSurfaceFromWorldXZ(start.x, start.y)
        const endSurface = this.getSurfaceFromWorldXZ(end.x, end.y)
        if (startSurface.x === endSurface.x && startSurface.y === endSurface.y) {
            return new TerrainPath(target, end)
        }
        const cacheIdentifier = startSurface.x + '/' + startSurface.y + ' -> ' + endSurface.x + '/' + endSurface.y
        const cachedPath = this.cachedPaths.get(cacheIdentifier)
        if (cachedPath) {
            return cachedPath.addLocation(end)
        } else {
            return this.searchPath(startSurface, endSurface, target, cacheIdentifier)
        }
    }

    private searchPath(startSurface: Surface, endSurface: Surface, target: PathTarget, cacheIdentifier: string): TerrainPath {
        const startNode = this.graphWalk.grid[startSurface.x][startSurface.y]
        const endNode = this.graphWalk.grid[endSurface.x][endSurface.y]
        const worldPath = astar.search(this.graphWalk, startNode, endNode).map(p => this.getSurface(p.x, p.y).getCenterWorld2D())
        if (worldPath.length < 1) return null // no path found
        // replace last surface center with actual target position
        worldPath.pop()
        worldPath.push(target.targetLocation)
        this.cachedPaths.set(cacheIdentifier, new TerrainPath(target, worldPath.slice(0, -1))) // cache shallow copy to avoid interference
        return new TerrainPath(target, worldPath)
    }

    findFallInOrigin(x: number, y: number): [number, number] {
        const leftSurface = this.getSurface(x - 1, y)
        if (leftSurface.isReinforcable()) return [leftSurface.x, leftSurface.y]
        const topSurface = this.getSurface(x, y - 1)
        if (topSurface.isReinforcable()) return [topSurface.x, topSurface.y]
        const rightSurface = this.getSurface(x + 1, y)
        if (rightSurface.isReinforcable()) return [rightSurface.x, rightSurface.y]
        const bottomSurface = this.getSurface(x, y + 1)
        if (bottomSurface.isReinforcable()) return [bottomSurface.x, bottomSurface.y]
        const leftSurface2 = this.getSurface(x - 1, y)
        if (leftSurface2.isDigable()) return [leftSurface2.x, leftSurface2.y]
        const topSurface2 = this.getSurface(x, y - 1)
        if (topSurface2.isDigable()) return [topSurface2.x, topSurface2.y]
        const rightSurface2 = this.getSurface(x + 1, y)
        if (rightSurface2.isDigable()) return [rightSurface2.x, rightSurface2.y]
        const bottomSurface2 = this.getSurface(x, y + 1)
        if (bottomSurface2.isDigable()) return [bottomSurface2.x, bottomSurface2.y]
        return null
    }

    findFallInTarget(x: number, y: number): [number, number] {
        const leftSurface = this.getSurface(x - 1, y)
        if (leftSurface.isWalkable()) return [leftSurface.x, leftSurface.y]
        const topSurface = this.getSurface(x, y - 1)
        if (topSurface.isWalkable()) return [topSurface.x, topSurface.y]
        const rightSurface = this.getSurface(x + 1, y)
        if (rightSurface.isWalkable()) return [rightSurface.x, rightSurface.y]
        const bottomSurface = this.getSurface(x, y + 1)
        if (bottomSurface.isWalkable()) return [bottomSurface.x, bottomSurface.y]
        return null
    }

    dispose() {
        this.forEachSurface(s => s.dispose())
    }

    forEachSurface(each: (surface: Surface) => any) {
        this.surfaces?.forEach((r) => r.forEach((s) => each(s)))
    }

}
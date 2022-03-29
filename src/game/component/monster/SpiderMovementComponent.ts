import { AbstractGameEntity } from '../../entity/AbstractGameEntity'
import { MoveState } from '../../model/MoveState'
import { PathTarget } from '../../model/PathTarget'
import { TILESIZE } from '../../../params'
import { SurfaceType } from '../../model/map/SurfaceType'
import { Vector2 } from 'three'
import { MonsterMovementComponent } from './MonsterMovementComponent'
import { TerrainPath } from '../../model/map/TerrainPath'

export class SpiderMovementComponent extends MonsterMovementComponent {
    entity: AbstractGameEntity
    target: PathTarget[] = []
    idleTimer: number = 0

    setupComponent(entity: AbstractGameEntity) {
        super.setupComponent(entity)
        this.entity = entity
    }

    findPathToTarget(target: PathTarget): TerrainPath { // TODO consider stats: random move and random enter wall
        return new TerrainPath(target, target.targetLocation)
    }

    update(elapsedMs: number): void {
        if (this.idleTimer > 0) {
            this.idleTimer -= elapsedMs
            return
        }
        if (this.target.length <= 0 || this.moveToClosestTarget(this.target, elapsedMs) !== MoveState.MOVED) {
            this.sceneEntity.changeActivity()
            this.target = [this.findTarget()]
            this.idleTimer = 1000 + Math.randomInclusive(9000)
        } else if (!this.sceneEntity.surface.surfaceType.floor) {
            this.entity.markDead()
        }
    }

    protected findTarget(): PathTarget {
        const currentCenter = this.sceneEntity.surface.getCenterWorld()
        for (let c = 0; c < 20; c++) {
            const targetX = Math.randomInclusive(currentCenter.x - (TILESIZE + TILESIZE / 2), currentCenter.x + TILESIZE + TILESIZE / 2)
            const targetZ = Math.randomInclusive(currentCenter.z - TILESIZE / 2, currentCenter.z + TILESIZE / 2)
            const surfaceType = this.terrain.getSurfaceFromWorldXZ(targetX, targetZ).surfaceType
            if (surfaceType !== SurfaceType.WATER && surfaceType !== SurfaceType.LAVA) { // TODO evaluate CrossLand, CrossLava, CrossWater from stats
                return new PathTarget(new Vector2(targetX, targetZ))
            }
        }
        console.warn('Could not find a target')
        return null
    }
}
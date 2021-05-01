import { Vector2, Vector3 } from 'three'
import { MovableEntityStats } from '../../cfg/MovableEntityStats'
import { JOB_ACTION_RANGE } from '../../params'
import { AnimEntityActivity } from './activities/AnimEntityActivity'
import { AnimEntity } from './anim/AnimEntity'
import { EntityStep } from './EntityStep'
import { EntitySuperType, EntityType } from './EntityType'
import { TerrainPath } from './map/TerrainPath'
import { MoveState } from './MoveState'
import { PathTarget } from './PathTarget'

export abstract class MovableEntity extends AnimEntity {

    currentPath: TerrainPath = null
    floorOffset: number = 0

    protected constructor(superType: EntitySuperType, entityType: EntityType, aeFilename: string) {
        super(superType, entityType, aeFilename)
    }

    abstract get stats(): MovableEntityStats

    getPosition(): Vector3 {
        return new Vector3(this.group.position.x, this.group.position.y, this.group.position.z)
    }

    getPosition2D(): Vector2 {
        return new Vector2(this.group.position.x, this.group.position.z)
    }

    getSpeed(): number {
        return this.stats.RouteSpeed[this.level] * (this.animation?.transcoef || 1) * (this.isOnPath() ? this.stats.PathCoef : 1)
    }

    moveToClosestTarget(target: PathTarget[]): MoveState {
        if (target.length < 1) console.warn('No targets given')
        if (!this.currentPath || !target.some((t) => t.targetLocation.equals(this.currentPath.target.targetLocation))) {
            const paths = target.map((t) => this.findPathToTarget(t))
                .sort((l, r) => l.lengthSq - r.lengthSq)
            this.currentPath = paths.length > 0 ? paths[0] : null
            if (!this.currentPath) return MoveState.TARGET_UNREACHABLE
        }
        const nextLocation = this.currentPath.firstLocation
        this.group.lookAt(new Vector3(nextLocation.x, this.group.position.y, nextLocation.y))
        const step = this.determineStep()
        if (step.targetReached || this.currentPath.target.isInArea(this.getPosition2D())) {
            return MoveState.TARGET_REACHED
        } else {
            this.group.position.add(step.vec)
            this.changeActivity(this.getRouteActivity()) // only change when actually moving
            return MoveState.MOVED
        }
    }

    abstract getRouteActivity(): AnimEntityActivity

    findPathToTarget(target: PathTarget): TerrainPath {
        return new TerrainPath(target, target.targetLocation)
    }

    determineStep(): EntityStep {
        const step = this.getEntityStep(this.currentPath.firstLocation)
        const stepLengthSq = step.vec.lengthSq()
        const entitySpeed = this.getSpeed() // TODO use average speed between current and target position
        if (this.currentPath.locations.length > 1) {
            if (stepLengthSq < entitySpeed * entitySpeed) {
                this.currentPath.locations.shift()
                return this.determineStep()
            }
        } else if (stepLengthSq < JOB_ACTION_RANGE * JOB_ACTION_RANGE) {
            step.targetReached = true
        }
        step.vec.setLength(Math.min(entitySpeed, JOB_ACTION_RANGE))
        return step
    }

    getEntityStep(target: Vector2): EntityStep {
        const targetWorld = this.worldMgr.getFloorPosition(target)
        targetWorld.y += this.floorOffset
        return new EntityStep(targetWorld.sub(this.group.position))
    }

    isOnRubble() {
        return this.worldMgr.sceneManager.terrain.getSurfaceFromWorld(this.group.position).hasRubble()
    }

    isOnPath(): boolean {
        return this.worldMgr.sceneManager.terrain.getSurfaceFromWorld(this.group.position).isPath()
    }

}
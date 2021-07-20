import { Vector2 } from 'three'
import { AnimEntityActivity } from '../../game/model/activities/AnimEntityActivity'
import { BaseActivity } from '../../game/model/activities/BaseActivity'
import { RaiderActivity } from '../../game/model/activities/RaiderActivity'
import { AnimatedSceneEntity } from '../AnimatedSceneEntity'
import { SceneEntity } from '../SceneEntity'

export class RaiderSceneEntity extends AnimatedSceneEntity {

    carriedEntity: SceneEntity

    pickupEntity(entity: SceneEntity) {
        if (this.carriedEntity === entity) return
        this.dropAllCarriedItems()
        this.carriedEntity = entity
        this.addCarried()
        this.carriedEntity.position.set(0, 0, 0)
    }

    dropAllCarriedItems() {
        if (!this.carriedEntity) return
        const position = this.position.clone()
        const carryJoint = this.animation?.carryJoints?.[0]
        if (carryJoint) {
            carryJoint.remove(this.carriedEntity.group)
            carryJoint.getWorldPosition(position)
        }
        this.carriedEntity.addToScene(new Vector2(position.x, position.z), null)
        this.carriedEntity = null
        this.changeActivity()
    }

    changeActivity(activity: AnimEntityActivity = this.getDefaultActivity(), onAnimationDone: () => any = null, durationTimeMs: number = null) {
        if ((this.activity === activity || this.animationEntityType === null) && !!onAnimationDone === !!this.animation?.onAnimationDone) return
        super.changeActivity(activity, onAnimationDone, durationTimeMs)
        this.addCarried() // keep carried children
    }

    private addCarried() {
        if (!this.carriedEntity) return
        this.animation?.carryJoints?.[0]?.add(this.carriedEntity.group)
    }

    getDefaultActivity(): BaseActivity {
        return this.carriedEntity ? RaiderActivity.CarryStand : super.getDefaultActivity()
    }

}

import { clearTimeoutSafe } from '../../../../core/Util'
import { MonsterActivity } from '../../../../scene/model/activities/MonsterActivity'
import { MovableEntity } from '../../../../scene/model/MovableEntity'
import { PathTarget } from '../../../../scene/model/PathTarget'

export abstract class Monster extends MovableEntity {

    moveTimeout: NodeJS.Timeout
    target: PathTarget = null

    onLevelEnd() {
        this.moveTimeout = clearTimeoutSafe(this.moveTimeout)
        this.removeFromScene()
    }

    getRouteActivity(): MonsterActivity {
        return MonsterActivity.Route
    }

}

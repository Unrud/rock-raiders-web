import { ResourceManager } from '../../../resource/ResourceManager'
import { EntityManager } from '../../EntityManager'
import { SceneManager } from '../../SceneManager'
import { EntityType } from '../EntityType'
import { Monster } from './Monster'

export class IceMonster extends Monster {
    constructor(sceneMgr: SceneManager, entityMgr: EntityManager) {
        super(sceneMgr, entityMgr, EntityType.ICE_MONSTER, 'Creatures/IceMonster/IceMonster.ae', ResourceManager.configuration.stats.IceMonster)
    }

    disposeFromWorld() {
        super.disposeFromWorld()
        this.entityMgr.rockMonsters.remove(this)
    }
}

import { SelectionType } from '../../game/model/Selectable';
import { EventBus } from '../../event/EventBus';
import { RAIDER_SPEED } from '../../main';
import { RaiderSelected } from '../../event/LocalEvents';
import { FulfillerActivity, FulfillerEntity } from './FulfillerEntity';

export class Raider extends FulfillerEntity {

    constructor() {
        super(SelectionType.PILOT, 'mini-figures/pilot/pilot.ae', RAIDER_SPEED);
        this.tools = ['drill', 'shovel'];
    }

    isOnRubble() {
        return this.worldMgr.terrain.getSurfaceFromWorld(this.group.position).hasRubble();
    }

    onSelect() {
        this.changeActivity(FulfillerActivity.STANDING);
        EventBus.publishEvent(new RaiderSelected(this));
    }

    getSpeed(): number {
        let speed = super.getSpeed();
        if (this.animation && !isNaN(this.animation.transcoef)) speed *= this.animation.transcoef;
        if (this.isOnPath()) speed *= 2; // TODO read from cfg
        return speed;
    }

    isOnPath(): boolean {
        return this.worldMgr.terrain.getSurfaceFromWorld(this.group.position).isPath();
    }

    changeActivity(activity: FulfillerActivity, onChangeDone = null) {
        if (onChangeDone) onChangeDone.bind(this);
        if (this.activity !== activity) {
            this.activity = activity;
            switch (this.activity) {
                case FulfillerActivity.STANDING:
                    if (this.carries) {
                        this.setActivity('StandCarry', onChangeDone);
                    } else {
                        this.setActivity('Stand', onChangeDone);
                    }
                    break;
                case FulfillerActivity.MOVING:
                    if (this.carries) {
                        this.setActivity('Carry', onChangeDone);
                    } else {
                        this.setActivity('Run', onChangeDone);
                    }
                    break;
                case FulfillerActivity.MOVING_RUBBLE:
                    if (this.carries) {
                        this.setActivity('Carryrubble', onChangeDone);
                    } else {
                        this.setActivity('Routerubble', onChangeDone);
                    }
                    break;
                case FulfillerActivity.DRILLING:
                    // TODO adapt drilling time to material hardness
                    this.setActivity('Drill', onChangeDone);
                    break;
                case FulfillerActivity.SHOVELING:
                    this.setActivity('ClearRubble', onChangeDone);
                    break;
                case FulfillerActivity.PICKING:
                    this.setActivity('Pickup', onChangeDone);
                    break;
            }
            this.animation.looping = true; // TODO make all looping?
        }
    }

}

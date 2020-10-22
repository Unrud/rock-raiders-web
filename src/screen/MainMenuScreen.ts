import { BaseScreen } from './BaseScreen';
import { ScreenLayer } from './ScreenLayer';
import { EventManager, MOUSE_BUTTON } from '../game/engine/EventManager';
import { ResourceManager } from '../game/engine/ResourceManager';

class MainMenuScreen extends BaseScreen {

    onLevelSelected: (levelName: string) => void = null;
    startCanvas: ScreenLayer;
    loadGameCanvas: ScreenLayer;
    levelSelectCanvas: ScreenLayer;
    trainingSelectCanvas: ScreenLayer;
    showTeamCanvas: ScreenLayer;
    optionsCanvas: ScreenLayer;

    constructor(eventManager: EventManager) {
        super(eventManager);
        this.startCanvas = this.addLayer(new ScreenLayer());
        this.loadGameCanvas = this.addLayer(new ScreenLayer());
        this.levelSelectCanvas = this.addLayer(new ScreenLayer());
        this.trainingSelectCanvas = this.addLayer(new ScreenLayer());
        this.showTeamCanvas = this.addLayer(new ScreenLayer());
        this.optionsCanvas = this.addLayer(new ScreenLayer());

        this.eventMgr.addMouseDownListener(this.startCanvas, MOUSE_BUTTON.MAIN, () => { // TODO bind listener to ui elements instead of layers?
            this.selectLevel('Level05');
            return true;
        });
    }

    showMainMenu() {
        this.hide();
        const menuBg = ResourceManager.getImage(ResourceManager.configuration['Lego*']['Menu']['MainMenuFull']['Menu1']['MenuImage']).canvas;
        this.startCanvas.onRedraw = (context => {
            context.drawImage(menuBg, 0, 0, this.width, this.height);
        });
        this.startCanvas.show();
        // TODO merge main menu implementation from rock-raiders-remake project here
    }

    showLevelSelection() {
        // TODO directly jump to the level selection screen
    }

    selectLevel(levelName) {
        this.hide();
        this.onLevelSelected(levelName);
    }

}

export { MainMenuScreen };

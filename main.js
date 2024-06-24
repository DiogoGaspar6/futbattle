import MenuScene from './menu.js';
import OptionsScene from './opcoes.js';
import ControlosScene from './controlos.js';
import CardBattleScene from './jogo.js';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene, OptionsScene, ControlosScene, CardBattleScene],
    audio: {
        disableWebAudio: false
    }
};

const game = new Phaser.Game(config);


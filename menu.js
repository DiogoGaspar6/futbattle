class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/menu.png');
        this.load.audio('menuMusic', 'assets/championsleague.mp3');
    }

    create() {
        this.add.image(400, 300, 'menuBackground').setDisplaySize(800,600);

        if (!this.sound.get('menuMusic')) {
            this.menuMusic = this.sound.add('menuMusic', { loop: true });
            this.menuMusic.play();
        }

        let menuContainer = this.add.rectangle(400, 300, 300, 400, 0xffffff).setOrigin(0.5);

        let startButton = this.add.text(400, 200, 'Começar Jogo', { fill: '#ffffff', fontSize: '32px', backgroundColor: '#000000', padding: { x: 10, y: 5 }, borderRadius: 10 }).setOrigin(0.5).setInteractive();
        startButton.on('pointerdown', () => {
            this.sound.stopAll();
            this.scene.start('CardBattleScene');
        });

        let controlsButton = this.add.text(400, 300, 'Controles', { fill: '#ffffff', fontSize: '32px', backgroundColor: '#000000', padding: { x: 10, y: 5 }, borderRadius: 10 }).setOrigin(0.5).setInteractive();
        controlsButton.on('pointerdown', () => {
            this.scene.start('ControlosScene');
        });

        let optionsButton = this.add.text(400, 400, 'Opções', { fill: '#ffffff', fontSize: '32px', backgroundColor: '#000000', padding: { x: 10, y: 5 }, borderRadius: 10 }).setOrigin(0.5).setInteractive();
        optionsButton.on('pointerdown', () => {
            this.scene.start('OptionsScene');
        });
    }
}

export default MenuScene;

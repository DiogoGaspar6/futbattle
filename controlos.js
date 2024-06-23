class ControlosScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ControlosScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/menu.png');
    }

    create() {
        let background = this.add.image(0, 0, 'menuBackground').setOrigin(0, 0);
        background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Adiciona um retângulo branco ao fundo
        let controlsContainer = this.add.rectangle(400, 300, 500, 400, 0xffffff).setOrigin(0.5);

        this.add.text(400, 150, 'Controles', { fill: '#000000', fontSize: '32px' }).setOrigin(0.5);

        this.add.text(400, 200, 'Aqui estão os controles do jogo.', { fill: '#000000', fontSize: '24px' }).setOrigin(0.5);

        let backButton = this.add.text(400, 450, 'Voltar', { fill: '#000000', fontSize: '32px', backgroundColor: '#cccccc', padding: { x: 10, y: 5 }, borderRadius: 10 }).setOrigin(0.5).setInteractive();
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

export default ControlosScene;

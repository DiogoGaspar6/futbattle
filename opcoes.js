class OptionsScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OptionsScene' });
    }

    preload() {
        this.load.image('menuBackground', 'assets/menuInicial.png');
    }

    create() {
        let background = this.add.image(0, 0, 'menuBackground').setOrigin(0, 0);
        background.setDisplaySize(this.sys.game.config.width, this.sys.game.config.height);

        // Adiciona um retângulo branco ao fundo
        let optionsContainer = this.add.rectangle(400, 300, 500, 400, 0xffffff).setOrigin(0.5);

        let volumeText = this.add.text(400, 150, 'Volume', { fill: '#000000', fontSize: '32px' }).setOrigin(0.5);

        let muteText = this.add.text(400, 200, this.sound.mute ? 'Unmute' : 'Mute', { fill: '#000000', fontSize: '32px', backgroundColor: '#cccccc', padding: { x: 10, y: 5 }, borderRadius: 10 }).setOrigin(0.5).setInteractive();
        muteText.on('pointerdown', () => {
            this.sound.mute = !this.sound.mute;
            muteText.setText(this.sound.mute ? 'Unmute' : 'Mute');
        });

        this.add.text(400, 300, 'Tecla P: Aumentar volume', { fill: '#000000', fontSize: '24px' }).setOrigin(0.5);
        this.add.text(400, 350, 'Tecla M: Diminuir volume', { fill: '#000000', fontSize: '24px' }).setOrigin(0.5);

        this.input.keyboard.on('keydown-P', () => {
            this.sound.volume = Math.min(this.sound.volume + 0.1, 1);
        });

        this.input.keyboard.on('keydown-M', () => {
            this.sound.volume = Math.max(this.sound.volume - 0.1, 0);
        });

        let backButton = this.add.text(400, 450, 'Voltar', { fill: '#000000', fontSize: '32px', backgroundColor: '#cccccc', padding: { x: 10, y: 5 }, borderRadius: 10 }).setOrigin(0.5).setInteractive();
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }

    update() {
        // Atualiza o texto do botão mute com base no estado do som
        let muteText = this.children.getByName('muteText');
        if (muteText) {
            muteText.setText(this.sound.mute ? 'Unmute' : 'Mute');
        }
    }
}

export default OptionsScene;

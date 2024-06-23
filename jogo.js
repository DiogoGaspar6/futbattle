class CardBattleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CardBattleScene' });
        this.selectedAttribute = null;
        this.selectedPlayerCard = null;
        this.selectedOpponentCard = null;
        this.playerScore = 0;
        this.opponentScore = 0;
        this.isPlayerTurn = true;
        this.deck = [];
        this.playerHand = [];
        this.opponentHand = [];
        this.jogadores = [];
        this.cardGroup = null; // Grupo para gerenciar as cartas na tela
    }

    preload() {
        // Carregar assets
        this.load.image('campo', 'assets/campo.png');
        this.load.image('verso', 'assets/verso.png');
        this.load.json('jogadores', 'jogadores.json');
        this.load.audio('gameMusic', 'assets/musicafundo.mp3');
    }

    create() {
        // Criar fundo, música e texto de pontuação
        this.gameMusic = this.sound.add('gameMusic', { loop: true });
        let background = this.add.image(400, 300, 'campo').setOrigin(0.5);
        background.setRotation(Phaser.Math.DegToRad(90));
        background.setDisplaySize(600, 800);

        // Carregar jogadores
        this.jogadores = this.cache.json.get('jogadores').jogadores;
        this.jogadores.forEach(jogador => this.load.image(jogador.nome, jogador.imagem));

        this.load.once('complete', () => {
            this.setupGame();
            this.gameMusic.play();
        });
        this.load.start();

        // Criar textos na tela
        this.playerScoreText = this.add.text(10, 10, 'Minha pontuação: 0', { fill: '#000000' });
        this.opponentScoreText = this.add.text(10, 40, 'Pontuação do adversário: 0', { fill: '#000000' });
        this.turnText = this.add.text(400, 20, 'Sua vez de jogar', { fill: '#0000ff', fontSize: '24px' }).setOrigin(0.5);
        this.helpText = this.add.text(400, 300, 'Selecione uma carta da sua mão e uma carta da mão do adversário', { fill: '#000000', fontSize: '16px' }).setOrigin(0.5).setVisible(false);

        // Criar botões de ação
        this.createActionButtons();

        // Criar o grupo para gerenciar as cartas
        this.cardGroup = this.add.group();
    }

    createActionButtons() {
        // Botões de Ataque e Defesa
        this.ataqueOption = this.add.text(50, 480, 'Ataque', { fill: '#ff0000', fontSize: '32px', backgroundColor: '#ffffff', padding: { x: 10, y: 5 } }).setInteractive().setVisible(false);
        this.defesaOption = this.add.text(50, 530, 'Defesa', { fill: '#00ff00', fontSize: '32px', backgroundColor: '#ffffff', padding: { x: 10, y: 5 } }).setInteractive().setVisible(false);

        this.ataqueOption.on('pointerdown', () => this.resolveBattle('Ataque'));
        this.defesaOption.on('pointerdown', () => this.resolveBattle('Defesa'));
    }

    setupGame() {
        this.clearCardsFromScreen();
        this.shuffleDeck();
        this.dealCards();
        this.isPlayerTurn = Phaser.Math.Between(0, 1) === 0;
        this.startTurn();
    }

    shuffleDeck() {
        this.deck = Phaser.Utils.Array.Shuffle(this.jogadores.map(jogador => ({
            nome: jogador.nome,
            ataque: jogador.ataque,
            defesa: jogador.defesa,
            imagem: jogador.imagem
        })));
    }

    clearCardsFromScreen() {
        // Remove todas as cartas do grupo
        this.cardGroup.clear(true, true);
    }

    dealCards() {
        this.playerHand = this.deck.splice(0, 4);
        this.opponentHand = this.deck.splice(0, 4);
        console.log('PlayerHand: ', this.playerHand);
        console.log('OpponentHand: ', this.opponentHand);
    }

    startTurn() {
        this.clearCardsFromScreen();
        this.displayOpponentHand();
        this.displayPlayerHand();
        console.log(this.playerHand);
        console.log(this.opponentHand);
        this.turnText.setText(this.isPlayerTurn ? 'É o player a jogar' : 'É o opponent a jogar');
        this.selectedPlayerCard = null;
        this.selectedOpponentCard = null;
        this.isPlayerTurn ? this.playerTurn() : this.opponentTurn();
    }

    displayPlayerHand() {
        this.playerHand.forEach((card, index) => {
            let cardImage = this.add.image(250 + (index * 100), 500, card.nome).setScale(0.3).setInteractive();
            this.cardGroup.add(cardImage); // Adicionar a carta ao grupo
            cardImage.on('pointerdown', () => {
                this.selectedPlayerCard = card;
                this.clearZoom();
                cardImage.setScale(0.5); // Aplica zoom na carta clicada
                console.log(this.selectedPlayerCard);
                if (this.selectedPlayerCard && this.selectedOpponentCard) this.showOptions();
            });
        });
    }

    displayOpponentHand() {
        this.opponentHand.forEach((card, index) => {
            let cardImage = this.add.image(250 + (index * 100), 150, 'verso').setScale(0.3).setInteractive();
            this.cardGroup.add(cardImage); // Adicionar a carta ao grupo
            cardImage.on('pointerdown', () => {
                this.selectedOpponentCard = card;
                this.clearZoom();
                cardImage.setScale(0.5); // Aplica zoom na carta clicada
                console.log(this.selectedOpponentCard);
                if (this.selectedPlayerCard && this.selectedOpponentCard) this.showOptions();
            });
        });
    }

    clearZoom() {
        this.cardGroup.children.each(child => {
            child.setScale(0.3); // Restaura o tamanho original
        });
    }

    showOptions() {
        this.ataqueOption.setVisible(true);
        this.defesaOption.setVisible(true);
    }

    hideOptions() {
        this.ataqueOption.setVisible(false);
        this.defesaOption.setVisible(false);
    }

    playerTurn() {
        this.helpText.setText('Selecione uma carta da sua mão e uma carta da mão do adversário').setVisible(true);
    }

    opponentTurn() {
        console.log('turno do oponente');
        this.helpText.setText(' ');

        const randomIndex = Phaser.Math.Between(0, this.opponentHand.length - 1);
        const randomIndexPlayer = Phaser.Math.Between(0, this.playerHand.length - 1);
        this.selectedOpponentCard = this.opponentHand[randomIndex];
        this.selectedPlayerCard = this.playerHand[randomIndexPlayer];
        this.displaySelectedCard(this.selectedOpponentCard, 300, 600);
        this.displaySelectedCard(this.selectedPlayerCard, 300, 200);

        const randomAction = Phaser.Math.Between(0, 1) === 0 ? 'Ataque' : 'Defesa';
        this.resolveBattle(randomAction);
    }

    displaySelectedCard(card, y, x) {
        let cardImage = this.add.image(x, y, card.nome).setScale(0.3);
        this.cardGroup.add(cardImage); // Adicionar a carta ao grupo
    }

    resolveBattle(action) {
        if (!this.selectedPlayerCard || !this.selectedOpponentCard) return;

        const playerValue = action === 'Ataque' ? this.selectedPlayerCard.ataque : this.selectedPlayerCard.defesa;
        const opponentValue = action === 'Ataque' ? this.selectedOpponentCard.ataque : this.selectedOpponentCard.defesa;

        if (playerValue > opponentValue) {
            this.playerScore++;
            this.playerScoreText.setText('Minha pontuação: ' + this.playerScore);
            console.log('Ganhaste');
        } else if (playerValue < opponentValue) {
            this.opponentScore++;
            this.opponentScoreText.setText('Pontuação do adversário: ' + this.opponentScore);
            console.log('Perdeste');
        }

        // Remover a carta jogada das mãos dos jogadores
        this.playerHand = this.playerHand.filter(card => card !== this.selectedPlayerCard);
        this.opponentHand = this.opponentHand.filter(card => card !== this.selectedOpponentCard);

        this.selectedPlayerCard = null;
        this.selectedOpponentCard = null;

        this.hideOptions();

        if (this.checkEndGame()) {
            this.endGame();
        } else {
            this.isPlayerTurn = !this.isPlayerTurn;
            this.startTurn();
        }
    }

    checkEndGame() {
        return this.playerHand.length === 0 && this.opponentHand.length === 0;
    }

    endGame() {
        this.turnText.setVisible(true);
        this.turnText.setText(this.playerScore > this.opponentScore ? 'Você venceu!' : 'Você perdeu!');
        this.clearCardsFromScreen()
        this.gameMusic.stop();
    }
}

export default CardBattleScene;

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
        this.attributeTexts = [];
    }

    preload() {
        // Carregar assets
        this.load.image('campo', 'assets/campo.png');
        this.load.image('verso', 'assets/background.png');
        this.load.json('jogadores', 'jogadores.json');
        this.load.audio('gameMusic', 'assets/musicafundo.mp3');
        this.load.audio('winner', 'assets/winner.mp3');
        this.load.image('taca', 'assets/tacaChampions.png');
        this.load.image('lose', 'assets/lose.webp');
        this.load.audio('loseAudio', 'assets/loseAudio.mp3');
    }

    create() {
        // Criar fundo, música e texto de pontuação
        this.winnerMusic = this.sound.add('winner', { loop: false });
        this.loseMusic = this.sound.add('loseAudio', { loop: true });
        this.gameMusic = this.sound.add('gameMusic', { loop: true });
        let background = this.add.image(400, 300, 'campo').setOrigin(0.5);
        background.setRotation(Phaser.Math.DegToRad(90));
        background.setDisplaySize(600, 800);

        this.taca = this.add.image(400, 450, 'taca').setVisible(false).setScale(0.1);
        this.lose = this.add.image(400, 450, 'lose').setVisible(false).setScale(0.2);

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
        this.roundResultText = this.add.text(400, 300, '', { fill: '#ff0000', fontSize: '24px' }).setOrigin(0.5).setVisible(false);
        this.winText = this.add.text(370, 300, ' ', { fill: '#000000', fontSize: '24px' }).setVisible(false);
        this.resultMessage = this.add.text(250, 290, ' ', { fill: '#000000', fontSize: '24px' }).setVisible(true);
        this.opponentActionText = this.add.text(400, 400, '', { fill: '#000000', fontSize: '24px' }).setOrigin(0.5).setVisible(false);
        this.menuOptions = this.add.text(400, 550, 'Voltar para o menu', { fill: '#ffffff', fontSize: '32px', backgroundColor: '#000000', padding: { x: 10, y: 5 } }).setOrigin(0.5).setInteractive().setVisible(false);

        // Criar botões de ação
        this.createActionButtons();

        // Criar o grupo para gerenciar as cartas
        this.cardGroup = this.add.group();
    }

    createActionButtons() {
        // Botões de Ataque e Defesa
        this.ataqueOption = this.add.text(50, 480, 'Ataque', { fill: '#ff0000', fontSize: '32px', backgroundColor: '#ffffff', padding: { x: 10, y: 5 } }).setInteractive().setVisible(false);
        this.defesaOption = this.add.text(50, 530, 'Defesa', { fill: '#00ff00', fontSize: '32px', backgroundColor: '#ffffff', padding: { x: 10, y: 5 } }).setInteractive().setVisible(false);

        this.ataqueOption.on('pointerdown', () => this.revealOpponentCard('Ataque'));
        this.defesaOption.on('pointerdown', () => this.revealOpponentCard('Defesa'));
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
        // Remove todas as cartas do grupo e limpa os textos de atributos
        if (this.cardGroup) {
            this.cardGroup.clear(true, true);
        }
        this.attributeTexts.forEach(text => text.destroy());
        this.attributeTexts = [];
    }

    dealCards() {
        this.playerHand = this.deck.splice(0, 4);
        this.opponentHand = this.deck.splice(0, 4);
        console.log('PlayerHand: ', this.playerHand);
        console.log('OpponentHand: ', this.opponentHand);
    }

    startTurn() {
        this.resultMessage.setVisible(false);
        this.clearCardsFromScreen();
        this.displayOpponentHand();
        this.displayPlayerHand();
        console.log(this.playerHand);
        console.log(this.opponentHand);
        this.turnText.setText(this.isPlayerTurn ? 'És tu a jogar' : 'É o oponente a jogar');
        this.selectedPlayerCard = null;
        this.selectedOpponentCard = null;
        this.isPlayerTurn ? this.playerTurn() : this.opponentTurn();
    }

    displayPlayerHand() {
        this.playerHand.forEach((card, index) => {
            let cardImage = this.add.image(250 + (index * 100), 505, card.nome).setScale(0.3).setInteractive();
            cardImage.setData('cardData', card); // Armazena os dados da carta na imagem
            this.cardGroup.add(cardImage); // Adicionar a carta ao grupo
            cardImage.on('pointerdown', () => {
                this.selectedPlayerCard = card;
                this.clearZoom();
                this.tweens.add({
                    targets: cardImage,
                    scale: 0.5,
                    duration: 300,
                    ease: 'Power2'
                }); // Aplica zoom na carta clicada
                console.log(this.selectedPlayerCard);
                if (this.selectedPlayerCard && this.selectedOpponentCard) this.showOptions();
            });
        });
    }

    displayOpponentHand() {
        this.opponentHand.forEach((card, index) => {
            let cardImage = this.add.image(250 + (index * 100), 150, 'verso').setScale(0.2).setInteractive();
            cardImage.setData('cardData', card); // Armazena os dados da carta na imagem
            this.cardGroup.add(cardImage); // Adicionar a carta ao grupo
            cardImage.on('pointerdown', () => {
                this.selectedOpponentCard = card;
                this.clearZoom();
                this.tweens.add({
                    targets: cardImage,
                    scale: 0.5,
                    duration: 300,
                    ease: 'Power2'
                }); // Aplica zoom na carta clicada
                console.log(this.selectedOpponentCard);
                if (this.selectedPlayerCard && this.selectedOpponentCard) this.showOptions();
            });
        });
    }

    clearZoom() {
        this.cardGroup.children.each(child => {
            if (child.getData('cardData') !== this.selectedPlayerCard && child.getData('cardData') !== this.selectedOpponentCard) {
                this.tweens.add({
                    targets: child,
                    scale: 0.3,
                    duration: 300,
                    ease: 'Power2'
                }); // Restaura o tamanho original
            }
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
        this.animateCardSelection(this.selectedOpponentCard, 300, 600);
        this.animateCardSelection(this.selectedPlayerCard, 300, 200);

        const randomAction = Phaser.Math.Between(0, 1) === 0 ? 'Ataque' : 'Defesa';
        this.opponentActionText.setText(`Oponente escolheu ${randomAction}`).setVisible(true);
        this.time.delayedCall(3000, () => {
            this.resolveBattle(randomAction);
            this.opponentActionText.setVisible(false);
        }, [], this); // Adiciona um pequeno atraso antes de resolver a batalha
    }

    animateCardSelection(card, y, x) {
        let cardImage = this.add.image(x, y, card.nome).setScale(0.3);
        this.cardGroup.add(cardImage); // Adicionar a carta ao grupo
        this.tweens.add({
            targets: cardImage,
            y: y - 50, // Move a carta um pouco para cima
            duration: 1000,
            ease: 'Power2'
        });

        // Exibir atributos das cartas
        this.attributeTexts.push(
            this.add.text(x - 30, y + 20, `Ataque: ${card.ataque}`, { fill: '#000', fontSize: '14px' }),
            this.add.text(x - 30, y + 40, `Defesa: ${card.defesa}`, { fill: '#000', fontSize: '14px' })
        );
    }

    revealOpponentCard(action) {
        if (!this.selectedOpponentCard) return;

        // Encontra a imagem da carta do oponente e altera a textura para a imagem da carta revelada
        let cardImage = this.cardGroup.getChildren().find(img => img.getData('cardData') === this.selectedOpponentCard);
        if (cardImage) {
            cardImage.setTexture(this.selectedOpponentCard.nome);
        }

        // Adiciona um pequeno atraso antes de resolver a batalha para mostrar a carta revelada
        this.time.delayedCall(1000, () => this.resolveBattle(action), [], this);
    }

    resolveBattle(action) {
        this.helpText.setVisible(false);
        if (!this.selectedPlayerCard || !this.selectedOpponentCard) return;

        let playerValue, opponentValue;

        if(this.isPlayerTurn){
            if (action === 'Ataque') {
                playerValue = this.selectedPlayerCard.ataque;
                opponentValue = this.selectedOpponentCard.defesa;
            } else {
                playerValue = this.selectedPlayerCard.defesa;
                opponentValue = this.selectedOpponentCard.ataque;
            }
        }else{
            if (action === 'Ataque') {
                playerValue = this.selectedPlayerCard.defesa;
                opponentValue = this.selectedOpponentCard.ataque;
            } else {
                playerValue = this.selectedPlayerCard.ataque;
                opponentValue = this.selectedOpponentCard.defesa;
            }
        }

        if (this.isPlayerTurn) {
            this.attributeTexts.push(
                this.add.text(100, 370, `Player Ataque: ${this.selectedPlayerCard.ataque} Defesa: ${this.selectedPlayerCard.defesa}`, { fill: '#000', fontSize: '20px' }).setScale(0.8),
                this.add.text(500, 370, `Opponent Ataque: ${this.selectedOpponentCard.ataque} Defesa: ${this.selectedOpponentCard.defesa}`, { fill: '#000', fontSize: '20px' }).setScale(0.8)
            );
        }

        let resultMessage = '';

        if (playerValue > opponentValue) {
            this.playerScore++;
            this.playerScoreText.setText('Minha pontuação: ' + this.playerScore);
            this.resultMessage.setText('Você ganhou a rodada!').setColor('#008000').setVisible(true);
        } else if (playerValue < opponentValue) {
            this.opponentScore++;
            this.opponentScoreText.setText('Pontuação do adversário: ' + this.opponentScore);
            this.resultMessage.setText('Você perdeu a rodada!').setColor('#ff0000').setVisible(true);
        } else {
            this.opponentScore++;
            this.playerScore++;
            this.opponentScoreText.setText('Pontuação do adversário: ' + this.opponentScore);
            this.playerScoreText.setText('Minha pontuação: ' + this.playerScore);
            this.resultMessage.setText('A rodada empatou!').setColor('#ffffff').setVisible(true);
        }

        // Exibir o resultado da rodada
        this.roundResultText.setText(resultMessage).setPosition(this.cameras.main.centerX, this.cameras.main.centerY).setOrigin(0.5).setVisible(true);

        // Remover a carta jogada das mãos dos jogadores
        this.playerHand = this.playerHand.filter(card => card !== this.selectedPlayerCard);
        this.opponentHand = this.opponentHand.filter(card => card !== this.selectedOpponentCard);

        this.selectedPlayerCard = null;
        this.selectedOpponentCard = null;

        this.hideOptions();

        if (this.checkEndGame()) {
            this.endGame();
        } else {
            this.time.delayedCall(2000, () => {
                this.roundResultText.setVisible(false); // Ocultar o resultado da rodada após um atraso
                this.isPlayerTurn = !this.isPlayerTurn;
                this.startTurn();
            }, [], this); // Adiciona um pequeno atraso antes de iniciar o próximo turno
        }
    }

    checkEndGame() {
        return this.playerHand.length === 0 && this.opponentHand.length === 0;
    }

    endGame() {
        this.resultMessage.setVisible(false);
        this.turnText.setVisible(false);
        this.helpText.setVisible(false);
        this.winText.setVisible(true);
    
        if (this.playerScore > this.opponentScore) {
            this.winText.setText('Você venceu!');
            this.taca.setVisible(true);
            this.winnerMusic.play();
        } else if (this.playerScore < this.opponentScore) {
            this.winText.setText('Você perdeu!');
            this.lose.setVisible(true);
            this.loseMusic.play();
        } else {
            this.winText.setText('Empate!');
            this.taca.setVisible(false);
            this.lose.setVisible(false);
            this.gameMusic.stop();
        }
        this.menuOptions.setVisible(true);
        this.menuOptions.on('pointerdown', () => this.scene.restart('MenuScene'));
        this.clearCardsFromScreen();
        if (this.playerScore > this.opponentScore || this.playerScore < this.opponentScore) {
            this.gameMusic.stop();
        }
    }
}

export default CardBattleScene;

import * as Phaser from 'phaser';
import { Grid, Text, ButtonWrapper } from '../utils';

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'EndScene',
    });
  }

  init(data) {
    this.gameOver = data.gameOver;
  }

  create() {
    this.grid = new Grid({
			scene: this,
			rows: 12,
			cols: 15,
			color: 'white',
		});

    this.background = this.add.image(0, 0, 'background');
		this.background.setOrigin(
			0, 
			0
		);
		this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);
    this.message = Text.createText({
      scene: this,
      text: this.gameOver ? lang.endScene.defeatMessage : lang.endScene.victoryMessage,
      style: {
        align: 'center',
      },
      width: CONFIG_SIZE.GAME_WIDTH,
    });

    this.add.existing(this.message);
    this.grid.placeAt(CONFIG_SIZE.END_SCENE.message, this.message, 'center');

    this.button = new ButtonWrapper({
      scene: this,
      key: 'button',
      text: lang.endScene.playAgainButton,
      style: {
        color: 'black',
        align: 'center'
      },
      event: 'RESTART_GAME',
    });
    this.grid.placeAt(CONFIG_SIZE.END_SCENE.button, this.button);

    this.cameras.main.fadeIn(1000, 0, 0, 0);

    emitter.on('RESTART_GAME', this.restartGame, this);
    
    this.grid.showNumbers();
  }

  destroyObjects() {
    this.background.destroy();
    this.button.destroy();
    this.message.destroy();
  }

  restartGame() {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function() {
			this.scene.start('PlayScene');
		}, this);
		this.cameras.main.fadeOut(2000, 0, 0, 0);
  }
}
import * as Phaser from 'phaser';
import { Grid, Text, ButtonWrapper } from '../utils';
import { EventsCenter } from '../components';

export default class EndScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'EndScene',
    });
  }

  init(data) {
    this.gameOver = data.gameOver;
    this.prevScene = data.sceneKey;
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
        fontFamily: 'Thectro',
        fontSize: isMobile ? '20px' : '40px',
        color: 'red',
      },
      width: CONFIG_SIZE.GAME_WIDTH,
    });

    this.add.existing(this.message);
    this.grid.placeAt(CONFIG_SIZE.END_SCENE.message, this.message);
    this.message.x = CONFIG_SIZE.GAME_WIDTH / 2 - this.message.width / 2;

    this.button = new ButtonWrapper({
      scene: this,
      key: 'button',
      text: lang.endScene.playAgainButton,
      style: {
        color: 'black',
        align: 'center',
        fontFamily: 'Roboto'
      },
      event: 'RESTART_GAME',
    });
    this.grid.placeAt(CONFIG_SIZE.END_SCENE.button, this.button);

    this.cameras.main.fadeIn(1000, 0, 0, 0);

    this.events.on('RESTART_GAME', this.restartGame, this);
    EventsCenter.on('RENDER_END_SCENE', this.reset, this);
    
    // this.grid.showNumbers();
  }

  reset(data) {
    this.init(data)
    this.message.setText(this.gameOver ? lang.endScene.defeatMessage : lang.endScene.victoryMessage);
    this.message.x = CONFIG_SIZE.GAME_WIDTH / 2 - this.message.width / 2;
    this.cameras.main.fadeIn(1000, 0, 0, 0);
  }

  restartGame() {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function() {
			this.scene.wake(this.prevScene);
      this.scene.bringToTop(this.prevScene);
      EventsCenter.emit('RESET');
      this.scene.sleep('EndScene');
		}, this);
		this.cameras.main.fadeOut(2000, 0, 0, 0);
  }
}
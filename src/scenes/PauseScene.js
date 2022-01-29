import * as Phaser from 'phaser';
import { Align } from '../utils';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super({
      key: 'PauseScene',
    });
  }
  
  init(data) {
    this.sceneKey = data.sceneKey;
  }

  create() {
    if (!isMobile) {
      this.playButton = this.add.image(game.config.width / 2, game.config.height / 2, 'play');
      Align.scaleToGameW(this.playButton, CONFIG_SIZE.PLAY_BUTTON_SIZE);
      // this.playButton.setInteractive();
    }

    this.events.on('PLAY_SCENE', function () {
      this.scene.bringToTop('PlayScene');
      this.scene.resume(this.sceneKey);
      this.scene.sleep('PauseScene');
    }, this);

    this.scene.bringToTop(this);
  }

  fallbackToKeyboard() {
    const keySpace = this.input.keyboard.addKey('SPACE');
    
    if (keySpace.isDown) {
      this.scene.bringToTop('PlayScene');
      this.scene.resume(this.sceneKey);
      this.scene.stop();
    }
  }

  update() {
    if (!isMobile) {
      this.fallbackToKeyboard();
    } 
  }
}
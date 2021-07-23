import * as Phaser from 'phaser';
import PlayScene from './scenes/PlayScene';
import LoadScene from './scenes/LoadScene';
import { CONFIG_SIZE_SMALL_SCREEN, CONFIG_SIZE_LARGE_SCREEN } from './config';

let isMobile = navigator.userAgent.indexOf('Mobile');

if (isMobile === -1) {
  isMobile = navigator.userAgent.indexOf('Tablet');
}

const config = isMobile === -1 ? {
	type: Phaser.CANVAS,
  parent: 'app',
  width: 800,
  height: 480,
  scene: [LoadScene, PlayScene],
  physics: {
    default: 'arcade',
  	arcade: {
  		debug: false,
  	},
  }
} : {
  type: Phaser.AUTO,
  parent: 'app',
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [LoadScene, PlayScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  },
  input: {
    activePointers: 3,
  }
};

window.game = new Phaser.Game(config);
window.emitter = new Phaser.Events.EventEmitter();
window.isMobile = isMobile !== -1;
window.CONFIG_SIZE = window.isMobile ? CONFIG_SIZE_SMALL_SCREEN : CONFIG_SIZE_LARGE_SCREEN;
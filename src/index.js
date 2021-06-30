import * as Phaser from 'phaser';
import PlayScene from './scenes/PlayScene';
import LoadScene from './scenes/LoadScene';

let isMobile = navigator.userAgent.indexOf('Mobile');

if (isMobile === -1) {
  isMobile = navigator.userAgent.indexOf('Tablet');
}

const config = isMobile === -1 ? {
	type: Phaser.AUTO,
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
      debug: true,
    }
  },
  input: {
    activePointers: 3,
  }
};

window.game = new Phaser.Game(config);
window.emitter = new Phaser.Events.EventEmitter();
window.isMobile = isMobile !== -1;
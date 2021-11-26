import * as Phaser from 'phaser';
import PlayScene from './scenes/PlayScene';
import LoadScene from './scenes/LoadScene';
import EndScene from './scenes/EndScene';

import { CONFIG_SIZE_SMALL_SCREEN, CONFIG_SIZE_LARGE_SCREEN } from './config';

let isMobile = navigator.userAgent.indexOf('Mobile');

if (isMobile === -1) {
  isMobile = navigator.userAgent.indexOf('Tablet');
}

window.updateTemplateDOM = function(eventName) {
  switch(eventName) {
    case 'SHOW_GAME_AREA_LOADING':
      const container = document.getElementById('container');
      const mdLoader = document.createElement('div');
      mdLoader.id = 'md-loader-container';
      const loader = document.createElement('div');
      loader.className = 'loader';
      mdLoader.appendChild(loader);

      container.prepend(mdLoader);
      return;
    case 'SHOW_GAME_AREA':
      document.getElementById('md-loader-container').remove();
      document.getElementById('app').classList.remove('display-hidden');
      return;
  }
};

updateTemplateDOM('SHOW_GAME_AREA_LOADING');

const config = isMobile === -1 ? {
	type: Phaser.CANVAS,
  parent: 'app',
  width: window.innerWidth * 0.6,
  height: window.innerHeight * 0.7,
  scene: [LoadScene, PlayScene, EndScene],
  physics: {
    default: 'arcade',
  	arcade: {
  		debug: true,
  	},
  },
  audio: {
    disableWebAudio: true,
  },
} : {
  type: Phaser.AUTO,
  parent: 'app',
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [LoadScene, PlayScene, EndScene],
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
window.CONFIG_SIZE = window.isMobile ? CONFIG_SIZE_SMALL_SCREEN(config) : CONFIG_SIZE_LARGE_SCREEN(config);
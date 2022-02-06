
import * as Phaser from 'phaser';
import PlayScene from './scenes/PlayScene';
import LoadScene from './scenes/LoadScene';
import EndScene from './scenes/EndScene';
import PauseScene from './scenes/PauseScene';
import { CONFIG_SIZE_SMALL_SCREEN, CONFIG_SIZE_LARGE_SCREEN } from './config';
import { EventsCenter } from './components';

window.updateTemplateDOM = function(eventName, params) {
  switch(eventName) {
    case 'SHOW_GAME_AREA_LOADING':
      const container = document.getElementById('container');
      const mdLoader = document.createElement('div');
      mdLoader.id = 'loader-container';
      const loader = document.createElement('div');
      loader.className = 'loader';
      mdLoader.appendChild(loader);

      container.prepend(mdLoader);
      return;
    case 'SHOW_GAME_AREA':
      document.getElementById('loader-container').remove();
      document.getElementById('app').classList.remove('display-hidden');
      return;
    case 'SHOW_MOBILE_INSTRUCTIONS':
      document.getElementById('mobile_instructions').style.display = 'block';
      return;
    case 'HIDE_MOBILE_INSTRUCTIONS':
      document.getElementById('mobile_instructions').style.display = 'none';
      EventsCenter.emit('PLAY_SCENE');
      return;
    case 'SHOW_UPDATE':
      document.getElementById('update-banner').style.display = 'flex';
      document.getElementById('update-button').onclick = () => updateTemplateDOM('UPDATE_NOW', { reg: params.reg });
      return;
    case 'UPDATE_NOW':
      params.reg.waiting.postMessage('SKIP_WAITING');
      document.getElementById('update-banner').style.display = 'none';
      return;
  }
};

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('../service-worker.js');
      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing;
        newWorker.addEventListener('statechange', () => {
          if (reg.waiting) {
            if (navigator.serviceWorker.controller) {
              updateTemplateDOM('SHOW_UPDATE', { reg });
            }
          }
        });
      });
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    } catch (error) {
      console.log('No service worker');
    }
  });
}

let isMobile = navigator.userAgent.indexOf('Mobile');

if (isMobile === -1) {
  isMobile = navigator.userAgent.indexOf('Tablet');
}

updateTemplateDOM('SHOW_GAME_AREA_LOADING');

const config = isMobile === -1 ? {
	type: Phaser.CANVAS,
  parent: 'app',
  width: window.innerWidth * 0.6,
  height: window.innerHeight * 0.7,
  scene: [LoadScene, PauseScene, PlayScene, EndScene],
  physics: {
    default: 'arcade',
  	arcade: {
  		debug: false,
  	},
  },
} : {
  type: Phaser.AUTO,
  parent: 'app',
  width: window.innerWidth,
  height: window.innerHeight,
  scene: [LoadScene, PauseScene, PlayScene, EndScene],
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
    }
  },
  input: {
    activePointers: 3,
  },
  audio: {
    disableWebAudio: true,
  }
};

window.game = new Phaser.Game(config);
// window.emitter = new Phaser.Events.EventEmitter();
window.isMobile = isMobile !== -1;
window.CONFIG_SIZE = window.isMobile ? CONFIG_SIZE_SMALL_SCREEN(config) : CONFIG_SIZE_LARGE_SCREEN(config);

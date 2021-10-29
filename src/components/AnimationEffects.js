import * as Phaser from 'phaser';
// import { Align } from '../utils';

export default class AnimationEffects {
	constructor(config) {
    this.scene = config.scene;
    this.tweenManager = new Phaser.Tweens.TweenManager(config.scene);
	}

  destroyEnemyStation() {
    emitter.emit('ENEMY_STATION_DESTROYED');
  }

  enemyStationDestruction({ targets }) {
    this.tweenManager.add({
      duration: 300,
      targets,
      scaleX: 10,
      scaleY: 10,
      ease: 'Sine.easeInOut',
      // onComplete: this.destroyEnemyStation,
      yoyo: true,
      repeat: -1,
      callbackScope: this.tweenManager.scene,
    });
  }
}
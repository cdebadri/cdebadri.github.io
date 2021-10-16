import * as Phaser from 'phaser';
// import { Align } from '../utils';

export default class AnimationEffects {
	constructor() {
    this.animationManager = new Phaser.Animations.AnimationManager(game);
    this.textureManager = new Phaser.Textures.Texture(game);
    this.lowHealth();
	}

  lowHealth() {
    this.textureManager.createCanvas('fire', 60, 70)
    let fireFrames = this.animationManager.generateFrameNumbers('fire');
    fireFrames = fireFrames.slice().reverse().concat(fireFrames);
    this.animationManager.create({
      key: 'lowHealth',
      frames: fireFrames,
      frameRate: 48,
      repeat: true,
    });
  }
}
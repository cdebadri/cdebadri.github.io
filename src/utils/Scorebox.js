import * as Phaser from 'phaser';

export default class Scorebox extends Phaser.GameObjects.Container {
	constructor(config) {
		super(config.scene);

		this.scene = config.scene;
		this.text1 = this.scene.add.text(0, 0, `SCORE\n${model.score}`);
		this.text1.setOrigin(0.5, 0.5);
		this.add(this.text1);

		this.scene.add.existing(this);
		this.on('SCORE_UPDATED', this.scoreUpdated, this);
	}

	scoreUpdated() {
		this.text1.setText(['SCORE', model.score]);
	}

  on(event, func, context) {
    Phaser.GameObjects.Container.prototype.on.call(this, event, func, context);
  }
}
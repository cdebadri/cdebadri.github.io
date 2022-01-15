import * as Phaser from 'phaser';

export default class Bar extends Phaser.GameObjects.Container {
	constructor(config) {
		super(config.scene);
		this.scene = config.scene;
		this.color = config.color ? config.color : 0xff0000;
		this.width = config.width ? config.width : Math.floor(0.5 * game.config.width);
		this.height = config.height ? config.height : Math.floor(0.05 * game.config.height);

    this.box = this.scene.add.graphics();
    this.box.lineStyle(4, this.color);
    this.box.strokeRect(0, 0, this.width, this.height);

		this.graphics = this.scene.add.graphics();
		this.graphics.fillStyle(this.color, 1);
		this.graphics.fillRect(0, 0, this.width, this.height);
    this.graphics.setDepth(2);
    
		this.add(this.graphics);
    this.add(this.box);
		this.scene.add.existing(this);
	}

	setPercent(percent) {
		this.graphics.scaleX = percent;
	}
}
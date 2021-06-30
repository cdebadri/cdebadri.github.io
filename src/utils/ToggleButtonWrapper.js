import * as Phaser from 'phaser';
import * as Align from './Align';

export default class ToggleButtonWrapper extends Phaser.GameObjects.Container {
	constructor(config) {
		super(config.scene);
		this.scene = config.scene;
		this.event = config.event;
		
		this.background = this.scene.add.image(0, 0, config.background);
		Align.scaleToGameW(this.background, .1);
		this.add(this.background);

		this.iconTrue = this.scene.add.image(0, 0, config.iconTrue);
		Align.scaleToGameW(this.iconTrue, .05);
		this.add(this.iconTrue);

		this.iconFalse = this.scene.add.image(0, 0, config.iconFalse);
		this.iconFalse.visible = false;
		Align.scaleToGameW(this.iconFalse, .05);
		this.add(this.iconFalse);

		this.background.setInteractive();
		this.background.on('pointerdown', this.pressed, this);

		this.scene.add.existing(this);
	}

	pressed() {
		emitter.emit(this.event);
		this.iconTrue.visible = !this.iconTrue.visible;
		this.iconFalse.visible = !this.iconFalse.visible;
		
	}
}
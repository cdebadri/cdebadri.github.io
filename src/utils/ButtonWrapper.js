import * as Phaser from 'phaser';

export default class ButtonWrapper extends Phaser.GameObjects.Container {
	constructor(config) {
		if (!config.scene) {
			console.error('missing scene');
			return;
		}

		if (!config.key) {
			console.error('misssing key');
			return;
		}

		if (!config.text) {
			console.error('misssing key');
			return;
		}

		super(config.scene);
		this.config = config;
		this.scene = config.scene;
		this.x = config.x ? config.x : 0;
		this.y = config.y ? config.y : 0;
		this.background = this.scene.add.image(0, 0, config.key);
		this.add(this.background);
		this.buttonText = this.scene.add.text(0, 0, config.text, {...config.style});
		this.buttonText.setOrigin(0.5, 0.5);
		this.add(this.buttonText);

		if (config.event) {
			this.background.setInteractive();
			this.background.on('pointerdown', this.pressed, this);
		}

		this.scene.add.existing(this);
	}

	pressed() {
		emitter.emit(this.config.event);
	}
}
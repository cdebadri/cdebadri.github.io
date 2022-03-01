import * as Phaser from 'phaser';
import { Align } from '.';

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

		super(config.scene);
		this.config = config;
		this.scene = config.scene;
		this.x = config.x ? config.x : 0;
		this.y = config.y ? config.y : 0;
		this.background = this.scene.add.image(0, 0, config.key);
    this.background.setScrollFactor(0);
    this.background.setDepth(2);

    if (config.event) {
			this.background.setInteractive();
			this.background.on('pointerdown', this.pressed, this);
      if (config.longPress) {
        this.background.on('pointerup', this.unpressed, this);
      }
		}

    this.add(this.background);

    if (config.scaleFactor) {
      Align.scaleToGameW(this.background, config.scaleFactor);
    }
    if (config.text) {
      this.buttonText = this.scene.add.text(0, 0, config.text, {...config.style});
      const textX = config.textX ? config.textX : 0.5;
      const textY = config.textY ? config.textY : 0.5;
      this.buttonText.setOrigin(textX, textY);
      this.add(this.buttonText);
    }

    this.pressGesture = this.scene.tweens.create({
      targets: this.background,
      ease: 'Quad.easeInOut',
      scaleX: 0.8 * this.background.scaleX,
      scaleY: 0.8 * this.background.scaleY,
      duration: 250,
      onCallbackScope: this,
    });

    this.unpressGesture = this.scene.tweens.create({
      targets: this.background,
      ease: 'Quad.easeInOut',
      scaleX: this.background.scaleX,
      scaleY: this.background.scaleY,
      duration: 250,
      onCallbackScope: this,
    });
		
		this.scene.add.existing(this);
	}

	pressed() {
    this.scene.tweens.makeActive(this.pressGesture);
    if (this.config.longPress) {
      this.repeatTimer = this.scene.time.addEvent({
        callback: function () {
          this.scene.events.emit(this.config.event);
        },
        callbackScope: this,
        delay: 200,
        loop: true,
      })
    } else {
  		this.scene.events.emit(this.config.event);
    }
	}

  unpressed() {
    this.scene.tweens.makeActive(this.unpressGesture);
    this.scene.time.removeEvent(this.repeatTimer);
  }

  updateText(text) {
    this.buttonText.setText(text);
  } 
}
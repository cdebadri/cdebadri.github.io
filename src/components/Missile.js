import * as Phaser from 'phaser';
import { Align } from '../utils';

export default class Missile extends Phaser.Physics.Arcade.Sprite {
	constructor({ scene, x, y, key, angle, shipX, shipY }) {
		super(scene, x, y, key);
		this.scene = scene;
		this.shipX = shipX;
		this.shipY = shipY
		this.angle = angle + 90;
		Align.scaleToGameW(this, .02);

		scene.add.existing(this);
		scene.physics.add.existing(this);
		// this.setCollideWorldBounds(true);

		this.recalibratePosition();
		this.addListener('RECALIBRATE', this.recalibratePosition, this);
	}

	recalibratePosition(angle = null, posx = null, posy = null) {
		let x = this.shipX;
		let y = this.shipY;

		if (angle && posx && posy) {
			this.angle = angle + 90;
			x = posx;
			y = posy;
		}

		this.scene.physics.moveTo(this, x, y, 200);
	}
}
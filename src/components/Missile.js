import * as Phaser from 'phaser';
import { Align } from '../utils';

export default class Missile {
	constructor({ world, scene, key }) {
		this.group = new Phaser.Physics.Arcade.Group(world, scene, {
      defaultKey: key,
      runChildUpdate: true,
    });

    this.scene = scene;
	}
	
  spawn({ x, y, angle, shipX, shipY }) {
		const missile = this.group.get();

    missile.enableBody(true, x, y, true, true);
		missile.shipX = shipX;
		missile.shipY = shipY
		missile.angle = angle + 90;
		Align.scaleToGameW(missile, .02);

		this.scene.add.existing(missile);
		this.scene.physics.add.existing(missile);

		this.recalibratePosition(missile);
		missile.addListener('RECALIBRATE', this.recalibratePosition, missile);
    
		return missile;
	}

	recalibratePosition(missile, angle = null, posx = null, posy = null) {
		let x = missile.shipX;
		let y = missile.shipY;

		if (angle && posx && posy) {
			missile.angle = angle + 90;
			x = posx;
			y = posy;
		}

		this.scene.physics.moveTo(missile, x, y, 300);
	}

  destroy() {
    this.group.clear(true, true);
  }
}
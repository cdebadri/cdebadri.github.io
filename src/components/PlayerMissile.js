import { Physics } from 'phaser';
import { Align } from '../utils';

export default class PlyaerMissile {
  constructor({ world, scene, key }) {
		this.group = new Physics.Arcade.Group(world, scene, {
      defaultKey: key,
      runChildUpdate: true,
    });

    this.scene = scene;
	}

  spawn({ x, y, angle }) {
		const missile = this.group.get();

    missile.enableBody(true, x, y, true, true);
		missile.angle = angle + 90;
		Align.scaleToGameW(missile, .04);

		this.scene.physics.add.existing(missile);
    missile.body.setVelocity(
			Math.cos(Align.toRadians(angle)) * 300,
			Math.sin(Align.toRadians(angle)) * 300
		);
    
		return missile;
	}
} 
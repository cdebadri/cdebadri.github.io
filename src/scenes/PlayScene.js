import * as Phaser from 'phaser';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick.js';
import { Grid, Align } from '../utils';
import { FindClosest } from '../components';
import { CONFIG_SIZE } from '../config';

export default class PlayScene extends Phaser.Scene {
	constructor() {
		super({ 
			key: 'PlayScene',
		});
	}

	create() {
		this.grid = new Grid({
			scene: this,
			rows: 12,
			cols: 15,
			color: 'white',
		});

		// const shapes = this.cache.json.get('shapes');

		this.background = this.add.image(0, 0, 'background');
		this.background.setOrigin(
			0, 
			0
		);
		this.physics.world.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

		if (isMobile) {
			this.createJoystick();
			this.createFireButton();
		}

		this.ship = this.physics.add.sprite(0, 0, 'player');
		Align.scaleToGameW(this.ship, CONFIG_SIZE.SHIP);
		this.setShipConfigurations();
		this.ship.body.collideWorldBounds = true;
		this.grid.placeAt(565, this.ship);

		// this.isEnemyAvailable = false;

		this.enemyFightersGroup = this.physics.add.group();

		this.bulletGroup = this.physics.add.group();

		this.enemyBulletGroup = this.physics.add.group();

		this.rockGroup = this.physics.add.group({
      key: 'rocks',
      frame: [0, 1, 2],
      frameQuantity: 5,
      bounceX: 1,
      bounceY: 1,
      angularVelocity: 1,
      collideWorldBounds: true,
    });
    this.createRocks();

    this.enemyStation = this.physics.add.sprite(
			Math.floor(this.background.displayWidth / 2),
			Math.floor(this.background.displayHeight / 2),
			'enemyStation'
		);
		Align.scaleToGameW(this.enemyStation, CONFIG_SIZE.ENEMY_STATION);
		this.enemyStation.body.setCircle(CONFIG_SIZE.ENEMY_STATION_BODY * game.config.height);
		this.setEnemyStationConfigurations();
		this.createEnemyFighter();

    let expFrames = this.anims.generateFrameNumbers('exp');
    expFrames = expFrames.slice().reverse().concat(expFrames);
    this.anims.create({
      key: 'boom',
      frames: expFrames,
      frameRate: 48,
      repeat: false,
    });

		this.cameras.main.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);
		this.cameras.main.startFollow(this.ship, true);

		this.setColliders();

		// emitter.on('SPAWN_ENEMY', this.createEnemy, this);

		// this.grid.showNumbers();
	}

	createFireButton() {
		// fire button needs to be changed
		this.fireButton = this.add.circle(
			0, 
			0, 
			Math.floor(CONFIG_SIZE.FIRE_BUTTON * game.config.height), 
			0xff0000, 
			0.5
		);
		this.fireButton.setScrollFactor(0);
		this.fireButton.setInteractive();
		this.fireButton.on('pointerdown', this.makeBullets, this);
		this.grid.placeAt(121, this.fireButton);
	}

	createJoystick() {
		this.joystick = new VirtualJoystick(this, {
			x: 0,
			y: 0,
			radius: Math.floor(CONFIG_SIZE.JOYSTICK_RADIUS * game.config.height),
			base: this.add.circle(
				0, 
				0, 
				Math.floor(CONFIG_SIZE.JOYSTICK_BASE * game.config.height),
				0xc0c0c0,
				.3
			),
			thumb: this.add.circle(
				0,
				0,
				Math.floor(CONFIG_SIZE.JOYSTICK_THUMB * game.config.height),
				0xffffff,
				.3
			)
		});
		this.joystick.on('update', this.onJoystickUpdate, this);
		this.grid.placeAt(133, this.joystick);
	}

	setColliders() {
		this.physics.add.collider(this.rockGroup);
		this.physics.add.collider(this.bulletGroup, this.rockGroup, this.destroyRocks, null, this);
		this.physics.add.overlap(this.ship, this.rockGroup, this.rockDestroyShip, null, this);
		this.physics.add.collider(this.enemyBulletGroup, this.rockGroup, this.destroyRocks, null, this);
		this.physics.add.overlap(this.ship, this.enemyBulletGroup, this.enemyDestroysShip, null, this);

		this.physics.add.collider(this.enemyFightersGroup, this.rockGroup);
		this.physics.add.collider(this.enemyStation, this.rockGroup);
		this.physics.add.overlap(this.enemyFightersGroup, this.bulletGroup, this.shipDestroysEnemy, null, this);
		this.physics.add.overlap(this.enemyStation, this.bulletGroup, this.shipDestroysStation, null, this);
	}

	shipDestroysStation(station, bullet) {
		const explosion = this.add.sprite(bullet.x, bullet.y, 'exp');
		bullet.destroy();
		explosion.play('boom');
	}

	enemyDestroysShip(ship, bullet) {
		bullet.destroy();
		const explosion = this.add.sprite(ship.x, ship.y, 'exp');
		explosion.play('boom');
	}

	createRocks() {
		this.rockGroup.children.iterate(function(child) {
      const xx = Math.floor(Math.random() * this.background.displayWidth);
      const yy = Math.floor(Math.random() * this.background.displayHeight);
      child.x = xx;
      child.y = yy;
      Align.scaleToGameW(child, CONFIG_SIZE.ROCKS);

      let vx = Math.floor(Math.random() * 2) - 1;
      let vy = Math.floor(Math.random() * 2) - 1;
      if (vx === 0 && vy === 0) {
        vx = 1;
        vy = 1;
      }
      const speed = Math.floor(Math.random() * 200) + 10;
      child.body.setVelocity(vx * speed, vy * speed);
    }.bind(this));
	}

	rockDestroyShip(ship, rock) {
		rock.destroy();
		const explosion = this.add.sprite(ship.x, ship.y, 'exp');
    explosion.play('boom');
	}

	destroyRocks(bullet, rock) {
    bullet.destroy();
    const explosion = this.add.sprite(rock.x, rock.y, 'exp');
    explosion.play('boom');
    rock.destroy();
  }

	onJoystickUpdate() {
		if (this.joystick.force !== 0) {
			this.ship.angle = this.joystick.angle;
		}
		this.ship.body.setVelocity(
			Math.min(this.joystick.force, 1) * Math.cos(Align.toRadians(this.joystick.angle)) * this.ship.topSpeed,
			Math.min(this.joystick.force, 1) * Math.sin(Align.toRadians(this.joystick.angle)) * this.ship.topSpeed
		);
	}

	setShipConfigurations() {
		this.ship.angle = -90;
		this.ship.topSpeed = 120;
	}

	makeBullets() {
		const bullet = this.physics.add.sprite(0, 0, 'bullet');
		this.bulletGroup.add(bullet);
		bullet.x = this.ship.x;
		bullet.y = this.ship.y;
		bullet.angle = this.ship.angle;
		bullet.body.setVelocity(
			Math.cos(Align.toRadians(bullet.angle)) * 200,
			Math.sin(Align.toRadians(bullet.angle)) * 200
		);
	}

	setEnemyConfigurations(eship) {
		eship.topSpeed = 50;
		eship.range = game.config.height / 3;
		eship.flyRange = game.config.height / 3;
		eship.setPushable(false);
	}

	setEnemyStationConfigurations() {
		this.enemyStation.range = game.config.height / 2;
		this.enemyStation.assistGroup = 1;
		this.enemyStation.assistPositions = [];
		this.enemyStation.setPushable(false);
		
		const rad = this.enemyStation.range;
		for (let i = 0; i < this.enemyStation.assistGroup; i++) {
			const angle = Phaser.Math.RND.angle();
			this.enemyStation.assistPositions.push({
				x: rad * Math.cos(Align.toRadians(angle)) + this.enemyStation.x,
				y: rad * Math.sin(Align.toRadians(angle)) + this.enemyStation.y,
				angle,
			});

			this.enemyStation.assistPositions.push({
				x: rad * Math.cos(Align.toRadians(angle + 90)) + this.enemyStation.x,
				y: rad * Math.sin(Align.toRadians(angle + 90)) + this.enemyStation.y,
				angle: angle + 90,
			});

			this.enemyStation.assistPositions.push({
				x: rad * Math.cos(Align.toRadians(angle + 180)) + this.enemyStation.x,
				y: rad * Math.sin(Align.toRadians(angle + 180)) + this.enemyStation.y,
				angle: angle + 180,
			});

			this.enemyStation.assistPositions.push({
				x: rad * Math.cos(Align.toRadians(angle + 270)) + this.enemyStation.x,
				y: rad * Math.sin(Align.toRadians(angle + 270)) + this.enemyStation.y,
				angle: angle + 270,
			});
		}

		this.enemyFightersGroup.addListener('retracePosition', this.maintainPosition, this);
	}

	createEnemyFighter() {
		for (let i = 0; i < this.enemyStation.assistPositions.length; i++) {
			const position = this.enemyStation.assistPositions[i];
			const eship = this.physics.add.sprite(
				position.x, 
				position.y, 
				'eship'
			);
			Align.scaleToGameW(eship, CONFIG_SIZE.ENEMY_SHIP);
			this.enemyFightersGroup.add(eship);
			this.setEnemyConfigurations(eship);
			eship.name = `fighter-${i + 1}`;
			eship.angle = position.angle;
			eship.x = position.x;
			eship.y = position.y;
			eship.originalX = position.x;
			eship.originalY = position.y;
			eship.setCollideWorldBounds(true);
		}
	}

	shipDestroysEnemy(ship, bullet) {
		const explosion = this.add.sprite(bullet.x, bullet.y, 'exp');
		bullet.destroy();
		explosion.play('boom');
	}

	getTimer() {
		return new Date().getTime();
	}

	maintainPosition() {
		const pursuingFighterName = this.pursuingFighter.name;
		this.enemyFightersGroup.getChildren().forEach(function(child) {
			if (child.name !== pursuingFighterName && child.speed !== 0) {
				this.retracePosition(child);
			}
		}, this);
	}

	retracePosition(fighter) {
		if (
			Align.detectProximity(fighter, { x: fighter.originalX, y: fighter.originalY }, 10)
			) {
			fighter.body.setVelocity(0, 0);
		} else {
			this.physics.moveTo(fighter, fighter.originalX, fighter.originalY, fighter.topSpeed);
		}	
	}

	moveEnemy(fighter) {
		const rad = Phaser.Math.Angle.Between(fighter.x, fighter.y, this.ship.x, this.ship.y);
		fighter.angle = Align.toDegrees(rad);

		// if (this.pursuingFighter && this.pursuingFighter.name !== fighter.name) {
		// 	console.log(this.pursuingFighter);
		// 	this.retracePosition(this.pursuingFighter);
		// }
		this.enemyFightersGroup.emit('retracePosition');

		if (
			Align.detectProximity(fighter, this.ship, fighter.flyRange)
		) {
			this.physics.moveTo(fighter, this.ship.x, this.ship.y, fighter.topSpeed);
		} else {
			this.retracePosition(fighter);
		}
	}

	makeEnemyBullets(fighter) {
		const elapsed = Math.abs(this.lastEnemyBullet - this.getTimer());
		
		if (elapsed < 500) {
			return;
		}

		this.lastEnemyBullet = this.getTimer();
		const bullet = this.physics.add.sprite(fighter.x, fighter.y, 'ebullet');
		Align.scaleToGameW(bullet, CONFIG_SIZE.ENEMY_BULLET);
		this.enemyBulletGroup.add(bullet);
		bullet.x = fighter.x;
		bullet.y = fighter.y;
		bullet.angularVelocity = 10;
		this.physics.moveTo(bullet, this.ship.x, this.ship.y, 200);
	}

	fallbackToKeyboard() {
		const cursors = this.input.keyboard.createCursorKeys();
		const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
		let stop = false;

		if (keyS.isDown) {
			this.makeBullets();
		}

		if (cursors.left.isDown && cursors.up.isDown) {
			this.ship.angle = 225;
		} else if (cursors.right.isDown && cursors.up.isDown) {
			this.ship.angle = 315;
		} else if (cursors.left.isDown && cursors.down.isDown) {
			this.ship.angle = 135;
		} else if (cursors.right.isDown && cursors.down.isDown) {
			this.ship.angle = 45;
		} else if (cursors.left.isDown) {
			this.ship.angle = 180;
		} else if (cursors.right.isDown) {
			this.ship.angle = 0;
		} else if (cursors.down.isDown) {
			this.ship.angle = 90;
		} else if (cursors.up.isDown) {
			this.ship.angle = -90;
		} else {
			stop = true;
		}

		if (stop) {
			this.ship.body.setVelocity(0, 0);
		} else {
			this.ship.body.setVelocity(
				Math.cos(Align.toRadians(this.ship.angle)) * this.ship.topSpeed,
				Math.sin(Align.toRadians(this.ship.angle)) * this.ship.topSpeed
			);
		}
	}

	update() {
		if (!isMobile) {
			this.fallbackToKeyboard();
		}

		let closestEnemyFighter;

		if (this.enemyFightersGroup.getLength() > 0) {
			closestEnemyFighter = FindClosest(this.enemyFightersGroup, this.ship);
			this.pursuingFighter = closestEnemyFighter;
			this.moveEnemy(closestEnemyFighter);

			if (Align.detectProximity(
					this.ship, 
					closestEnemyFighter, 
					closestEnemyFighter.range 
				)
			) {
				this.makeEnemyBullets(closestEnemyFighter);
			}
		}
	}
}
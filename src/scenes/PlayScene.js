import * as Phaser from 'phaser';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick';
import { Grid, Align, Model, Bar, Media, Text, ButtonWrapper } from '../utils';
import { FindClosest, Missile } from '../components';
import CleanupGroup from '../components/CleanupGroup';

export default class PlayScene extends Phaser.Scene {
	constructor() {
		super({ 
			key: 'PlayScene',
		});
	}

  init() {
		this.model = new Model();
    this.media = new Media({ scene: this });
  }

	create() {
		this.grid = new Grid({
			scene: this,
			rows: 12,
			cols: 15,
			color: 'white',
		});

    // this.effects = new AnimationEffects({ scene: this });

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
      this.messageIconForMobile();
		}

		this.shipGroup = this.physics.add.group({
			defaultKey: 'player',
			scene: this,
		});

		this.ship = this.shipGroup.get();
		this.ship.enableBody(true, 0, 0, true, true);
		Align.scaleToGameW(this.ship, CONFIG_SIZE.SHIP);
		this.setShipConfigurations();
		this.ship.body.collideWorldBounds = true;
		this.grid.placeAt(565, this.ship);
    this.ship.setVisible(true);
		this.showShipHealth();

		// this.isEnemyAvailable = false;

		this.bulletGroup = this.physics.add.group({
			defaultKey: 'bullet',
			runChildUpdate: true,
		});

		this.enemyBulletGroup = this.physics.add.group({
			defaultKey: 'ebullet',
			runChildUpdate: true,
		});

		this.rockGroup = this.physics.add.group({
			key: 'rocks',
			frame: [0, 1, 2],
			frameQuantity: 5,
			bounceX: 1,
			bounceY: 1,
			angularVelocity: 1,
			collideWorldBounds: true,
			runChildUpdate: true,
		});

    this.createRocks();

		this.enemyStationGroup = this.physics.add.group({
			defaultKey: 'enemyStation',
		});
	
    this.enemyStation = this.enemyStationGroup.get(
      Math.floor(this.background.displayWidth / 2),
      Math.floor(this.background.displayHeight / 2),
      undefined,
      undefined,
      true
    );
		Align.scaleToGameW(this.enemyStation, CONFIG_SIZE.ENEMY_STATION);
		this.enemyStation.body.setCircle(CONFIG_SIZE.ENEMY_STATION_BODY * game.config.height);

		this.enemyFightersGroup = this.physics.add.group({
			defaultKey: 'eship'
		});
	
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

		this.explosionGroup = this.add.group({
			defaultKey: 'exp',
		});

    this.missileGroup = new Missile({
      world: this.physics.world,
      scene: this,
      key: 'missile',
    });

		this.particles = this.add.particles('fire');

		this.cameras.main.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

		this.cameras.main.fadeIn(1000, 0, 0, 0);
		this.cameras.main.startFollow(this.ship, true);

		this.setColliders();

		emitter.on('SHIP_SHIELDS_CHANGE', this.changePlayerShieldValue, this);
    emitter.on('ENEMY_SHIPS_SHIELDS_CHANGE', this.checkEnemyShields, this);
    emitter.on('ENEMY_STATION_SHIELDS_CHANGE', this.checkEnemyStationShields, this);
    emitter.on('SHOW_INFO', this.showInfo, this);
    emitter.on('FIRE', this.makeBullets, this);
    this.pauseGame()
		this.setupClock();
    
		// this.grid.showNumbers();
	}

  pauseGame() {
    this.scene.launch('PauseScene', { sceneKey: 'PlayScene' });
    this.scene.pause('PlayScene');
  }

  showInfo() {
    updateTemplateDOM('SHOW_MOBILE_INSTRUCTIONS');
    this.pauseGame();
  }

  messageIconForMobile() {
    this.infoButton = new ButtonWrapper({
      scene: this,
      key: 'info',
      event: 'SHOW_INFO',
      scaleFactor: CONFIG_SIZE.MESSAGE_ICON_BUTTON_SIZE,
    });
    // this.infoButton.setDepth(2);
    // this.infoButton.setScrollFactor(0);
    this.grid.placeAt(CONFIG_SIZE.MESSAGE_ICON_PLACE, this.infoButton, 'corner');
  }

	setupClock() {
		this.timeTeller = this.time.addEvent({
			delay: CONFIG_SIZE.GAME_TIME,
      callbackScope: this,
      callback: function () {
        this.model.gameOver = true;
        this.transition();
      },
		});

    this.timeTellerText = new Text.createText({
      scene: this,
      text: `Time Left\n${Align.secsToMins(this.timeTeller.getRemainingSeconds())}`,
      style: {
        backgroundColor: 0xffffff,
        align: 'center'
      },
    });

    this.add.existing(this.timeTellerText);
    this.grid.placeAt(CONFIG_SIZE.TIMER_POSITION, this.timeTellerText, 'corner');
    this.timeTellerText.setScrollFactor(0);
    this.timeTellerText.setDepth(1);
	}

  destroyEnemyStation() {
    // this.events.off('ENEMY_STATION_DESTROYED');
    this.stationExplosionFireGroup.killAndHide(this.stationExplosionFire);
		this.transition();
  }

	destroyObjects() {
    // if (this.enemyBulletGroup) {
    //   this.enemyBulletGroup.destroy(this.enemyBulletGroup.getLength() > 0);
    // }
    // if (this.enemyFightersGroup) {
    //   this.enemyFightersGroup.destroy(this.enemyFightersGroup.getLength() > 0);
    // }
    // if (this.bulletGroup) {
  	// 	this.bulletGroup.destroy(this.bulletGroup.getLength() > 0);
    // }
    // if (this.rockGroup) {
  	// 	this.rockGroup.destroy(this.rockGroup.getLength() > 0);
    // }
    this.playerHealth.destroy();
		this.particles.destroy();
		this.background.destroy();
		this.shipGroup.clear(true, true);
		this.enemyBulletGroup.clear(true, true);
		this.rockGroup.clear(true, true);
		this.enemyFightersGroup.clear(true, true);
		this.enemyStationGroup.clear(true, true);
		this.bulletGroup.clear(true, true);
    if (this.stationExplosionFireGroup) {
		  this.stationExplosionFireGroup.clear(true, true);
    }
		this.explosionGroup.clear(true, true);
	}

  // takingFire(object) {
  //   object.shotTween = this.tweens.create({
  //     targets: object,
  //     // angle: {from: object.angle, to:object.angle + 5},
  //     ease: 'Bounce.easeInOut',
  //     duration: 500,
  //     yoyo: true,
  //   })
  // }

  createExplosion(x, y) {
		const explosion = this.explosionGroup.get(x, y, undefined, undefined, true);
    if (explosion.play) {
      explosion.play('boom');
    }
  }

	transition() {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function() {
      this.destroyObjects();
			this.scene.start('EndScene', { gameOver: this.model.gameOver });
		}, this);
		this.cameras.main.fadeOut(2000, 0, 0, 0);
	}

  checkEnemyStationShields() {
    if (this.model.enemyStationShields < 50 && this.model.enemyStationShields > 0 && !this.enemyStation.fireEmitter) {
      this.createFire(this.enemyStation);
    } else if (this.model.enemyStationShields === 0) {
      // a massive explosion
      if (this.enemyStation && 'fireEmitter' in this.enemyStation) {
        this.enemyStation.fireEmitter.remove();
      }

			this.stationExplosionFireGroup = this.add.group({
				defaultKey: 'fire',
			});

      this.stationExplosionFire = this.stationExplosionFireGroup.get(this.enemyStation.x, this.enemyStation.y);
      this.stationExplosionFire.setActive(true);
      this.stationExplosionFire.setVisible(true);
      // this.effects.enemyStationDestruction({ targets: this.stationExplosionFire });
      // this.enemyStation.destroy();
      const vanish = this.tweens.create({
        targets: this.stationExplosionFire,
        alpha: 0,
        ease: 'Sine.easeInOut',
        onComplete: function() {
          // emitter.emit('ENEMY_STATION_DESTROYED');
          this.tweens.killTweensOf(this.stationExplosionFire);
          this.destroyEnemyStation();
        },
        onCompleteScope: this,
        onStart: function() {
          emitter.emit('PLAY_SOUND', 'explosionSound');
          this.events.off('ENEMY_STATION_SHIELDS_CHANGE');
					this.enemyStation.disableBody(true, true);
          this.enemyFightersGroup.children.each(function(child) {
            this.model.enemyShipShields = {
              key: child.name,
              shield: 0
            };
          }, this);
        },
        onStartScope: this,
        callbackScope: this,
      });
      
      this.tweens.add({
        duration: 1000,
        targets: this.stationExplosionFire,
        scaleX: CONFIG_SIZE.ENEMY_STATION_EXPLOSION_FIRE,
        scaleY: CONFIG_SIZE.ENEMY_STATION_EXPLOSION_FIRE,
        ease: 'Quad.easeOut',
        onComplete: function() {
          this.tweens.makeActive(vanish);
        },
        onCompleteScope: this,
        callbackScope: this,
      });
    }
  }

	// destroyAllEnemyFighters() {

	// }

  checkEnemyShields(key) {
    // debugger;
    const enemyFighter = this.enemyFightersGroup.getChildren().find(child => child.name === key);
    const enemyFighterShield = this.model.getEnemyShipShields(key); 
    
    if (enemyFighterShield === 0) {
      emitter.emit('PLAY_SOUND', 'fightershot');
      if (enemyFighter) {
        this.createExplosion(enemyFighter.x, enemyFighter.y);
      }
      
      if (enemyFighter) {
        if ('fireEmitter' in enemyFighter) {
          enemyFighter.fireEmitter.remove();
        }
        // emitter.emit(`ENEMY_DESTROYED_${enemyFighter.name}`);
        this.events.off('ENEMY_SHIPS_SHIELDS_CHANGE');
				enemyFighter.disableBody(true, true);
      }
    } else if (enemyFighterShield < 50 && !enemyFighter.fireEmitter) {
      this.createFire(enemyFighter);
    }
  }

	// TODO
	showShipHealth() {
		this.playerHealth = new Bar({
			scene: this,
			color: 0xDC143C,
			width: CONFIG_SIZE.HEALTH.WIDTH,
      height: CONFIG_SIZE.HEALTH.HEIGHT,
		});

    this.grid.placeAt(CONFIG_SIZE.SHIP_HEALTH_POSITION, this.playerHealth);
    this.playerHealth.setScrollFactor(0);
    this.playerHealth.setDepth(1);
    this.hasLowHealth = false;
	}

  changePlayerShieldValue() {
    this.playerHealth.setPercent(this.model.shipShields / 100);
    if (this.model.shipShields < 50 && !this.hasLowHealth) {
      this.createFire(this.ship);
      this.hasLowHealth = true;
      const redAlert = this.add.graphics();
      redAlert.fillStyle(0xff0000, 0.3);
      redAlert.fillRect(0, 0, this.background.displayWidth, this.background.displayHeight);
      this.tweens.add({
        repeat: -1,
        yoyo: true,
        targets: redAlert,
        alpha: 0,
      });
    }

    if (this.model.shipShields === 0) {
      emitter.emit('PLAY_SOUND', 'fightershot');
      this.createExplosion(this.ship.x, this.ship.y);
      if ('fireEmitter' in this.ship) {
        this.ship.fireEmitter.remove();
      }
      this.ship.disableBody(true, true);
      this.model.gameOver = true;
			this.transition();
    }
  }

  createFire(object) {
    const { start, end } = object.name === 'ENEMY_STATION' ? CONFIG_SIZE.STATION_DAMAGE : CONFIG_SIZE.SHIP_DAMAGE; 

    object.fireEmitter = this.particles.createEmitter({
      alpha: { start: 1, end: 0 },
      scale: { start, end },
      speed: 20,
      angle: { min: object.angle-10, max: object.angle+10 },
      rotate: { min: -180, max: 180 },
      lifespan: { min: 1000, max: 1100 },
      blendMode: 'ADD',
      frequency: 110,
    });

    object.fireEmitter.startFollow(object);
  }

	createFireButton() {
		// fire button needs to be changed
		this.fireButton = new ButtonWrapper({
      scene: this,
      key: 'firebutton',
      scaleFactor: CONFIG_SIZE.FIRE_BUTTON_SIZE,
      event: 'FIRE',
    });
		this.fireButton.setScrollFactor(0);
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
		this.physics.add.overlap(this.bulletGroup, this.rockGroup, this.destroyRocks, PlayScene.shouldProcessOverlap, this);
		this.physics.add.overlap(this.ship, this.rockGroup, this.rockDestroyShip, PlayScene.shouldProcessOverlap, this);
		this.physics.add.overlap(this.enemyBulletGroup, this.rockGroup, this.destroyRocksEnemy, PlayScene.shouldProcessOverlap, this);
		this.physics.add.overlap(this.ship, this.enemyBulletGroup, this.enemyDestroysShip, PlayScene.shouldProcessOverlap, this);

		this.physics.add.collider(this.enemyFightersGroup, this.rockGroup);
		this.physics.add.collider(this.enemyStation, this.rockGroup);
		this.physics.add.overlap(this.enemyFightersGroup, this.bulletGroup, this.shipDestroysEnemy, PlayScene.shouldProcessOverlap, this);
		this.physics.add.overlap(this.enemyStation, this.bulletGroup, this.shipDestroysStation, PlayScene.shouldProcessOverlap, this);
	}

	static shouldProcessOverlap(object1, object2) {
		return object1.active && object2.active;
	}

	shipDestroysStation(station, bullet) {
    if (
      Align.detectProximity(
        station,
        bullet,
        game.config.height / CONFIG_SIZE.ENEMY_DETECTION_DENOM
      )
    ) {
      this.model.enemyStationShields -= 10;
      emitter.emit('PLAY_SOUND', 'explosionSound');
    } else {
      this.model.enemyStationShields -= 5;
      emitter.emit('PLAY_SOUND', 'fightershot');
    }
		
		this.createExplosion(bullet.x, bullet.y);
		bullet.disableBody(true, true);
	}

	enemyDestroysShip(ship, bullet) {
    emitter.emit('PLAY_SOUND', 'fightershot');
    this.createExplosion(ship.x, ship.y);
		bullet.disableBody(true, true);
		this.cameras.main.shake(200);
		this.model.shipShields -= 5;
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
		rock.disableBody(true, true);
    emitter.emit('PLAY_SOUND', 'fightershot');
    this.createExplosion(ship.x, ship.y);
    this.model.shipShields -= 1;
	}

	destroyRocks(bullet, rock) {
    emitter.emit('PLAY_SOUND', 'fightershot')
    this.createExplosion(rock.x, rock.y);
		rock.disableBody(true, true);
		bullet.disableBody(true, true);
  }

	destroyRocksEnemy(bullet, rock) {
    emitter.emit('PLAY_SOUND', 'fightershot');
    this.createExplosion(rock.x, rock.y);
		rock.disableBody(true, true);
		bullet.disableBody(true, true);
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
    // this.takingFire(this.ship);
	}

	makeBullets() {
    const elapsed = Math.abs(this.lastBullet - this.getTimer());
		
		if (elapsed < 500) {
			return;
		}

		this.lastBullet = this.getTimer();
    emitter.emit('PLAY_SOUND', 'gunshot');

		const bullet = this.bulletGroup.get(this.ship.x, this.ship.y);
		bullet.enableBody(true, this.ship.x, this.ship.y, true, true);
    bullet.originX = this.ship.x;
    bullet.originY = this.ship.y;
		bullet.angle = this.ship.angle;
		bullet.body.setVelocity(
			Math.cos(Align.toRadians(bullet.angle)) * 200,
			Math.sin(Align.toRadians(bullet.angle)) * 200
		);
	}

	setEnemyConfigurations(eship) {
		eship.topSpeed = 50;
		eship.range = game.config.height / CONFIG_SIZE.ENEMY_SHIP_DETECTION_DENOM;
		eship.flyRange = game.config.height / CONFIG_SIZE.ENEMY_SHIP_DETECTION_DENOM;
		eship.setPushable(false);
	}

	setEnemyStationConfigurations() {
    this.enemyStation.name = 'ENEMY_STATION';
		this.enemyStation.range = game.config.height / CONFIG_SIZE.ENEMY_DETECTION_DENOM;
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
			const eship = this.enemyFightersGroup.get(
				position.x, 
				position.y
			);
			eship.setActive(true);
      eship.setVisible(true);
			Align.scaleToGameW(eship, CONFIG_SIZE.ENEMY_SHIP);
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
    emitter.emit('PLAY_SOUND', 'fightershot');
    this.createExplosion(bullet.x, bullet.y)
		bullet.disableBody(true, true);
    // debugger;
		this.model.enemyShipShields = {
			key: ship.name,
			shield: this.model.getEnemyShipShields(ship.name) - 5,
		}
    // debugger;
	}

	getTimer() {
		return new Date().getTime();
	}

	maintainPosition() {
		const pursuingFighterName = this.pursuingFighter.name;
		this.enemyFightersGroup.children.iterate(function(child) {
			if (child.active && child.name !== pursuingFighterName && child.speed !== 0) {
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
			Align.detectProximity(fighter, this.ship, fighter.flyRange) && !this.model.gameOver
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
		const bullet = this.enemyBulletGroup.get(fighter.x, fighter.y);
		bullet.enableBody(true, fighter.x, fighter.y, true, true);

		Align.scaleToGameW(bullet, CONFIG_SIZE.ENEMY_BULLET);
		bullet.angularVelocity = 10;
		this.physics.moveTo(bullet, this.ship.x, this.ship.y, 200);
	}

	fallbackToKeyboard() {
		const cursors = this.input.keyboard.createCursorKeys();
		const keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    const keySpace = this.input.keyboard.addKey('SPACE');
		let stop = false;

		if (keyS.isDown) {
			this.makeBullets();
		}

    if (keySpace.isDown) {      
      this.scene.launch('PauseScene', {
        sceneKey: 'PlayScene',
      });
      this.scene.pause('PlayScene');
    }

    // keyS.on('down', this.makeBullets, this);

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

    if (this.ship.body) {
      if (stop) {
        this.ship.body.setVelocity(0, 0);
      } else {
        this.ship.body.setVelocity(
          Math.cos(Align.toRadians(this.ship.angle)) * this.ship.topSpeed,
          Math.sin(Align.toRadians(this.ship.angle)) * this.ship.topSpeed
        );
      }
    }
	}

	fireMissile() {
		if (
			Align.detectProximity(
				this.enemyStation,
				this.ship,
				this.enemyStation.range
			) &&
			!this.missile && !this.model.gameOver && this.enemyStation
		) {
			this.missile = this.missileGroup.spawn({
				x: this.enemyStation.x,
				y: this.enemyStation.y,
				shipX: this.ship.x,
				shipY: this.ship.y,
				angle: Align.toDegrees(
					Phaser.Math.Angle.Between(
						this.enemyStation.x,
						this.enemyStation.y,
						this.ship.x,
						this.ship.y
					)
				),
			});
			this.missileRecalibrationTime = new Date().getTime();
			this.physics.add.collider(this.missile, this.ship, this.missileDestroysShip, null, this);
			this.physics.add.collider(this.missile, this.rockGroup, this.rocksDestroyMissile, null, this);
		}
	}

	rocksDestroyMissile(missile, rock) {
    missile.disableBody(true, true);
		this.missile = null;
		this.createExplosion(rock.x, rock.y);
		rock.disableBody(true, true);
	}

	missileDestroysShip(missile, ship) {
		missile.disableBody(true, true);
		this.missile = null;
		this.createExplosion(ship.x, ship.y);
    this.model.shipShields = 0;
	}

	recalibrateMissile() {
		if (
			this.missile && this.missileRecalibrationTime
			&& (this.getTimer() - this.missileRecalibrationTime) > 5000 
		) {
			this.missile.emit(
				'RECALIBRATE',
        this.missile,
				Align.toDegrees(
					Phaser.Math.Angle.Between(
						this.missile.x,
						this.missile.y,
						this.ship.x,
						this.ship.y
					)
				),
				this.ship.x,
				this.ship.y 
			);

			this.missileRecalibrationTime = this.getTimer();
		}
	}

  destroyChildren(group) {
    const elapsed = Math.abs(this.destructionGroupTimer = this.getTimer());

    if (elapsed < 500) {
      return;
    }

    this.destructionGroupTimer = this.getTimer();
    if (group.maxSize > 0) {
      CleanupGroup(group, this);
    }
  }

	update() {
    this.timeTellerText.setText(`Time Left\n${Align.secsToMins(this.timeTeller.getRemainingSeconds())}`);
		if (!isMobile) {
			this.fallbackToKeyboard();
		}

    // if (this.model.gameOver) {
    //   return;
    // }

		let closestEnemyFighter;

		if (this.enemyFightersGroup.getLength() > 0 && this.enemyStation.active) {
			closestEnemyFighter = FindClosest(this.enemyFightersGroup, this.ship);
			this.pursuingFighter = closestEnemyFighter;
			this.moveEnemy(closestEnemyFighter);

			if (Align.detectProximity(
					this.ship, 
					closestEnemyFighter, 
					closestEnemyFighter.range 
				) && !this.model.gameOver
			) {
				this.makeEnemyBullets(closestEnemyFighter);
			}
		}

		this.fireMissile();
		this.recalibrateMissile();
    this.destroyChildren(this.bulletGroup);
    this.destroyChildren(this.enemyBulletGroup);
	}
}
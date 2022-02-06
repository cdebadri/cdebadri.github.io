import * as Phaser from 'phaser';
import VirtualJoystick from 'phaser3-rex-plugins/plugins/virtualjoystick';
import { Grid, Align, Model, Bar, Media, Text, ButtonWrapper } from '../utils';
import { FindClosest, Missile, CleanupGroup, EventsCenter } from '../components';

export default class PlayScene extends Phaser.Scene {
	constructor() {
		super({ 
			key: 'PlayScene',
		});
	}

	create() {
    this.model = new Model({ scene: this });
    this.media = new Media({ scene: this });

    if (isMobile) {
      updateTemplateDOM('SHOW_MOBILE_INSTRUCTIONS');
    }

    this.media.emit('PLAY_BACKGROUND_MUSIC', 'battle');

		this.grid = new Grid({
			scene: this,
			rows: 12,
			cols: 15,
			color: 'white',
		});

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

		this.bulletGroup = this.physics.add.group({
			defaultKey: 'bullet',
			runChildUpdate: true,
		});

		this.enemyBulletGroup = this.physics.add.group({
			defaultKey: 'ebullet',
			runChildUpdate: true,
		});

		this.rockGroup = this.physics.add.group({
			defaultKey: 'rocks',
			frame: [0, 1, 2],
			bounceX: 1,
			bounceY: 1,
			angularVelocity: 1,
			collideWorldBounds: true,
			runChildUpdate: true,
		});

		this.enemyStationGroup = this.physics.add.group({
			defaultKey: 'enemyStation',
		});

		this.enemyFightersGroup = this.physics.add.group({
			defaultKey: 'eship'
		});

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
    this.particles.setDepth(2);

    this.stationExplosionFireGroup = this.add.group({
      defaultKey: 'fire',
    });

		this.showShipHealth();

    this.gameInit();

		this.setColliders();

		this.events.on('SHIP_SHIELDS_CHANGE', this.changePlayerShieldValue, this);
    this.events.on('ENEMY_SHIPS_SHIELDS_CHANGE', this.checkEnemyShields, this);
    this.events.on('ENEMY_STATION_SHIELDS_CHANGE', this.checkEnemyStationShields, this);
    this.events.on('SHOW_INFO', this.showInfo, this);
    this.events.on('FIRE', this.makeBullets, this);
    EventsCenter.on('RESET', function () {
      this.model.emit('RESET');
      this.gameInit();
    }, this);
    this.pauseGame();
		this.setupClock();
    
		// this.grid.showNumbers();
	}

  refillProperties(object, tmpObject) {
    if (Object.keys(tmpObject).length > 0) {
      Object.keys(tmpObject).forEach(function(key) {
        if (tmpObject[key] !== undefined) {
          object[key] = tmpObject[key];
        }
      });
    }
  }

  collectTransientProps(object) {
    return object
      ? {
        fireEmitter: object.fireEmitter,
        removeFire: object.removeFire,
        updateAlert: object.updateAlert,
        explode: object.explode,
        isDestroyed: object.isDestroyed,
      } : undefined;
  }

  gameInit() { 
    const tmpShip = this.collectTransientProps(this.ship);
    this.ship = this.shipGroup.get();
		this.ship.enableBody(true, 0, 0, true, true);
		Align.scaleToGameW(this.ship, CONFIG_SIZE.SHIP);
		this.setShipConfigurations();
		this.ship.body.collideWorldBounds = true;
		this.grid.placeAt(565, this.ship);
    this.ship.setVisible(true);
    if (tmpShip) {
      this.refillProperties(this.ship, tmpShip);
    }
    this.playerHealth.setPercent(this.model.shipShields / 100);

    this.createRocks();

    const tempEnemyStation = this.collectTransientProps(this.enemyStation);
    this.enemyStation = this.enemyStationGroup.get(
      Math.floor(this.background.displayWidth / 2),
      Math.floor(this.background.displayHeight / 2),
      undefined,
      undefined,
      true
    );
    this.enemyStation.enableBody(
      true,
      Math.floor(this.background.displayWidth / 2),
      Math.floor(this.background.displayHeight / 2),
      true,
      true,
    )
		Align.scaleToGameW(this.enemyStation, CONFIG_SIZE.ENEMY_STATION);
		this.enemyStation.body.setCircle(CONFIG_SIZE.ENEMY_STATION_BODY * game.config.height);
		this.setEnemyStationConfigurations();
    if (tempEnemyStation) {
      this.refillProperties(this.enemyStation, tempEnemyStation);
    }

    this.createEnemyFighter();
		this.enemyFightersGroup.addListener('retracePosition', this.maintainPosition, this);

    this.missile = null;
    
		this.cameras.main.setBounds(0, 0, this.background.displayWidth, this.background.displayHeight);

		this.cameras.main.fadeIn(1000, 0, 0, 0);
		this.cameras.main.startFollow(this.ship, true);

    this.setupTimer();
  }

  pauseGame() {
    if (this.scene.isSleeping('PauseScene')) {
      this.scene.wake('PauseScene', { sceneKey: 'PlayScene' });
    } else {
      this.scene.launch('PauseScene', { sceneKey: 'PlayScene' });
    }
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
    this.grid.placeAt(CONFIG_SIZE.MESSAGE_ICON_PLACE, this.infoButton, 'corner');
  }

  setupTimer() {
    this.timeTeller = this.time.addEvent({
			delay: CONFIG_SIZE.GAME_TIME,
      callbackScope: this,
      callback: function () {
        this.model.gameOver = true;
        this.transition();
      },
		});
  }

	setupClock() {
    this.setupTimer();
    this.timeTellerText = new Text.createText({
      scene: this,
      text: `Time left\n${Align.secsToMins(this.timeTeller.getRemainingSeconds())}`,
      style: {
        backgroundColor: 0xffffff,
        align: 'center',
        fontFamily: 'Digital',
        color: 'red',
        textShadow: '5px 5px 5px red',
      },
    });

    this.add.existing(this.timeTellerText);
    this.grid.placeAt(CONFIG_SIZE.TIMER_POSITION, this.timeTellerText, 'corner');
    this.timeTellerText.setScrollFactor(0);
    this.timeTellerText.setDepth(1);
	}

  destroyEnemyStation() {
    this.stationExplosionFire.setActive(false);
    this.stationExplosionFire.setVisible(false);
		this.transition();
  }

	destroyObjects() {
    if ('fireEmitter' in this.ship) {
      this.ship.removeFire();
    }
    if ('fireEmitter' in this.enemyStation) {
      this.enemyStation.removeFire();
    }
    this.enemyFightersGroup.children.iterate(function (child) {
      if ('fireEmitter' in child) {
        child.removeFire();
      }
    }, this);

    if ('alert' in this.ship) {
      this.ship.alert.complete();
      this.ship.updateAlert(false);
    }

    [
      this.shipGroup, this.enemyBulletGroup, this.bulletGroup, this.rockGroup, 
      this.enemyFightersGroup, this.enemyStationGroup, this.stationExplosionFireGroup, this.explosionGroup, this.missileGroup,
    ].forEach(function (group) {
      if (group && group.children && group.getChildren().length > 0) {
        group.getChildren().forEach(function (child) {
          if ('body' in child && child.body !== null) {
            if (child.active) {
              child.disableBody(true, true);
            }
          } else {
            child.setActive(false);
            child.setVisible(false);
          }
        }, this);
      }
    }, this);
    this.missile = null;
    this.time.removeAllEvents();
	}

  createExplosion(x, y) {
		const explosion = this.explosionGroup.get(x, y, undefined, undefined, true);
    explosion.setActive(true);
    explosion.setVisible(true);
    if (explosion.play) {
      explosion.play('boom');
    }
  }

	transition() {
    this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, function() {
      this.destroyObjects();
      if (this.scene.isSleeping('EndScene')) {
			  this.scene.wake('EndScene', { gameOver: this.model.gameOver, sceneKey: 'PlayScene' });
        this.scene.bringToTop('EndScene');
        EventsCenter.emit('RENDER_END_SCENE', { gameOver: this.model.gameOver, sceneKey: 'PlayScene' });
      } else {
        this.scene.launch('EndScene', { gameOver: this.model.gameOver, sceneKey: 'PlayScene' });
      }
      this.scene.sleep('PlayScene');
		}, this);
		this.cameras.main.fadeOut(2000, 0, 0, 0);
	}

  checkEnemyStationShields() {
    if (this.model.enemyStationShields < 50 && !this.enemyStation.hasLowHealth) {
      this.createFire(this.enemyStation);
    } else if (this.model.enemyStationShields === 0 && !this.enemyStation.isDestroyed) {
      // a massive explosion
      this.enemyStation.isDestroyed = true;
      if (this.enemyStation && 'fireEmitter' in this.enemyStation) {
        this.enemyStation.removeFire();
      }
      this.stationExplosionFire = this.stationExplosionFireGroup.get(this.enemyStation.x, this.enemyStation.y);
      this.stationExplosionFire.setActive(true);
      this.stationExplosionFire.setVisible(true);
      if (!('explode' in this.enemyStation)) {
        const vanish = this.tweens.create({
          targets: this.stationExplosionFire,
          alpha: 0,
          ease: 'Sine.easeInOut',
          onComplete: function() {
            this.destroyEnemyStation();
          },
          onCompleteScope: this,
          onStart: function() {
            this.media.emit('PLAY_SOUND', 'explosionSound');
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
        
        this.enemyStation.explode = this.tweens.create({
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
        this.tweens.makeActive(this.enemyStation.explode);
      } else {
        this.enemyStation.explode.restart();
      }
    }
  }

  checkEnemyShields(key) {
    const enemyFighter = this.enemyFightersGroup.getChildren().find(child => child.name === key);
    const enemyFighterShield = this.model.getEnemyShipShields(key); 
    
    if (enemyFighterShield === 0) {
      this.media.emit('PLAY_SOUND', 'fightershot');
      if (enemyFighter) {
        this.createExplosion(enemyFighter.x, enemyFighter.y);
      }
      
      if (enemyFighter) {
        if ('fireEmitter' in enemyFighter) {
          enemyFighter.removeFire();
        }
				enemyFighter.disableBody(true, true);
      }
    } else if (enemyFighterShield < 50 && !enemyFighter.hasLowHealth) {
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
	}

  changePlayerShieldValue() {
    this.playerHealth.setPercent(this.model.shipShields / 100);
    if (this.model.shipShields < 50 && !this.ship.hasLowHealth) {
      this.createFire(this.ship);
      this.ship.hasLowHealth = true;
      if (!('alert' in this.ship)) {
        const redAlert = this.add.graphics();
        redAlert.fillStyle(0xff0000, 0.3);
        redAlert.fillRect(0, 0, this.background.displayWidth, this.background.displayHeight);
        this.ship.alert = this.tweens.create({
          repeat: -1,
          yoyo: true,
          targets: redAlert,
          alpha: 0,
        });
				this.tweens.makeActive(this.ship.alert);
        this.ship.updateAlert = function (value) {
          redAlert.setActive(value);
          redAlert.setVisible(value);
        };
      } else {
        this.ship.updateAlert(true);
        this.ship.alert.restart();
      }
    }

    if (this.model.shipShields === 0) {
      this.media.emit('PLAY_SOUND', 'fightershot');
      this.createExplosion(this.ship.x, this.ship.y);
      if ('fireEmitter' in this.ship) {
        this.ship.removeFire();
      }
      this.ship.disableBody(true, true);
      this.model.gameOver = true;
			this.transition();
    }
  }

  createFire(object) {
    if ('fireEmitter' in object) {
      object.hasLowHealth = true;
      object.fireEmitter.start();
      object.fireEmitter.setVisible(true);
    } else {
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
      object.removeFire = function() {
        object.fireEmitter.stop();
        object.fireEmitter.setVisible(false);
      };
      object.hasLowHealth = true;
    }
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
		this.grid.placeAt(CONFIG_SIZE.FIRE_BUTTON_POSITION, this.fireButton);
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
		this.grid.placeAt(CONFIG_SIZE.JOYSTICK_POSITION, this.joystick);
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
      this.media.emit('PLAY_SOUND', 'explosionSound');
    } else {
      this.model.enemyStationShields -= 5;
      this.media.emit('PLAY_SOUND', 'fightershot');
    }
		
		this.createExplosion(bullet.x, bullet.y);
		bullet.disableBody(true, true);
	}

	enemyDestroysShip(ship, bullet) {
    this.media.emit('PLAY_SOUND', 'fightershot');
    this.createExplosion(ship.x, ship.y);
		bullet.disableBody(true, true);
		this.cameras.main.shake(200);
		this.model.shipShields -= 5;
	}

	createRocks() {
		for (let i = 0; i < 20; i += 1) {
      const xx = Math.floor(Math.random() * this.background.displayWidth);
      const yy = Math.floor(Math.random() * this.background.displayHeight);
      const frame = Math.floor(Math.random() * 3);
      const child = this.rockGroup.get(xx, yy, undefined, frame, true);
      child.enableBody(true, xx, yy, true, true);
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
    };
	}

	rockDestroyShip(ship, rock) {
		rock.disableBody(true, true);
    this.media.emit('PLAY_SOUND', 'fightershot');
    this.createExplosion(ship.x, ship.y);
    this.model.shipShields -= 1;
	}

	destroyRocks(bullet, rock) {
    this.media.emit('PLAY_SOUND', 'fightershot')
    this.createExplosion(rock.x, rock.y);
		rock.disableBody(true, true);
		bullet.disableBody(true, true);
  }

	destroyRocksEnemy(bullet, rock) {
    this.media.emit('PLAY_SOUND', 'fightershot');
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
		this.ship.topSpeed = 200;
    this.ship.hasLowHealth = false;
	}

	makeBullets() {
    const elapsed = Math.abs(this.lastBullet - this.getTimer());
		
		if (elapsed < 500) {
			return;
		}

		this.lastBullet = this.getTimer();
    this.media.emit('PLAY_SOUND', 'gunshot');

		const bullet = this.bulletGroup.get(this.ship.x, this.ship.y);
		bullet.enableBody(true, this.ship.x, this.ship.y, true, true);
    bullet.originX = this.ship.x;
    bullet.originY = this.ship.y;
		bullet.angle = this.ship.angle;
		bullet.body.setVelocity(
			Math.cos(Align.toRadians(bullet.angle)) * 300,
			Math.sin(Align.toRadians(bullet.angle)) * 300
		);
	}

	setEnemyConfigurations(eship) {
		eship.topSpeed = 100;
		eship.range = game.config.height / CONFIG_SIZE.ENEMY_SHIP_DETECTION_DENOM;
		eship.flyRange = game.config.height / CONFIG_SIZE.ENEMY_SHIP_DETECTION_DENOM;
		eship.setPushable(false);
    eship.hasLowHealth = false;
	}

	setEnemyStationConfigurations() {
    this.enemyStation.name = 'ENEMY_STATION';
		this.enemyStation.range = game.config.height / CONFIG_SIZE.ENEMY_DETECTION_DENOM;
		this.enemyStation.assistGroup = 1;
		this.enemyStation.assistPositions = [];
		this.enemyStation.setPushable(false);
    this.enemyStation.hasLowHealth = false;
    this.enemyStation.isDestroyed = false;
		
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
	}

	createEnemyFighter() {
		for (let i = 0; i < this.enemyStation.assistPositions.length; i++) {
			const position = this.enemyStation.assistPositions[i];
      const tmpEshipArray = this.enemyFightersGroup.getMatching('name', `fighter-${i + 1}`);
      const tmpEship = tmpEshipArray.length > 0 ? this.collectTransientProps(tmpEshipArray[0]) : undefined;
			const eship = this.enemyFightersGroup.get(
				position.x, 
				position.y,
        undefined,
        undefined,
        true
			);
			eship.enableBody(true, position.x, position.y, true, true);
			Align.scaleToGameW(eship, CONFIG_SIZE.ENEMY_SHIP);
			this.setEnemyConfigurations(eship);
			eship.name = `fighter-${i + 1}`;
			eship.angle = position.angle;
			eship.x = position.x;
			eship.y = position.y;
			eship.originalX = position.x;
			eship.originalY = position.y;
			eship.setCollideWorldBounds(true);
      if (tmpEship) {
        this.refillProperties(eship, tmpEship);
      }
		}
	}

	shipDestroysEnemy(ship, bullet) {
    this.media.emit('PLAY_SOUND', 'fightershot');
    this.createExplosion(bullet.x, bullet.y)
		bullet.disableBody(true, true);
		this.model.enemyShipShields = {
			key: ship.name,
			shield: this.model.getEnemyShipShields(ship.name) - 5,
		}
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
		this.physics.moveTo(bullet, this.ship.x, this.ship.y, 300);
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
      this.media.emit('PLAY_SOUND', 'gunshot');
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
    this.timeTellerText.setText(`Time left\n${Align.secsToMins(this.timeTeller.getRemainingSeconds())}`);
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
    // this.destroyChildren(this.bulletGroup);
    // this.destroyChildren(this.enemyBulletGroup);
	}
}
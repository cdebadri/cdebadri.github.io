import * as Phaser from 'phaser';
import { Bar, Grid, Text } from '../utils';

export default class LoadScene extends Phaser.Scene {
	constructor() {
		super({ key: 'LoadScene' });
	}

	preload() {
    updateTemplateDOM('SHOW_GAME_AREA');
		const grid = new Grid({
			scene: this,
			rows: 12,
			cols: 15,
			color: 'white',
		});
		// grid.showNumbers();

    const text = new Text.createText({
      scene: this,
      text: lang.gameStory.title,
      style: {
        align: 'center',
        fontFamily: 'Thectro',
        fontSize: isMobile ? '20px' : '40px',
        color: 'red',
      },
      width: CONFIG_SIZE.GAME_WIDTH,
    });
    this.add.existing(text);
    grid.placeAt(CONFIG_SIZE.END_SCENE.message, text);
    text.x = CONFIG_SIZE.GAME_WIDTH / 2 - text.width / 2;

		this.progressBar = new Bar({ scene: this, color: 0xff0000 });
		grid.placeAt(123, this.progressBar);

		this.load.on('progress', this.onProgress, this);
		this.load.image('background', '/static/background.jpg');
		this.load.image('bullet', '/static/bullet.png');
		this.load.image('ebullet', '/static/ebullet.png');
		this.load.image('player', '/static/player2.png');
		this.load.image('eship', '/static/eship2.png');
		this.load.spritesheet('exp', '/static/exp.png', {
			frameWidth: 60,
			frameHeight: 70,
			startFrame: 0,
			endFrame: 15,
		});
    this.load.image('fire', '/static/muzzleflash3.png');
		this.load.spritesheet('rocks', '/static/rocks.png', {
			frameWidth: 125,
			frameHeight: 100,
			startFrame: 0,
			endFrame: 3,
		});	
		this.load.image('button', '/static/button.png');
		this.load.image('enemyStation', '/static/enemystation2.png');
		this.load.image('missile', '/static/missile.png');
    this.load.audio('gunshot', '/static/gunshot.mp3');
    this.load.audio('explosionSound', '/static/explosion.mp3');
    this.load.audio('fightershot', '/static/fightershot.mp3');
    this.load.image('play', '/static/play.png');
    this.load.image('info', '/static/info2.png');
    this.load.image('firebutton', '/static/firebutton2.png');
    this.load.audio('battle', '/static/battle.mp3');
		// this.load.json('shapes', '/static/shapes.json');
	}

	onProgress(value) {
		this.progressBar.setPercent(value);
	}

	create() {
    this.progressBar.destroy();
		this.scene.start('PlayScene');
	}
}
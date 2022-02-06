import { GameObjects } from 'phaser';
import { clamp } from '../utils/Align';

export default class Model extends GameObjects.GameObject {
	constructor(props) {
    super(props.scene);
	  this._shipShields = 100;
	  this._enemyShipShields = {
	  	'fighter-1': 100,
	  	'fighter-2': 100,
	  	'fighter-3': 100,
      'fighter-4': 100,
	  };
	  this._enemyStationShields = 100;
	  this._gameOver = false;
    this.scene = props.scene;

    this.on('RESET', this.resetConfigs, this);
	}

	set gameOver(val) {
		this._gameOver = val;
	}

	get gameOver() {
		return this._gameOver;
	}

	set shipShields(val) {
		this._shipShields = clamp(0, val, 100);
		this.scene.events.emit('SHIP_SHIELDS_CHANGE');
	}

	get shipShields() {
		return this._shipShields;
	}

	set enemyShipShields(obj) {
		this._enemyShipShields[obj.key] = clamp(0, obj.shield, 100);
		this.scene.events.emit('ENEMY_SHIPS_SHIELDS_CHANGE', obj.key);
	}

	getEnemyShipShields(name) {
		return this._enemyShipShields[name];
	}

	set enemyStationShields(val) {
		this._enemyStationShields = clamp(0, val, 100);
		this.scene.events.emit('ENEMY_STATION_SHIELDS_CHANGE');
	}

	get enemyStationShields() {
		return this._enemyStationShields;
	}

  on(event, func, context) {
    GameObjects.GameObject.prototype.on.call(this, event, func, context);
  }

  emit(event) {
    GameObjects.GameObject.prototype.emit.call(this, event);
  }

  resetConfigs() {
    this._shipShields = 100;
	  this._enemyShipShields = {
	  	'fighter-1': 100,
	  	'fighter-2': 100,
	  	'fighter-3': 100,
      'fighter-4': 100,
	  };
	  this._enemyStationShields = 100;
	  this._gameOver = false;
  }
}
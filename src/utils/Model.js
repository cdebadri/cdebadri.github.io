export default class Model {
	constructor(props) {
	  this._shipShields = 100;
	  this._enemyShipShields = {
	  	'fighter-1': 100,
	  	'fighter-2': 100,
	  	'fighter-3': 100,
	  	'fighter-4': 100,
	  };
	  this._enemyStationShields = 100;
	  this._soundOn = true;
	  this._gameOver = false;
	}

	set gameOver(val) {
		this._gameOver = val;
	}

	get gameOver() {
		return this._gameOver;
	}

	set soundOn(val) {
		this._soundOn = val;
		emitter.emit('SOUND_SETTINGS_CHANGED');
	}

	get soundOn() {
		return this._soundOn;
	}

	set shipShields(val) {
		this._shipShields = val;
		emitter.emit('SHIP_SHIELDS_CHANGE');
	}

	get shipShields() {
		return this._shipShields;
	}

	set enemyShipShields(obj) {
		this._enemyShipShields[obj.key] = obj.shield;
		// emitter.emit('SHIP_SHIELDS_CHANGE');
	}

	getEnemyShipShields(name) {
		return this._enemyShipShields[name];
	}

	set enemyStationShields(val) {
		this._enemyStationShields = val;
		// emitter.emit('SHIP_SHIELDS_CHANGE');
	}

	get enemyStationShields() {
		return this._enemyStationShields;
	}
}
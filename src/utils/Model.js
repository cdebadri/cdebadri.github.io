export default class Model {
	constructor(props) {
	  this._score = 0;
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

	set score(val) {
		this._score = val;
		emitter.emit('SCORE_UPDATED');
	}

	get score() {
		return this._score;
	}
}
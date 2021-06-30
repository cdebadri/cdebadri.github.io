export default class Controller {
	constructor() {
	  window.emitter.on('SET_SCORE', this.setScore);
	  window.emitter.on('UPDATE_POINTS', this.updatePoints);
	  window.emitter.on('CHANGE_SOUND_SETTINGS', this.updateSound);
	}

	updateSound() {
		model.soundOn = !model.soundOn;
	}

	setScore(score) {
		model.score = score;
	}

	updatePoints(points) {
		model.score += points;
	}
}
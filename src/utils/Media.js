export default class Media {
	constructor(config) {
		this.scene = config.scene;
		emitter.on('PLAY_SOUND', this.playSound, this);
		emitter.on('PLAY_BACKGROUND_MUSIC', this.playBackground, this);
		emitter.on('SOUND_SETTINGS_CHANGED', this.updateSettings, this);
	}

	updateSettings() {
		if (!model.soundOn && this.backgroundMusic) {
			this.backgroundMusic.stop();
		} else {
			if (this.backgroundMusic) {
				this.backgroundMusic.play();
			}
		}
	}

	playSound(key) {
		if (model.soundOn) {
			this.sound = this.scene.sound.add(key);
			this.sound.play();
		}
	}

	playBackground(key, options) {
		if (model.soundOn) {
			this.backgroundMusic = this.scene.sound.add(key, {...options});
			this.backgroundMusic.play();
		}
	}
}
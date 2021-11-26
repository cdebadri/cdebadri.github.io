export default class Media {
	constructor(config) {
		this.scene = config.scene;
    this._soundOn = true;
    this._musicOn = true;
		if (!this.soundGroup) {
			this.soundGroup = {};
		}
		emitter.on('PLAY_SOUND', this.playSound, this);
		emitter.on('PLAY_BACKGROUND_MUSIC', this.playBackground, this);
		emitter.on('SOUND_SETTINGS_CHANGED', this.updateSettings, this);
    emitter.on('MUSIC_SETTINGS_CHANGED', this.updateSettings, this);
	}

  set soundOn(flag) {
    this._soundOn = flag;
    emitter.emit('SOUND_SETTINGS_CHANGED');
  }

  get soundOn() {
    return this._soundOn;
  }

  set musicOn(flag) {
    this._musicOn = flag;
    emitter.emit('MUSIC_SETTINGS_CHANGED');
  }

  get musicOn() {
    return this._musicOn;
  }

	updateSettings() {
		if (!this.musicOn && this.backgroundMusic) {
			this.backgroundMusic.stop();
		} else {
			if (this.musicOn && this.backgroundMusic) {
				this.backgroundMusic.play();
			}
		}
	}

	playSound(key) {
		if (this.soundOn) {
			if (!this.soundGroup[key]) {
				this.soundGroup[key] = this.scene.sound.add(key);
			}
			this.soundGroup[key].play();
		}
	}

	playBackground(key, options) {
		if (this.musicOn) {
			this.backgroundMusic = this.scene.sound.add(key, {...options});
			this.backgroundMusic.play();
		}
	}
}
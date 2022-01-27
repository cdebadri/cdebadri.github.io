import { GameObjects } from 'phaser';

export default class Media extends GameObjects.GameObject  {
	constructor(config) {
    super(config.scene);
		this.scene = config.scene;
    this._soundOn = true;
    this._musicOn = true;
		if (!this.soundGroup) {
			this.soundGroup = {};
		}
		this.on('PLAY_SOUND', this.playSound, this);
		this.on('PLAY_BACKGROUND_MUSIC', this.playBackground, this);
		this.on('SOUND_SETTINGS_CHANGED', this.updateSettings, this);
    this.on('MUSIC_SETTINGS_CHANGED', this.updateSettings, this);
	}

  set soundOn(flag) {
    this._soundOn = flag;
    this.emit('SOUND_SETTINGS_CHANGED');
  }

  get soundOn() {
    return this._soundOn;
  }

  set musicOn(flag) {
    this._musicOn = flag;
    this.emit('MUSIC_SETTINGS_CHANGED');
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

	playBackground(key) {
		if (this.musicOn) {
      if (!this.soundGroup[key]) {
  			this.soundGroup[key] = this.scene.sound.add(key, { loop: true, volume: 0.25 });
      }
			this.soundGroup[key].play();
		}
	}

  on(event, func, context) {
    GameObjects.GameObject.prototype.on.call(this, event, func, context);
  }

  emit(event, audioKey) {
    GameObjects.GameObject.prototype.emit.call(this, event, audioKey);
  }
}
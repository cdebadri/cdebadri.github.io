export const CONFIG_SIZE_LARGE_SCREEN = config => ({
	SHIP: 0.08,
	ENEMY_STATION: 0.7,
	ROCKS: 0.05,
	ENEMY_SHIP: 0.1,
	ENEMY_BULLET: 0.05,
	ENEMY_STATION_BODY: 0.33,
	ENEMY_DETECTION_DENOM: 2,
  ENEMY_SHIP_DETECTION_DENOM: 2,
	HEALTH: {
		WIDTH: 0.5 * config.width,
		HEIGHT: 0.1 * config.height, 
	},
  SHIP_DAMAGE: {
    start: 0.2,
    end: 0.5,
  },
  STATION_DAMAGE: {
    start: 2,
    end: 2,
  },
  SHIP_HEALTH_POSITION: 168,
  ENEMY_STATION_EXPLOSION_FIRE: 10,
  GAME_WIDTH: config.width,
  END_SCENE: {
    message: 82,
    button: 112,
  },
  GAME_TIME: 120000,
  TIMER_POSITION: 13.6,
  PLAY_BUTTON_SIZE: 1,
})

export const CONFIG_SIZE_SMALL_SCREEN = config => ({
	SHIP: 0.15,
	ENEMY_STATION: 1,
	FIRE_BUTTON: 0.1,
	JOYSTICK_RADIUS: 0.2,
	JOYSTICK_BASE: 0.2,
	JOYSTICK_THUMB: 0.1,
	ROCKS: 0.1,
	ENEMY_SHIP: 0.2,	
	ENEMY_BULLET: 0.1,
	ENEMY_STATION_BODY: 0.5,
	ENEMY_DETECTION_DENOM: 1.5,
  ENEMY_SHIP_DETECTION_DENOM: 1.5,
	HEALTH: {
		WIDTH: 0.5 * config.width,
		HEIGHT: 0.05 * config.height,
	},
  SHIP_DAMAGE: {
    start: 0.2,
    end: 0.5,
  },
  STATION_DAMAGE: {
    start: 2,
    end: 2,
  },
  SHIP_HEALTH_POSITION: 153,
  ENEMY_STATION_EXPLOSION_FIRE: 5,
  GAME_WIDTH: config.width,
  END_SCENE: {
    message: 82,
    button: 112,
  },
  GAME_TIME: 120000,
  TIMER_POSITION: 12,
  PLAY_BUTTON_SIZE: 0.1,
});


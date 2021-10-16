module.exports = {
	scaleToGameW: (obj, per) => {
		obj.displayWidth = game.config.height * per;
		obj.scaleY = obj.scaleX;
	},

	center: (obj) => {
		obj.x = game.config.width / 2;
		obj.y = game.config.height / 2;
	},

	checkCollide: (obj1, obj2) => {
		const distX = Math.abs(obj1.x - obj2.x);
		const distY = Math.abs(obj1.y - obj2.y);

		if (distX < obj1.width / 2 && distY < obj1.height / 2) {
			return true;
		}

		return false;
	},

	toDegrees: angle => angle * (180 / Math.PI),

	toRadians: angle => angle * Math.PI / 180,

	getDirFromAngle: angle => {
		const rads = angle * Math.PI / 180;

		return {
			tx: Math.cos(rads),
			ty: Math.sin(rads),
		}
	},

	detectProximity: (obj1, obj2, range) => {
		const distX = Math.abs(obj1.x - obj2.x);
    const distY = Math.abs(obj1.y - obj2.y);
    return (distX < range && distY < range);
	},

  clamp: (min, num, max) => Math.min(Math.max(num, min), max),
}
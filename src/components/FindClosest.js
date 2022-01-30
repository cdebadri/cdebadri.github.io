import * as Phaser from 'phaser';

export default function(group, object) {
	let minDistance = Number.MAX_SAFE_INTEGER;
	let closestChild;
	let distance;

	group.getMatching('active', true).forEach(function(child) {
		distance = Phaser.Math.Distance.Between(child.x, child.y, object.x, object.y);
		if (minDistance > distance) {
			minDistance = distance;
			closestChild = child;
		}
	}, this);
	
	return closestChild;
}
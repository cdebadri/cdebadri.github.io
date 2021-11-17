import * as Phaser from 'phaser';

export default function(group, scene) {
  group.children.each(function(child) {
    if (!Phaser.Geom.Rectangle.Overlaps(scene.physics.world.bounds, child.getBounds())) {
      child.destroy();
    }
  });
}
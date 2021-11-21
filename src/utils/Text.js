import * as Phaser from 'phaser';

export default class Text {
  static createText(config) {
    // const wrappedText = Phaser.Text.basicWordWrap(config.text, renderingContext, config.width);
    const textItem = new Phaser.GameObjects.Text(config.scene, 0, 0, config.text, config.style);
    return textItem;
  }
}
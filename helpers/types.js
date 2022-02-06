module.exports = function (name) {
  if (/\.mp3$/.test(name)) {
    return 'audio';
  } else if (/.ttf$/.test(name)) {
    return 'font';
  } else if (/.(png|jpg)$/.test(name)) {
    return 'image';
  }
};

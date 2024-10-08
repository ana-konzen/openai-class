export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function splitSentences(str) {
  return str.match(/[^\.!\?]+[\.!\?]+[\n\r]*/g);
}

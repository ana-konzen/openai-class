import ansiEscapes from "npm:ansi-escapes"; //library of ansiEscapes to manipulate the terminal
import * as process from "node:process"; //Node module to control current Node process and create Streams

export function placeAt(x, y) {
  process.stdout.write(ansiEscapes.cursorTo(x, y));
}

export function moveTo(x, y) {
  process.stdout.write(cursorForward(x) + ansiEscapes.cursorDown(y));
}

export function renderMainCharacter(x, y) {
  process.stdout.write(ansiEscapes.cursorTo(x, y));
  console.log("@");
}

export function showCursor() {
  process.stdout.write(ansiEscapes.cursorShow);
}

export function hideCursor() {
  process.stdout.write(ansiEscapes.cursorHide);
}

export function eraseScreen() {
  process.stdout.write(ansiEscapes.eraseScreen);
}

export function clearScreen() {
  process.stdout.write(ansiEscapes.clearScreen);
}

export function eraseLine() {
  process.stdout.write(ansiEscapes.eraseLine);
}

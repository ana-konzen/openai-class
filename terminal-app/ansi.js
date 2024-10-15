import { tty } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/tty.ts";

const myTty = tty({
  writer: Deno.stdout,
  reader: Deno.stdin,
});

export function cursorTo(x, y) {
  myTty.cursorTo(x, y);
}

export function moveTo(x, y) {
  myTty.cursorForward(x).cursorDown(y);
}

export function showCursor() {
  myTty.cursorShow();
}

export function hideCursor() {
  myTty.cursorHide();
}

export function eraseScreen() {
  myTty.eraseScreen();
}

export function clearScreen() {
  myTty.clearScreen();
}

export function eraseLine() {
  myTty.eraseLine();
}

export function eraseEndLine() {
  myTty.eraseLineEnd();
}

export function eraseDown() {
  myTty.eraseDown;
}

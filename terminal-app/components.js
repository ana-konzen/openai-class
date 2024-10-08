import ansiEscapes from "npm:ansi-escapes"; //library of ansiEscapes to manipulate the terminal
import * as process from "node:process"; //Node module to control current Node process and create Streams
import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import { randomInt } from "./util.js";

export class Chamber {
  constructor(w, h, x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.npcX = randomInt(this.x + 2, this.x + this.w - 5);
    this.npcY = randomInt(this.y + 2, this.y + this.h - 4);
    this.exitX = this.x + this.w - 1;
    this.exitY = randomInt(this.y + 2, this.y + this.h - 4);

    this.entrance = false;
    this.entranceY = 0;
    this.entranceX = this.x;
  }
  create() {
    process.stdout.write(ansiEscapes.cursorTo(0, 0));
    console.log(
      boxen("", {
        width: this.w,
        height: this.h,
        margin: { left: this.x, top: this.y },
        borderStyle: "classic",
      })
    );
    process.stdout.write(ansiEscapes.cursorTo(this.npcX, this.npcY));
    console.log("&");
    process.stdout.write(ansiEscapes.cursorTo(this.exitX, this.exitY));
    console.log("%");
    if (this.entrance) {
      process.stdout.write(
        ansiEscapes.cursorTo(this.entranceX, this.entranceY)
      );
      console.log("%");
    }

    process.stdout.write(ansiEscapes.cursorTo(0, 0));
  }
}

export function createNarrativeBox(arr, dialogueIndex) {
  process.stdout.write(ansiEscapes.cursorTo(0, 4));
  console.log(
    boxen(`${arr[dialogueIndex]}\n\n${dialogueIndex + 1}/${arr.length}`, {
      width: 50,
      height: 20,
      padding: 1,
      borderStyle: "double",
      float: "center",
      title: "Narrator",
      borderColor: "#345717",
    })
  );
  process.stdout.write(ansiEscapes.cursorTo(0, 0));
}

export function createDialogueBox(
  arr,
  dialogueIndex,
  currentChamber,
  character
) {
  process.stdout.write(ansiEscapes.cursorTo(0, 0));
  console.log(
    boxen(`${arr[dialogueIndex]}\n\n${dialogueIndex + 1}/${arr.length}`, {
      padding: 1,
      width: 30,
      height: 20,
      borderStyle: "double",
      title: character.name,
      margin: {
        top: 21,
        left: currentChamber.x,
      },
      borderStyle: "singleDouble",
    })
  );
  process.stdout.write(ansiEscapes.cursorTo(0, 0));
}

export function writeMessage(message, y = 2) {
  process.stdout.write(ansiEscapes.cursorTo(0, y));
  process.stdout.write(ansiEscapes.eraseLine);
  console.log(message);
  process.stdout.write(ansiEscapes.cursorTo(0, 0));
}

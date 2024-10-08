import ansiEscapes from "npm:ansi-escapes";
import * as process from "node:process";
import boxen from "npm:boxen@7.1.1";
import * as readline from "node:readline";
import OpenAI from "npm:openai@4.60.0";

import { promptGPT, initOpenAI } from "../../shared/openai.ts";

const rooms = [];
const numRooms = 5;

class Room {
  constructor(w, h, x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.cx = randomInt(this.x + 1, this.x + this.w - 2);
    this.cy = randomInt(this.y + 1, this.y + this.h - 1);
  }
  create() {
    process.stdout.write(ansiEscapes.cursorTo(0, 0));
    console.log(
      boxen("", {
        width: this.w,
        height: this.h,
        margin: { left: this.x, top: this.y },
      })
    );
    process.stdout.write(ansiEscapes.cursorTo(this.cx, this.cy));
    console.log("*");
    process.stdout.write(ansiEscapes.cursorTo(0, 0));
  }
}

let offset = 0;
for (let i = 0; i < numRooms; i++) {
  let w = randomInt(10, 30);
  rooms.push(new Room(w, randomInt(10, 30), i + offset, randomInt(0, 10)));
  offset += w;
}

process.stdin.resume();

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

let level = 0;

let talkMenu = false;

let dialogue;

if (talkMenu) {
  dialogue = await createDialogue();
}

process.stdout.write(ansiEscapes.clearScreen + ansiEscapes.cursorHide);
rooms[0].create();

let horMov = rooms[0].x + 1;
let verMov = rooms[0].y + 1;

process.stdout.write(ansiEscapes.cursorTo(horMov, verMov));
writeMainCharacter();

process.stdin.on("keypress", async (str, key) => {
  let currentRoom = rooms[level];
  process.stdout.write(ansiEscapes.clearScreen);
  if (key.name === "c") {
    addLevel();
  }
  if (!talkMenu) {
    if (horMov < currentRoom.x + currentRoom.w - 2) {
      if (key.name === "d" || key.name === "right") {
        horMov += 2;
      }
    }
    if (horMov > currentRoom.x) {
      if (key.name === "a" || key.name === "left") {
        horMov -= 2;
      }
    }

    if (verMov < currentRoom.y + currentRoom.h - 2) {
      if (key.name === "s" || key.name === "down") {
        verMov++;
      }
    }
    if (verMov > currentRoom.y) {
      if (key.name === "w" || key.name === "up") {
        verMov--;
      }
    }

    if (key.name === "space") {
      createRooms();
      process.stdout.write(
        ansiEscapes.cursorForward(horMov) + ansiEscapes.cursorDown(verMov)
      );
      writeMainCharacter();
      dialogue = await createDialogue();

      talkMenu = true;
    }
  } else {
    if (key.name === "space") {
      talkMenu = false;
    }
  }

  if (talkMenu) {
    process.stdout.write(ansiEscapes.cursorTo(0, 0));
    console.log(
      boxen(dialogue, {
        width: 25,
        height: 10,
        margin: {
          top: currentRoom.y + currentRoom.h,
          left: currentRoom.x,
        },
      })
    );
    process.stdout.write(ansiEscapes.cursorTo(0, 0));
  }

  createRooms();

  process.stdout.write(
    ansiEscapes.cursorForward(horMov) + ansiEscapes.cursorDown(verMov)
  );
  writeMainCharacter();

  if (key.ctrl === true && key.name === "c") {
    process.stdout.write(ansiEscapes.eraseScreen + ansiEscapes.cursorShow);
    process.exit();
  }
});

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function writeMainCharacter() {
  console.log("[]");
}

function createRooms() {
  for (let i = level; i >= 0; i--) {
    const room = rooms[i];
    room.create();
  }
}

function addLevel() {
  level++;
  if (level > numRooms - 1) {
    level = numRooms - 1;
  }
}

async function createDialogue() {
  const openai = initOpenAI();

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "I am creating a dungeon crawler RPG game. You are one of the characters I encountered. In 20 words or less, tell me what the character could say.",
      },
      {
        role: "user",
        content: "Hello, who are you?",
      },
    ],
  });
  const dialogue = completion.choices[0].message.content;
  return dialogue;
}

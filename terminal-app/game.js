/** Dungeon Mystery by Ana Konzen
 *
 * A dungeon-crawler RPG game in your computer's terminal, using ChatGPT.
 */

import ansiEscapes from "npm:ansi-escapes";
import * as process from "node:process";
import boxen from "npm:boxen@7.1.1";
import * as readline from "node:readline";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts"; //for text colors

import {
  createGame,
  createMessage,
  createDialogue,
  createFinalMessage,
  createInitialMessage,
  writeMessage,
} from "./chats.js"; //ChatGPT prompts and other utility functions

const gameInfo = await createGame();

const chatHistory = [];

const roomsInfo = gameInfo.parsed.rooms;

let firstMessage = await createInitialMessage(gameInfo);

chatHistory.push({
  room: "introduction",
  npc: "the narrator",
  chat: firstMessage,
});

const rooms = [];
const numRooms = 5;

class Room {
  constructor(w, h, x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.npcX = randomInt(this.x + 2, this.x + this.w - 5);
    this.npcY = randomInt(this.y + 2, this.y + this.h - 4);
    this.doorY = randomInt(this.y + 2, this.y + this.h - 4);
    this.doorX = this.x + this.w - 1;

    this.door2 = false;
    this.door2Y = 0;
    this.door2X = this.x;
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
    process.stdout.write(ansiEscapes.cursorTo(this.doorX, this.doorY));
    console.log("%");
    if (this.door2) {
      process.stdout.write(ansiEscapes.cursorTo(this.door2X, this.door2Y));
      console.log("%");
    }

    process.stdout.write(ansiEscapes.cursorTo(0, 0));
  }
}

let offset = 0;
for (let i = 0; i < numRooms; i++) {
  let w = randomInt(6, 15) * 2;
  let room = new Room(w, randomInt(10, 12), i + offset, randomInt(5, 8));
  rooms.push(room);
  if (i > 0) {
    room.door2 = true;
    room.door2Y = rooms[i - 1].doorY;
  }
  offset += w;
}

let finalRoom = false;

let firstRoom = true;

process.stdin.resume();

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

let level = 0;
let dialogueIndex;

let room = 0;

let talkMenu = false;

let doorLocked = true;

let finalMessage;

let messages = await createMessage(roomsInfo[room], gameInfo, chatHistory);
let dialogue;

process.stdout.write(ansiEscapes.clearScreen + ansiEscapes.cursorHide);

rooms[0].create();

let horMov = 0;
let verMov = 0;

let firstSentences = splitSentences(firstMessage);

process.stdout.write(ansiEscapes.eraseScreen + ansiEscapes.cursorHide);

createNarrativeBox(firstSentences, 0);

// process.stdout.write(ansiEscapes.cursorTo(horMov, verMov));
// writeMainCharacter();
// process.stdout.write(ansiEscapes.eraseScreen + ansiEscapes.cursorHide);
dialogueIndex = 0;

process.stdin.on("keypress", async (str, key) => {
  process.stdout.write(ansiEscapes.eraseScreen + ansiEscapes.cursorHide);
  if (firstRoom) {
    process.stdout.write(ansiEscapes.cursorTo(0, 4));

    if (key.name === "right" && dialogueIndex < firstSentences.length - 1) {
      dialogueIndex++;
    }
    if (key.name === "left" && dialogueIndex > 0) {
      dialogueIndex--;
    }
    createNarrativeBox(firstSentences, dialogueIndex);
    if (dialogueIndex === firstSentences.length - 1) {
      process.stdout.write(ansiEscapes.cursorTo(0, 25));
      console.log(
        boxen("press 'space' to start your adventure!", {
          float: "center",
          borderStyle: "none",
        })
      );
    }

    if (key.name === "space") {
      firstRoom = false;
      horMov = rooms[0].x + 1;
      verMov = rooms[0].y + 1;
      rooms[0].create();
      process.stdout.write(ansiEscapes.cursorTo(horMov, verMov));
      writeMainCharacter();
    }
  } else {
    let currentRoom = rooms[level];
    let character = roomsInfo[level].npc;
    let trust = character.trustLevel;
    process.stdout.write(ansiEscapes.clearScreen);
    writeMessage(`${room + 1}: ${roomsInfo[level].name}`);
    if (key.name === "c" || trust >= 10) {
      writeMessage(colors.green("The character gave you a key!"), 4);
      doorLocked = false;
    }
    if (!talkMenu) {
      if (key.name === "d" || key.name === "right") {
        if (horMov < currentRoom.x + currentRoom.w - 3) {
          if (horMov !== currentRoom.npcX - 2 || verMov !== currentRoom.npcY)
            horMov += 2;
        }
      }

      if (key.name === "a" || key.name === "left") {
        if (horMov > currentRoom.x + 1) {
          if (horMov !== currentRoom.npcX + 1 || verMov !== currentRoom.npcY)
            horMov -= 2;
        }
      }

      if (key.name === "s" || key.name === "down") {
        if (verMov < currentRoom.y + currentRoom.h - 2) {
          if (verMov !== currentRoom.npcY - 1 || horMov !== currentRoom.npcX)
            verMov++;
        }
      }
      if (key.name === "w" || key.name === "up") {
        if (verMov > currentRoom.y + 1) {
          if (verMov !== currentRoom.npcY + 1 || horMov !== currentRoom.npcX)
            verMov--;
        }
      }
      if (verMov === currentRoom.doorY && horMov >= currentRoom.doorX - 3) {
        if (doorLocked) {
          writeMessage(colors.red("The door is locked"), 4);
        } else {
          writeMessage(
            colors.green(
              "The door is unlocked! Press 'e' to go to the next room"
            ),
            4
          );
          if (key.name === "e") {
            // process.stdout.write(
            //   ansiEscapes.cursorTo(currentRoom.doorX + 1, currentRoom.doorY)
            // );
            // console.log("::");
            // process.stdout.write(ansiEscapes.cursorTo(0, 0));
            addLevel();
            messages = await createMessage(
              roomsInfo[room],
              gameInfo,
              chatHistory
            );
            doorLocked = true;
            if (finalRoom) {
              process.stdout.write(
                ansiEscapes.eraseScreen + ansiEscapes.cursorHide
              );
              finalMessage = await createFinalMessage(gameInfo, chatHistory);
              chatHistory.push({ finalMessage: finalMessage });
              dialogueIndex = 0;
              talkMenu = true;
            }
          }
        }
      }
      if (
        verMov <= currentRoom.npcY + 1 &&
        verMov >= currentRoom.npcY - 1 &&
        horMov >= currentRoom.npcX - 3 &&
        horMov <= currentRoom.npcX + 2
      ) {
        writeMessage("Press 'space' to talk", 4);

        if (key.name === "space") {
          createRooms();
          process.stdout.write(
            ansiEscapes.cursorForward(horMov) + ansiEscapes.cursorDown(verMov)
          );
          writeMainCharacter();
          dialogue = await createDialogue(
            roomsInfo[room],
            messages,
            trust,
            chatHistory
          );
          process.stdout.write(ansiEscapes.cursorHide);
          dialogueIndex = 0;
          talkMenu = true;
        }
      }
    } else {
      if (key.name === "space") {
        messages.push({
          role: "user",
          content: "I had to leave, but now I'm back.",
        });
        talkMenu = false;
      }
    }
    createRooms();

    process.stdout.write(
      ansiEscapes.cursorForward(horMov) + ansiEscapes.cursorDown(verMov)
    );
    writeMainCharacter();

    if (talkMenu && !finalRoom && !firstRoom) {
      process.stdout.write(ansiEscapes.cursorTo(0, 0));
      let sentences = splitSentences(dialogue);
      if (key.name === "right" && dialogueIndex < sentences.length - 1) {
        dialogueIndex++;
      }
      if (key.name === "left" && dialogueIndex > 0) {
        dialogueIndex--;
      }
      createDialogueBox(sentences, dialogueIndex, currentRoom, character);
      if (key.name === "t") {
        dialogueIndex = 0;
        process.stdout.write(ansiEscapes.cursorShow);
        process.stdout.write(ansiEscapes.cursorTo(0, 43));
        let playerResponse = prompt("Your response:");
        if (key.name === "return") {
          dialogueIndex = 0;
        }
        messages.push({ role: "user", content: playerResponse });
        chatHistory.push(`Player: ${playerResponse}`);
        dialogue = await createDialogue(
          roomsInfo[room],
          messages,
          trust,
          chatHistory
        );
        dialogueIndex = 0;
        process.stdout.write(ansiEscapes.cursorHide);
        process.stdout.write(ansiEscapes.cursorTo(0, 0));
      }
      process.stdout.write(ansiEscapes.cursorTo(0, 0));
    }

    createRooms();

    process.stdout.write(
      ansiEscapes.cursorForward(horMov) + ansiEscapes.cursorDown(verMov)
    );
    writeMainCharacter();

    if (talkMenu && finalRoom) {
      process.stdout.write(ansiEscapes.eraseScreen + ansiEscapes.cursorHide);
      let finalSentences = splitSentences(finalMessage);
      if (key.name === "right" && dialogueIndex < finalSentences.length - 1) {
        dialogueIndex++;
      }
      if (key.name === "left" && dialogueIndex > 0) {
        dialogueIndex--;
      }
      createNarrativeBox(finalSentences, dialogueIndex);
    }
  }
  if (key.ctrl === true && key.name === "c") {
    process.stdout.write(ansiEscapes.eraseScreen + ansiEscapes.cursorShow);
    let chatObject = { history: chatHistory };
    let jsonStr = JSON.stringify(chatObject);
    await Deno.writeTextFile("chat_history.json", jsonStr);
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
    finalRoom = true;
  }
  room = level;
}

function splitSentences(str) {
  return str.match(/[^\.!\?]+[\.!\?]+[\n\r]*/g);
}

function createNarrativeBox(arr, dialogueIndex) {
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

function createDialogueBox(arr, dialogueIndex, currentRoom, character) {
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
        left: currentRoom.x,
      },
      borderStyle: "singleDouble",
    })
  );
  process.stdout.write(ansiEscapes.cursorTo(0, 0));
}

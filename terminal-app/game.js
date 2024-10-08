/** Dungeon Mystery by Ana Konzen
 *
 * A dungeon-crawler RPG game in your computer's terminal, using ChatGPT.
 */

import ansiEscapes from "npm:ansi-escapes"; //library of ansiEscapes to manipulate the terminal
import * as process from "node:process"; //Node module to control current Node process and create Streams
import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import * as readline from "node:readline"; //Node module to read data from a Stream
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts"; //for text colors, from Cliffy

import {
  createGame,
  createMessage,
  createDialogue,
  createFinalMessage,
  createInitialMessage,
  writeMessage,
} from "./chats.js"; //ChatGPT prompts and other utility functions for the game

const numChambers = 5;
const chambers = [];
const chatHistory = [];

const gameInfo = await createGame(numChambers);

const chambersInfo = gameInfo.chambers;

let firstMessage = await createInitialMessage(gameInfo, numChambers);

chatHistory.push({
  chamber: "introduction",
  npc: "the narrator",
  chat: firstMessage,
});

class Chamber {
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
for (let i = 0; i < numChambers; i++) {
  let w = randomInt(6, 15) * 2;
  let chamber = new Chamber(w, randomInt(10, 12), i + offset, randomInt(5, 8));
  chambers.push(chamber);
  if (i > 0) {
    chamber.door2 = true;
    chamber.door2Y = chambers[i - 1].doorY;
  }
  offset += w;
}

let finalchamber = false;

let firstchamber = true;

process.stdin.resume();

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

let level = 0;
let dialogueIndex;

let chamber = 0;

let talkMenu = false;

let doorLocked = true;

let finalMessage;

let messages = await createMessage(
  chambersInfo[chamber],
  gameInfo,
  chatHistory,
  numChambers
);
let dialogue;

process.stdout.write(ansiEscapes.clearScreen + ansiEscapes.cursorHide);

chambers[0].create();

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
  if (firstchamber) {
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
      firstchamber = false;
      horMov = chambers[0].x + 1;
      verMov = chambers[0].y + 1;
      chambers[0].create();
      process.stdout.write(ansiEscapes.cursorTo(horMov, verMov));
      writeMainCharacter();
    }
  } else {
    let currentchamber = chambers[level];
    let character = chambersInfo[level].npc;
    let trust = character.trustLevel;
    process.stdout.write(ansiEscapes.clearScreen);
    writeMessage(`${chamber + 1}: ${chambersInfo[level].name}`);
    if (key.name === "c" || trust >= 10) {
      writeMessage(colors.green("The character gave you a key!"), 4);
      doorLocked = false;
    }
    if (!talkMenu) {
      if (key.name === "d" || key.name === "right") {
        if (horMov < currentchamber.x + currentchamber.w - 3) {
          if (
            horMov !== currentchamber.npcX - 2 ||
            verMov !== currentchamber.npcY
          )
            horMov += 2;
        }
      }

      if (key.name === "a" || key.name === "left") {
        if (horMov > currentchamber.x + 1) {
          if (
            horMov !== currentchamber.npcX + 1 ||
            verMov !== currentchamber.npcY
          )
            horMov -= 2;
        }
      }

      if (key.name === "s" || key.name === "down") {
        if (verMov < currentchamber.y + currentchamber.h - 2) {
          if (
            verMov !== currentchamber.npcY - 1 ||
            horMov !== currentchamber.npcX
          )
            verMov++;
        }
      }
      if (key.name === "w" || key.name === "up") {
        if (verMov > currentchamber.y + 1) {
          if (
            verMov !== currentchamber.npcY + 1 ||
            horMov !== currentchamber.npcX
          )
            verMov--;
        }
      }
      if (
        verMov === currentchamber.doorY &&
        horMov >= currentchamber.doorX - 3
      ) {
        if (doorLocked) {
          writeMessage(colors.red("The door is locked"), 4);
        } else {
          writeMessage(
            colors.green(
              "The door is unlocked! Press 'e' to go to the next chamber"
            ),
            4
          );
          if (key.name === "e") {
            // process.stdout.write(
            //   ansiEscapes.cursorTo(currentchamber.doorX + 1, currentchamber.doorY)
            // );
            // console.log("::");
            // process.stdout.write(ansiEscapes.cursorTo(0, 0));
            addLevel();
            messages = await createMessage(
              chambersInfo[chamber],
              gameInfo,
              chatHistory,
              numChambers
            );
            doorLocked = true;
            if (finalchamber) {
              process.stdout.write(
                ansiEscapes.eraseScreen + ansiEscapes.cursorHide
              );
              finalMessage = await createFinalMessage(
                gameInfo,
                chatHistory,
                numChambers
              );
              chatHistory.push({ finalMessage: finalMessage });
              dialogueIndex = 0;
              talkMenu = true;
            }
          }
        }
      }
      if (
        verMov <= currentchamber.npcY + 1 &&
        verMov >= currentchamber.npcY - 1 &&
        horMov >= currentchamber.npcX - 3 &&
        horMov <= currentchamber.npcX + 2
      ) {
        writeMessage("Press 'space' to talk", 4);

        if (key.name === "space") {
          createchambers();
          process.stdout.write(
            ansiEscapes.cursorForward(horMov) + ansiEscapes.cursorDown(verMov)
          );
          writeMainCharacter();
          dialogue = await createDialogue(
            chambersInfo[chamber],
            messages,
            trust,
            chatHistory,
            numChambers
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
    createchambers();

    process.stdout.write(
      ansiEscapes.cursorForward(horMov) + ansiEscapes.cursorDown(verMov)
    );
    writeMainCharacter();

    if (talkMenu && !finalchamber && !firstchamber) {
      process.stdout.write(ansiEscapes.cursorTo(0, 0));
      let sentences = splitSentences(dialogue);
      if (key.name === "right" && dialogueIndex < sentences.length - 1) {
        dialogueIndex++;
      }
      if (key.name === "left" && dialogueIndex > 0) {
        dialogueIndex--;
      }
      createDialogueBox(sentences, dialogueIndex, currentchamber, character);
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
          chambersInfo[chamber],
          messages,
          trust,
          chatHistory,
          numChambers
        );
        dialogueIndex = 0;
        process.stdout.write(ansiEscapes.cursorHide);
        process.stdout.write(ansiEscapes.cursorTo(0, 0));
      }
      process.stdout.write(ansiEscapes.cursorTo(0, 0));
    }

    createchambers();

    process.stdout.write(
      ansiEscapes.cursorForward(horMov) + ansiEscapes.cursorDown(verMov)
    );
    writeMainCharacter();

    if (talkMenu && finalchamber) {
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

function createchambers() {
  for (let i = level; i >= 0; i--) {
    const chamber = chambers[i];
    chamber.create();
  }
}

function addLevel() {
  level++;
  if (level > numChambers - 1) {
    level = numChambers - 1;
    finalchamber = true;
  }
  chamber = level;
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

function createDialogueBox(arr, dialogueIndex, currentchamber, character) {
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
        left: currentchamber.x,
      },
      borderStyle: "singleDouble",
    })
  );
  process.stdout.write(ansiEscapes.cursorTo(0, 0));
}

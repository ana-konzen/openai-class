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

import { randomInt, splitSentences } from "./util.js";

import { Chamber } from "./chamber.js";

const numChambers = 5;
const chambers = [];
const chatHistory = [];

let level = 0;
let horMov = 0;
let verMov = 0;
let dialogueIndex = 0;

let dialogue;

let talkMenu = false;
let doorLocked = true;
let finalMessage;
let finalChamber = false;
let firstChamber = true;

const gameInfo = await createGame(numChambers);

const chambersInfo = gameInfo.chambers;

let firstMessage = await createInitialMessage(gameInfo, numChambers);
let firstSentences = splitSentences(firstMessage);

chatHistory.push({
  chamber: "introduction",
  character: "the narrator",
  chat: firstMessage,
});

let messages = await createMessage(
  chambersInfo[level],
  gameInfo,
  chatHistory,
  numChambers
);

let offset = 0;
for (let i = 0; i < numChambers; i++) {
  let w = randomInt(6, 15) * 2;
  let newChamber = new Chamber(
    w,
    randomInt(10, 12),
    i + offset,
    randomInt(5, 8)
  );
  chambers.push(newChamber);
  if (i > 0) {
    newChamber.door2 = true;
    newChamber.door2Y = chambers[i - 1].doorY;
  }
  offset += w;
}

initializeGame();

process.stdin.on("keypress", async (str, key) => {
  process.stdout.write(ansiEscapes.eraseScreen + ansiEscapes.cursorHide);
  if (firstChamber) {
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
      firstChamber = false;
      horMov = chambers[0].x + 1;
      verMov = chambers[0].y + 1;
      chambers[0].create();
      process.stdout.write(ansiEscapes.cursorTo(horMov, verMov));
      writeMainCharacter();
    }
  } else {
    let currentChamber = chambers[level];
    let character = chambersInfo[level].character;
    let trust = character.trustLevel;
    process.stdout.write(ansiEscapes.clearScreen);
    writeMessage(`${level + 1}: ${chambersInfo[level].name}`);
    if (key.name === "c" || trust >= 10) {
      writeMessage(colors.green("The character gave you a key!"), 4);
      doorLocked = false;
    }
    if (!talkMenu) {
      if (key.name === "d" || key.name === "right") {
        if (horMov < currentChamber.x + currentChamber.w - 3) {
          if (
            horMov !== currentChamber.characterX - 2 ||
            verMov !== currentChamber.characterY
          )
            horMov += 2;
        }
      }

      if (key.name === "a" || key.name === "left") {
        if (horMov > currentChamber.x + 1) {
          if (
            horMov !== currentChamber.characterX + 1 ||
            verMov !== currentChamber.characterY
          )
            horMov -= 2;
        }
      }

      if (key.name === "s" || key.name === "down") {
        if (verMov < currentChamber.y + currentChamber.h - 2) {
          if (
            verMov !== currentChamber.characterY - 1 ||
            horMov !== currentChamber.characterX
          )
            verMov++;
        }
      }
      if (key.name === "w" || key.name === "up") {
        if (verMov > currentChamber.y + 1) {
          if (
            verMov !== currentChamber.characterY + 1 ||
            horMov !== currentChamber.characterX
          )
            verMov--;
        }
      }
      if (
        verMov === currentChamber.doorY &&
        horMov >= currentChamber.doorX - 3
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
            addLevel();
            messages = await createMessage(
              chambersInfo[level],
              gameInfo,
              chatHistory,
              numChambers
            );
            doorLocked = true;
            if (finalChamber) {
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
        verMov <= currentChamber.characterY + 1 &&
        verMov >= currentChamber.characterY - 1 &&
        horMov >= currentChamber.characterX - 3 &&
        horMov <= currentChamber.characterX + 2
      ) {
        writeMessage("Press 'space' to talk", 4);

        if (key.name === "space") {
          createchambers();
          process.stdout.write(
            ansiEscapes.cursorForward(horMov) + ansiEscapes.cursorDown(verMov)
          );
          writeMainCharacter();
          dialogue = await createDialogue(
            chambersInfo[level],
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

    if (talkMenu && !finalChamber && !firstChamber) {
      process.stdout.write(ansiEscapes.cursorTo(0, 0));
      let sentences = splitSentences(dialogue);
      if (key.name === "right" && dialogueIndex < sentences.length - 1) {
        dialogueIndex++;
      }
      if (key.name === "left" && dialogueIndex > 0) {
        dialogueIndex--;
      }
      createDialogueBox(sentences, dialogueIndex, currentChamber, character);
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
          chambersInfo[level],
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

    if (talkMenu && finalChamber) {
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

function writeMainCharacter() {
  console.log("[]");
}

function createchambers() {
  for (let i = level; i >= 0; i--) {
    chambers[i].create();
  }
}

function addLevel() {
  level++;
  if (level > numChambers - 1) {
    level = numChambers - 1;
    finalChamber = true;
  }
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

function createDialogueBox(arr, dialogueIndex, currentChamber, character) {
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

function initializeGame() {
  process.stdin.resume();

  readline.emitKeypressEvents(process.stdin);
  if (process.stdin.isTTY) process.stdin.setRawMode(true);

  process.stdout.write(ansiEscapes.clearScreen + ansiEscapes.cursorHide);

  chambers[0].create();

  process.stdout.write(ansiEscapes.eraseScreen + ansiEscapes.cursorHide);

  createNarrativeBox(firstSentences, 0);

  // process.stdout.write(ansiEscapes.cursorTo(horMov, verMov));
  // writeMainCharacter();
  // process.stdout.write(ansiEscapes.eraseScreen + ansiEscapes.cursorHide);
}

/** Dungeon Mystery by Ana Konzen
 *
 * A dungeon-crawler RPG game in your computer's terminal, using ChatGPT.
 */

import { keypress } from "https://deno.land/x/cliffy@v1.0.0-rc.4/keypress/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/mod.ts";

import { createGame, createMessage, createDialogue, createEpilogue, createPrologue } from "./chats.js"; //ChatGPT prompts and other utility functions for the game

import { randomInt, splitSentences, getOverlaps } from "./util.js";

import { placeAt, showCursor, hideCursor, eraseScreen, clearScreen } from "./ansi.js";

import { createNarrativeBox, createDialogueBox, writeMessage } from "./components.js";

import { Character } from "./character.js";

import { createChambers } from "./chamber.js";

const numChambers = 5;
const chatHistory = [];

let level = 0;
let dialogueIndex = 0;

let dialogue;
let playerOverlaps;
let trust;

const player = new Character(0, 0);

let doorLocked = true;
let epilogue;
let finalChamber = false;
let currentChamber;
let chamberColor = "white";
let doorColor = 0xffffff;

const jsonStr = await Deno.readTextFile("game_info.json");

// const gameInfo = await createGame(numChambers);
const gameInfo = JSON.parse(jsonStr);

const chambersInfo = gameInfo.chambers;

// const prologue = await createPrologue(gameInfo, numChambers);
const prologue = `${gameInfo.setting}  ${gameInfo.mystery}  ${gameInfo.finalPrize}`;
const prologueSentences = splitSentences(prologue);

chatHistory.push({
  prologue: prologue,
});

let messages = await createMessage(chambersInfo[level], gameInfo, chatHistory, numChambers);

const chambers = createChambers(numChambers);

// eraseScreen();
// hideCursor();

chambers[0].create();

eraseScreen();
hideCursor();

createNarrativeBox(prologueSentences, 0, "prologue");

for await (const event of keypress()) {
  eraseScreen();
  hideCursor();
  if (player.inPrologue) {
    placeAt(0, 4);

    //create narrative box
    if (event.key === "right" && dialogueIndex < prologueSentences.length - 1) dialogueIndex++;
    if (event.key === "left" && dialogueIndex > 0) dialogueIndex--;

    createNarrativeBox(prologueSentences, dialogueIndex, "prologue");

    //start the main game after space if pressed
    if (event.key === "space") startGame();
  } else {
    //game started
    clearScreen();
    currentChamber = chambers[level]; //level defaults to 0

    player.placeInChamber(currentChamber);

    playerOverlaps = getOverlaps(currentChamber, player.x, player.y);

    const npc = chambersInfo[level].character;

    trust = npc.trustLevel;

    writeMessage(`${level + 1}: ${chambersInfo[level].name}`); //room title

    if ((event.key === "c" && !event.ctrlKey) || trust >= 10) unlockDoor();

    //if player is moving
    if (player.moving) {
      player.color = 0xffffff;

      if (event.key === "d" || event.key === "right")
        if (!playerOverlaps.wall.right && !playerOverlaps.npc.right) player.x += 2;

      if (event.key === "a" || event.key === "left")
        if (!playerOverlaps.wall.left && !playerOverlaps.npc.left) player.x -= 2;

      if (event.key === "s" || event.key === "down")
        if (!playerOverlaps.wall.bottom && !playerOverlaps.npc.bottom) player.y++;

      if (event.key === "w" || event.key === "up")
        if (!playerOverlaps.wall.top && !playerOverlaps.npc.top) player.y--;

      if (player.isCloseToExit()) {
        if (doorLocked) writeMessage(colors.red("The door is locked"), 4);
        else {
          writeMessage(colors.green("The door is unlocked! Press 'e' to go to the next chamber"), 4);
          if (event.key === "e") await addLevel(); //add level if player is close to exit and door is unlocked
        }
      }

      if (player.isCloseToNPC()) {
        writeMessage("Press 'space' to talk", 4);
        if (event.key === "space") await startDialogue(); //if player is moving (not in dialogue), start dialogue
      }
    } else {
      if (event.key === "space") leaveDialogue(); //if player is in dialogue, leave dialogue
    }
    renderChambers();

    player.render();

    if (player.inDialogue) {
      placeAt(0, 0);
      const sentences = splitSentences(dialogue);
      if (event.key === "right" && dialogueIndex < sentences.length - 1) dialogueIndex++;
      if (event.key === "left" && dialogueIndex > 0) dialogueIndex--;

      createDialogueBox(sentences, dialogueIndex, currentChamber, npc);

      if (event.key === "t") startTalking();

      if (player.talking) {
        player.color = 0xffffff;
        const playerResponse = await Input.prompt({ message: "Your response:" });
        await finishTalking(playerResponse);
        dialogueIndex = 0;
      }
      placeAt(0, 0);
    }

    renderChambers();

    player.render();

    if (player.inEpilogue) {
      eraseScreen();
      hideCursor();
      const epilogueSentences = splitSentences(epilogue);
      if (event.key === "right" && dialogueIndex < epilogueSentences.length - 1) dialogueIndex++;

      if (event.key === "left" && dialogueIndex > 0) dialogueIndex--;

      createNarrativeBox(epilogueSentences, dialogueIndex, "epilogue");
    }
  }
  if (event.ctrlKey && event.key === "c") {
    await endGame();
    break;
  }
}

function renderChambers() {
  for (let i = level; i >= 0; i--) {
    chambers[i].color = chamberColor;
    chambers[i].doorColor = doorColor;
    chambers[i].create();
  }
}

async function addLevel() {
  level++;
  if (level > numChambers - 1) {
    level = numChambers - 1;
    finalChamber = true;
  }
  messages = await createMessage(chambersInfo[level], gameInfo, chatHistory, numChambers);
  doorLocked = true;
  if (finalChamber) {
    eraseScreen();
    hideCursor();
    epilogue = await createEpilogue(gameInfo, chatHistory, numChambers);
    chatHistory.push({ epilogue: epilogue });
    dialogueIndex = 0;
    player.goToEpilogue();
  }
}

async function endGame() {
  eraseScreen();
  showCursor();
  let chatObject = { history: chatHistory };
  let jsonStr = JSON.stringify(chatObject);
  await Deno.writeTextFile("chat_history.json", jsonStr);
}

function unlockDoor() {
  writeMessage(colors.green("You received a key!"), 4);
  doorLocked = false;
}

async function startDialogue() {
  player.moving = false;
  hideCursor();
  chamberColor = "gray";
  doorColor = 0x808080;
  player.color = 0x808080;
  renderChambers();
  player.render();
  dialogue = await createDialogue(chambersInfo[level], messages, trust, chatHistory, numChambers);
  player.inDialogue = true;
  dialogueIndex = 0;
}

function startGame() {
  player.startMoving();
  player.x = chambers[0].x + 1;
  player.y = chambers[0].y + 1;
  chambers[0].create();
  player.render();
}

function leaveDialogue() {
  chamberColor = "white";
  doorColor = 0xffffff;
  player.color = 0xffffff;
  messages.push({
    role: "user",
    content: "Hello, I'm back.",
  });
  player.startMoving();
}

async function startTalking() {
  player.color = 0xffffff;
  player.talking = true;
  player.moving = false;
  dialogueIndex = 0;
  showCursor();
  placeAt(0, 43);
}

async function finishTalking(playerResponse) {
  hideCursor();
  player.talking = false;
  player.color = 0x808080;
  dialogueIndex = 0;
  messages.push({ role: "user", content: playerResponse });
  chatHistory.push(`Player: ${playerResponse}`);
  dialogue = await createDialogue(chambersInfo[level], messages, trust, chatHistory, numChambers);
  placeAt(0, 0);
}

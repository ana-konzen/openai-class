/** Dungeon Mystery by Ana Konzen
 *
 * A dungeon-crawler RPG game in your computer's terminal, using ChatGPT.
 */

import { keypress } from "https://deno.land/x/cliffy@v1.0.0-rc.4/keypress/mod.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";
import { Input } from "https://deno.land/x/cliffy@v1.0.0-rc.4/prompt/mod.ts";

import { createGame, createMessage, createDialogue, createEpilogue, createPrologue } from "./chats.js"; //ChatGPT prompts and other utility functions for the game

import { splitSentences, getOverlaps } from "./util.js";

import { cursorTo, showCursor, hideCursor, eraseScreen, clearScreen, eraseDown } from "./ansi.js";

import { renderNarrativeBox, renderDialogueBox, renderMessage, renderMenu } from "./components.js";

import { Character } from "./character.js";

import { createChambers } from "./chamber.js";

const numChambers = 5;
const chatHistory = [];

let level = 0;
let room = 0;
let dialogueIndex = 0;
const navActions = ["[w][a][s][d] move"];
const listenActions = ["[<] previous", "[>] next"];
const listenActionsLast = ["[<] previous", colors.magenta("[r] reply"), "[l] leave"];
const talkActions = ["[enter] confirm"];
const navActionsNpc = ["[w][a][s][d] move", colors.magenta("[t] talk")];
const navActionsDoor = ["[w][a][s][d] move", colors.magenta("[e] open door")];

let dialogue;
let playerOverlaps;
let trust;

const player = new Character(0, 0);

let epilogue;
let finalChamber = false;
let chamberColor = "white";
const gray = 0x808080;
const white = 0xffffff;
const cyan = 0x48d1cc;
let doorColor = white;

const jsonStr = await Deno.readTextFile("game_info.json");

// const gameInfo = await createGame(numChambers);
const gameInfo = JSON.parse(jsonStr);

const chambersInfo = gameInfo.chambers;
const chambers = createChambers(numChambers, chambersInfo);

const prologue = await createPrologue(gameInfo, numChambers);
// const prologue = `${gameInfo.setting}  ${gameInfo.mystery}  ${gameInfo.finalPrize}`;
const prologueSentences = splitSentences(prologue);

chatHistory.push({
  prologue: prologue,
});

// eraseScreen();
// hideCursor();
let currentChamber = chambers[0];

currentChamber.render();
currentChamber.messages = await createMessage(chambersInfo[level], gameInfo, chatHistory, numChambers);

eraseScreen();
hideCursor();

renderNarrativeBox(prologueSentences, 0, "prologue");

for await (const event of keypress()) {
  eraseScreen();
  hideCursor();
  if (player.inPrologue) {
    cursorTo(0, 4);

    //create narrative box
    if (event.key === "right" && dialogueIndex < prologueSentences.length - 1) dialogueIndex++;
    if (event.key === "left" && dialogueIndex > 0) dialogueIndex--;

    renderNarrativeBox(prologueSentences, dialogueIndex, "prologue");

    //start the main game after space if pressed
    if (event.key === "space") startGame(currentChamber);
  } else if (player.inNavigation || player.inDialogue) {
    //game started
    clearScreen();
    cursorTo(0, 0);
    currentChamber = chambers[room]; //level defaults to 0
    // renderMessage(`${room + 1}: ${chambersInfo[room].name}`, currentChamber.x); //room title
    player.placeInChamber(currentChamber);

    playerOverlaps = getOverlaps(currentChamber, player.x, player.y);

    const npc = chambersInfo[room].character;

    trust = npc.trustLevel ?? npc.initialTrustLevel;

    if ((event.key === "c" && !event.ctrlKey) || trust >= 10) unlockDoor(currentChamber);

    //if player is moving
    if (player.inNavigation) {
      renderMenu(navActions, currentChamber);
      player.color = white;

      if (event.key === "d" || event.key === "right")
        if (!playerOverlaps.wall.right && !playerOverlaps.npc.right) player.x += 2;

      if (event.key === "a" || event.key === "left")
        if (!playerOverlaps.wall.left && !playerOverlaps.npc.left) player.x -= 2;

      if (event.key === "s" || event.key === "down")
        if (!playerOverlaps.wall.bottom && !playerOverlaps.npc.bottom) player.y++;

      if (event.key === "w" || event.key === "up")
        if (!playerOverlaps.wall.top && !playerOverlaps.npc.top) player.y--;

      if (player.isCloseToExit()) {
        // renderMessage("Press 'e' to open the door", 4);
        renderMenu(navActionsDoor, currentChamber);
        if (!currentChamber.locked && room === level)
          renderMessage(colors.green("The door is now unlocked!"));

        if (event.key === "e") {
          if (currentChamber.locked) {
            renderMessage(colors.red("The door is locked"));
          } else {
            if (room === level) {
              await addLevel();
            } else {
              await goToNextRoom();
            }
          }
        }
      }

      if (player.isCloseToEntrance()) {
        // renderMessage(colors.yellow("Press 'e' to go to previous chamber"), currentChamber.x, 4);
        renderMenu(navActionsDoor, currentChamber);
        if (event.key === "e") await goBack();
      }

      if (player.isCloseToNPC()) {
        // renderMessage("Press 'space' to talk", currentChamber.x, 4);
        renderMenu(navActionsNpc, currentChamber);
        if (event.key === "t") {
          hideCursor();
          await startDialogue(currentChamber);
          hideCursor();
          const sentences = splitSentences(dialogue);
          hideCursor();
          renderMenu(listenActions, currentChamber);
          renderMessage(`Trust Level: ${trust}`);

          renderDialogueBox(sentences, dialogueIndex, currentChamber, npc);
        }
      }
    } else if (player.inDialogue) {
      renderMenu(listenActions, currentChamber);
      renderMessage(`Trust Level: ${trust}`);

      cursorTo(0, 0);

      let sentences = splitSentences(dialogue);
      if (event.key === "right" && dialogueIndex < sentences.length - 1) dialogueIndex++;
      if (event.key === "left" && dialogueIndex > 0) dialogueIndex--;
      renderMessage(`Trust Level: ${trust}`);

      renderDialogueBox(sentences, dialogueIndex, currentChamber, npc);

      if (dialogueIndex === sentences.length - 1) {
        renderMenu(listenActionsLast, currentChamber);
        renderMessage(`Trust Level: ${trust}`);

        if (event.key === "r") {
          renderMenu(talkActions, currentChamber);
          renderMessage(`Trust Level: ${trust}`);

          renderDialogueBox(sentences, dialogueIndex, currentChamber, npc);

          startTalking();
          player.color = white;
          const playerResponse = await Input.prompt({ message: "Your response:" });
          renderMenu(listenActions, currentChamber);
          await finishTalking(playerResponse, currentChamber);
          eraseDown();
          hideCursor();
        }
        renderMenu(listenActionsLast, currentChamber);
        sentences = splitSentences(dialogue);
        renderDialogueBox(sentences, dialogueIndex, currentChamber, npc);

        renderMessage(`Trust Level: ${trust}`);

        if (event.key === "l") {
          leaveDialogue(currentChamber);
          clearScreen();
        }
      }

      cursorTo(0, 0);
    }
    // renderMessage(`${room + 1}: ${chambersInfo[room].name}`, currentChamber.x); //room title
    renderChambers();
    player.render();
  } else if (player.inEpilogue) {
    eraseScreen();
    hideCursor();
    const epilogueSentences = splitSentences(epilogue);
    if (event.key === "right" && dialogueIndex < epilogueSentences.length - 1) dialogueIndex++;

    if (event.key === "left" && dialogueIndex > 0) dialogueIndex--;

    renderNarrativeBox(epilogueSentences, dialogueIndex, "epilogue");
  }
  if (event.ctrlKey && event.key === "c") {
    await endGame();
    break;
  }
}

function renderChambers() {
  for (let i = level; i >= 0; i--) {
    if (i === room) {
      chambers[i].color = chamberColor;
      chambers[i].doorColor = doorColor;
      chambers[i].npcColor = cyan;
    } else {
      chambers[i].color = "gray";
      chambers[i].doorColor = gray;
      chambers[i].npcColor = gray;
    }
    chambers[i].render();
  }
}

async function addLevel() {
  level++;
  if (level > numChambers - 1) {
    level = numChambers - 1;
    finalChamber = true;
  }
  chambers[level].messages = await createMessage(chambersInfo[level], gameInfo, chatHistory, numChambers);
  if (finalChamber) {
    player.inEpilogue = true;
    eraseScreen();
    hideCursor();
    epilogue = await createEpilogue(gameInfo, chatHistory, numChambers);
    chatHistory.push({ epilogue: epilogue });
    dialogueIndex = 0;
    player.goToEpilogue();
  }
  goToNextRoom(true);
}

async function goToNextRoom(firstTime = false) {
  room++;
  if (room > numChambers - 1) room = numChambers - 1;
  if (!firstTime) {
    // chambers[room].messages.push({
    //   role: "user",
    //   content: `Hello, I'm back. Here's what I've been up to: ${chatHistory}`,
    // });
  }
}

async function goBack() {
  room--;
  if (room < 0) room = 0;
  // chambers[room].messages.push({
  //   role: "user",
  //   content: `Hello, I'm back. Here's what I've been up to: ${chatHistory}`,
  // });
}

async function endGame() {
  eraseScreen();
  showCursor();
  let chatObject = { history: chatHistory };
  let jsonStr = JSON.stringify(chatObject);
  await Deno.writeTextFile("chat_history.json", jsonStr);
}

function unlockDoor(chamber) {
  if (chamber.locked) renderMessage(colors.green("You received a key!"));
  // doorLocked = false;
  chamber.locked = false;
}

async function startDialogue(chamber) {
  hideCursor();
  player.inNavigation = false;
  chamberColor = "gray";
  doorColor = gray;
  player.color = gray;
  renderChambers();
  player.render();
  dialogue = await createDialogue(chambersInfo[room], chamber.messages, trust, chatHistory, numChambers);
  player.inDialogue = true;
  dialogueIndex = 0;
}

function startGame(currentChamber) {
  player.startMoving();
  player.x = chambers[0].x + 1;
  player.y = chambers[0].y + 1;
  chambers[0].render();
  player.render();
  renderMenu(navActions, currentChamber);
}

function leaveDialogue(chamber) {
  player.inDialogue = false;
  chamberColor = "white";
  doorColor = white;
  player.color = white;
  chamber.messages.push({
    role: "user",
    content: "Hello, I'm back. We can now continue our conversation where we left off.",
  });
  player.startMoving();
}

async function startTalking() {
  player.color = white;
  player.talking = true;
  player.inDialogue = true;
  player.inNavigation = false;
  renderChambers();
  player.render();
  dialogueIndex = 0;
  cursorTo(1, 43);
  showCursor();
}

async function finishTalking(playerResponse, chamber) {
  hideCursor();
  player.talking = false;
  player.color = gray;
  dialogueIndex = 0;
  chamber.messages.push({ role: "user", content: playerResponse });
  chatHistory.push(`Player: ${playerResponse}`);
  dialogue = await createDialogue(chambersInfo[room], chamber.messages, trust, chatHistory, numChambers);
  trust = chambersInfo[room].character.trustLevel;
  cursorTo(0, 0);
}

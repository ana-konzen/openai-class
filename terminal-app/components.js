import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import { placeAt, eraseLine } from "./ansi.js";

export function createNarrativeBox(sentences, dialogueIndex, type = false) {
  placeAt(0, 4);
  console.log(
    boxen(`${sentences[dialogueIndex]}\n\n${dialogueIndex + 1}/${sentences.length}`, {
      width: 50,
      height: 20,
      padding: 1,
      borderStyle: "double",
      float: "center",
      title: "Narrator",
      borderColor: "#345717",
    })
  );

  if (type === "epilogue" || type === "prologue") {
    if (dialogueIndex === sentences.length - 1) {
      let message;
      if (type === "epilogue") {
        message = "press 'control + c' to exit";
      } else if (type === "prologue") {
        message = "press 'space' to start your adventure!";
      }
      placeAt(0, 25);
      console.log(
        boxen(message, {
          float: "center",
          borderStyle: "none",
        })
      );
    }
  }
  placeAt(0, 0);
}

export function createDialogueBox(sentences, dialogueIndex, currentChamber, character) {
  placeAt(0, 0);
  console.log(
    boxen(`${sentences[dialogueIndex]}\n\n${dialogueIndex + 1}/${sentences.length}`, {
      padding: 1,
      width: 30,
      height: 20,
      borderStyle: "double",
      borderColor: "cyan",
      title: character.name,
      margin: {
        top: 21,
        left: currentChamber.x,
      },
      borderStyle: "singleDouble",
    })
  );
  placeAt(0, 0);
}

export function writeMessage(message, y = 2) {
  placeAt(0, y);
  eraseLine();
  console.log(message);
  placeAt(0, 0);
}

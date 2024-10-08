import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import { placeAt, eraseLine } from "./ansi.js";

export function createNarrativeBox(arr, dialogueIndex) {
  placeAt(0, 4);
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
  placeAt(0, 0);
}

export function createDialogueBox(
  arr,
  dialogueIndex,
  currentChamber,
  character
) {
  placeAt(0, 0);
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
  placeAt(0, 0);
}

export function writeMessage(message, y = 2) {
  placeAt(0, y);
  eraseLine();
  console.log(message);
  placeAt(0, 0);
}

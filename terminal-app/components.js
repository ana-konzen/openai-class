import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import { cursorTo, eraseLine, eraseDown, eraseEndLine } from "./ansi.js";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";
import { Cell, Row, Table } from "https://deno.land/x/cliffy@v1.0.0-rc.4/table/mod.ts";

export function renderNarrativeBox(sentences, dialogueIndex, type = "default") {
  cursorTo(0, 4);
  console.log(
    boxen(`${sentences[dialogueIndex]}\n\n${dialogueIndex + 1}/${sentences.length}`, {
      width: 50,
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
      cursorTo(0, 25);
      console.log(
        boxen(message, {
          float: "center",
          borderStyle: "none",
        })
      );
    }
  }
  cursorTo(0, 0);
}

export function renderDialogueBox(sentences, dialogueIndex, currentChamber, character) {
  let boxWidth = 35;
  const padding = 3;
  const paddedText = " ".repeat(Math.max(padding, 0));
  cursorTo(0, 0);
  // if (dialogueIndex < sentences.length - 1) {
  console.log(
    boxen(`${sentences[dialogueIndex]}\n\n${dialogueIndex + 1}/${sentences.length}`, {
      padding: 1,
      width: boxWidth,
      // height: 20,
      borderStyle: "double",
      borderColor: "#48d1cc",
      title: character.name,
      margin: {
        top: 28,
        // left: currentChamber.x,
        left: 1,
      },
      borderStyle: "singleDouble",
    })
  );
  // } else {
  //   console.log(
  //     boxen(
  //       `${sentences[dialogueIndex]}\n\n${dialogueIndex + 1}/${
  //         sentences.length
  //       }\n\n[t] talk ${paddedText} [space] leave`,
  //       {
  //         padding: 1,
  //         width: boxWidth,
  //         // height: 20,
  //         borderStyle: "double",
  //         borderColor: "cyan",
  //         title: character.name,
  //         margin: {
  //           top: 21,
  //           left: currentChamber.x,
  //         },
  //         borderStyle: "singleDouble",
  //       }
  //     )
  //   );
  // }

  cursorTo(0, 0);
}

export function renderMessage(message, x = 1, y = 26) {
  cursorTo(x, y);
  eraseEndLine();
  eraseLine();
  console.log(message);
  cursorTo(0, 0);
}

export function renderMenu(options, currentChamber, x = 1, y = 22) {
  let actionsMenu = new Table();
  actionsMenu.body([options]);
  actionsMenu.padding(5);
  let menuString = actionsMenu.toString();

  cursorTo(x, y);
  eraseDown();
  eraseEndLine();
  eraseLine();
  console.log(colors.bold(`${currentChamber.number}: ${currentChamber.title}`));
  cursorTo(x, y + 2);
  eraseLine();
  eraseEndLine();
  console.log(menuString);

  cursorTo(0, 0);
}

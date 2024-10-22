import OpenAI from "npm:openai@4.60.0";

import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";

import { getEnvVariable } from "../shared/util.ts";

import { cursorTo, hideCursor, eraseDown } from "./ansi.js";

export function initOpenAI() {
  const apiKey = getEnvVariable("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not found.");

  let openai = new OpenAI(apiKey);

  return openai;
}

export async function gptDialogue(name, chatParams) {
  hideCursor();
  const spinner = renderSpinner("Thinking", "dialogue", name);

  try {
    let openai = initOpenAI();

    const response = await openai.chat.completions.create(chatParams);
    clearInterval(spinner);

    cursorTo(0, 0);

    return response.choices[0].message;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function gptMain(type, chatParams) {
  const spinner = renderSpinner("Loading", "main");

  try {
    let openai = initOpenAI();

    const response = await openai.chat.completions.create(chatParams);
    clearInterval(spinner);

    cursorTo(0, 30);

    eraseDown();
    // spinner.stop();
    if (type === "prologue") {
      console.log(
        boxen(colors.bold("Press any key to start the game"), {
          float: "center",
          borderStyle: "none",
        })
      );
    }
    cursorTo(0, 0);

    return response.choices[0].message;
  } catch (error) {
    console.error("Error:", error);
  }
}

function renderSpinner(message, type, name = "", x = 0, y = 30) {
  const spinner = [".  ", ".. ", "...", "   "];
  let i = 0;
  return setInterval(() => {
    // eraseLine();
    // console.log(message + spinner[i++]);
    if (type === "main") {
      cursorTo(x, y);
      console.log(
        boxen(message + spinner[i++], {
          float: "center",
          borderStyle: "none",
        })
      );
    } else if (type === "dialogue") {
      cursorTo(0, 23);
      eraseDown();
      cursorTo(0, 0);

      console.log(
        boxen(message + spinner[i++], {
          padding: 1,
          width: 35,
          borderColor: "#48d1cc",
          title: name,
          margin: {
            top: 23,
            // left: currentChamber.x,
            left: 1,
          },
          borderStyle: "singleDouble",
        })
      );
    }
    cursorTo(0, 0);
    i &= 3;
  }, 200);
}

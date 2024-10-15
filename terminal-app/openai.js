import OpenAI from "npm:openai@4.60.0";

import Kia from "https://deno.land/x/kia@0.4.1/mod.ts";
import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";

import { getEnvVariable } from "../shared/util.ts";

import { cursorTo, eraseLine, hideCursor, eraseDown } from "./ansi.js";

export function initOpenAI() {
  const apiKey = getEnvVariable("OPENAI_API_KEY");
  if (!apiKey) throw new Error("OPENAI_API_KEY not found.");

  let openai = new OpenAI(apiKey);

  return openai;
}

export async function gpt(chatParams) {
  const spinner = new Kia();
  spinner.start();

  try {
    let openai = initOpenAI();

    const response = await openai.chat.completions.create(chatParams);

    spinner.stop();

    return response.choices[0].message;
  } catch (error) {
    console.error("Error:", error);
  }
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

export async function gptMain(chatParams) {
  const spinner = renderSpinner("Loading game", "start");

  try {
    let openai = initOpenAI();

    const response = await openai.chat.completions.create(chatParams);
    clearInterval(spinner);

    cursorTo(0, 26);

    eraseDown();
    // spinner.stop();
    console.log(
      boxen(colors.green("Press any key to start the game."), {
        float: "center",
        borderStyle: "none",
      })
    );
    cursorTo(0, 0);

    return response.choices[0].message;
  } catch (error) {
    console.error("Error:", error);
  }
}

function renderSpinner(message, type, name = "", x = 0, y = 26) {
  const spinner = [".  ", ".. ", "...", "   "];
  let i = 0;
  return setInterval(() => {
    eraseLine();
    cursorTo(x, y);
    // console.log(message + spinner[i++]);
    if (type === "start") {
      console.log(
        boxen(message + spinner[i++], {
          float: "center",
          borderStyle: "none",
        })
      );
    } else if (type === "dialogue") {
      cursorTo(0, 0);
      // if (dialogueIndex < sentences.length - 1) {
      console.log(
        boxen(message + spinner[i++], {
          padding: 1,
          width: 35,
          borderStyle: "double",
          borderColor: "#48d1cc",
          title: name,
          margin: {
            top: 28,
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

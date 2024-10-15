import OpenAI from "npm:openai@4.60.0";

import Kia from "https://deno.land/x/kia@0.4.1/mod.ts";

import { getEnvVariable } from "../shared/util.ts";

import { cursorTo, eraseLine, hideCursor, eraseDown, eraseEndLine } from "./ansi.js";

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

export async function gptDialogue(chatParams) {
  cursorTo(1, 24);
  hideCursor();
  eraseEndLine();
  eraseLine();
  const spinner = new Kia("The character is thinking...");
  spinner.start();

  try {
    let openai = initOpenAI();

    const response = await openai.chat.completions.create(chatParams);

    spinner.stop();
    cursorTo(0, 0);

    return response.choices[0].message;
  } catch (error) {
    console.error("Error:", error);
  }
}

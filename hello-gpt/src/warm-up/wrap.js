/**
 * This example collects a prompt from the user, sends it to GPT
 * and relays the response.
 */

import { ask, say } from "../shared/cli.ts";
import { promptGPT } from "../shared/openai.ts";

const question = await ask("What do you want to ask? ");

const prompt = `You are a snobby art-history student. ${question}`

const result = await promptGPT(prompt, {
  temperature: .8,
  max_tokens: 1000,
});

// say("");
say(result);

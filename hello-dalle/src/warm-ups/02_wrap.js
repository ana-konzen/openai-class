/**
 * This example collects a prompt from the user, sends it to GPT
 * and relays the response.
 */

import { ask, say } from "../../../shared/cli.ts";
import { promptDalle } from "../../../shared/openai.ts";

const userPrompt = await ask("What do you want from Dall•e?");

// sent prompt to gpt and relay response
const response = await promptDalle(`I will give you a prompt of something to draw. Please draw it in an impressionist painting style. Here's the prompt: ${userPrompt}`);

say("");
say("URL");
say(response.url);

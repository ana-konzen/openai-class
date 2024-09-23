/**
 * This example collects a prompt from the user, sends it to GPT
 * and relays the response.
 */

import { ask, say } from "../shared/cli.ts";
import { promptDalle } from "../shared/openai.ts";

const art = await ask("Choose an art style");
const place = await ask("Choose a place");
const mood = await ask("Choose a mood");
const color = await ask("Choose a color");

// sent prompt to gpt and relay response
const response = await promptDalle(
    `A photograph of a character drawn in an ${art} style in ${place}. The character is ${mood}.
     They are wearing ${color} clothing`,
);

say("");
say("URL");
say(response.url);

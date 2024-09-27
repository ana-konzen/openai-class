/**
 * This program prompts the user to enter their name and hometown
 * and uses theLLM to generate a limerick about the user.
 */

import { promptGPT } from "../../../shared/openai.ts";
import { ask, say } from "../../../shared/cli.ts";

// prompt user for name and hometown
const name = await ask("What is your name?");
const town = await ask("Where are you from?");
const pronouns = await ask("What are your pronouns?");


// output a blank line
say("");

// prepare the prompt and send to GPT
const prompt =
  `My name is ${name} and I am from ${town}. I use ${pronouns} pronouns. Create a haiku about me. Consider the requirements of a haiku: 
  It has three lines.
  It has five syllables in the first and third lines.
  It has seven syllables in the second line.
  Its lines don't rhyme.
  It includes a kireji, or cutting word.
  It includes a kigo, a seasonal reference.`;

const limerick = await promptGPT(prompt, { temperature: 0.7 });

// output the limerick
say(limerick);

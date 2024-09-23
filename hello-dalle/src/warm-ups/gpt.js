import { ask, say } from "../shared/cli.ts";
import { promptDalle, promptGPT } from "../shared/openai.ts";

const prompt = await ask("What do you want DALLE to draw?");

const question = await promptGPT(`Hello, GPT! This user has prompted the folling to DALLE.
    Can you ask a follow-up question so we can make the drawing extra-nice? Here's the prompt: ${prompt}.
    What is your question? Please only answer with your question.`, {temperature: 0.7});

const expanded = await ask(question);

const response = await promptDalle(`Please draw ${prompt}, taking the following into consideration: ${expanded}`);

say("");
say("URL");
say(response.url);


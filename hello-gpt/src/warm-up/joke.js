import { promptGPT } from "../shared/openai.ts"
import { ask, say} from "../shared/cli.ts"

const subject = await ask("Tell me a subject for a light bulb joke.");

say("");

const prompt = `Tell me a light bulb joke about ${subject}`;

const joke = await promptGPT(prompt, { temperature: 0.8 });

say(joke);




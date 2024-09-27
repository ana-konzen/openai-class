import { promptGPT } from "../../../shared/openai.ts"
import { ask, say} from "../../../shared/cli.ts"

const response = await ask("Give me a text to translate to Portuguese.");

say("");

const prompt = `Translate the following text to Portuguese. Text: ${response}`;

const joke = await promptGPT(prompt, { temperature: 0.7 });

say(joke);




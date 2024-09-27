import { ask, say } from "../../../shared/cli.ts";
import { promptDalle } from "../../../shared/openai.ts";

const animal = await ask("Tell me an animal.");

const season = await ask("Tell me a season.");

const setting = await ask("Tell me a setting (like city, the country, etc).");

const response = await promptDalle(`Please draw a ${animal} during ${season}. The setting is ${setting}. 
    Please draw it in an impressionist painting style.`);

say("");
say("URL");
say(response.url);




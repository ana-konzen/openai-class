import * as fal from "npm:@fal-ai/serverless-client";
import * as log from "../../../shared/logger.ts";
import {apiKey} from "../../../shared/falai.ts";
import { promptGPT } from "../../../shared/openai.ts";
import { ask, say } from "../../../shared/cli.ts";



log.setLogLevel(log.LogLevel.DEBUG);

fal.config({
    credentials: apiKey,
  });

const prompt = await ask("What would you like Flux to draw?");

const expandedPrompt = await promptGPT(`Hello. I am going to prompt an AI to draw something for me. 
    Can you expand the prompt? Here's what I have: ${prompt}. Please only answer with the expanded prompt.`, 
    {temperature: 0.7, max_tokens: 500});



const result = await fal.subscribe("fal-ai/flux", {
    input: {
        "prompt": expandedPrompt,
        // "image_size": "square_hd",
        "num_inference_steps": "4", //low quality
        "num_images": 1,
        "enable_safety_checker": true,
        // "seed": 1337,
    },
});

say(expandedPrompt);
say("");
say("URL");
say(result.images[0].url);
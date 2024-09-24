/// I'm going to use this somewhere else

import { ask, say } from "./hello-dalle/src/shared/cli.ts";
import { gpt, initOpenAI } from "./hello-dalle/src/shared/openai.ts";

createLayout();

async function createLayout() {
  initOpenAI();

  say("Hello, GPT!");

  const prompt = "A good layout for a letter-size page of a story book. It contains 2 images and 2 200-word paragraphs. Give the results in pixels";

  const result = await gpt({
    messages: [{ role: "user", content: prompt }],
    temperature: .8,
    max_tokens: 512,
    model: "gpt-4o-2024-08-06",
    response_format: {
        type: "json_schema",
        json_schema: {
            name: "page_layout",
            schema: {
                type: "object",
                properties: {
                    image1: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                x_pos: { type: "number" },
                                y_pos: { type: "number" },
                                width: {type: "number"},
                            },
                            required: ["x_pos", "y_pos", "width"],
                            additionalProperties: false
                        }
                    },
                    image2: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                x_pos: { type: "number" },
                                y_pos: { type: "number" },
                                width: {type: "number"},
                            },
                            required: ["x_pos", "y_pos", "width"],
                            additionalProperties: false
                        }
                    },
                    paragraph1: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                x_pos: { type: "number" },
                                y_pos: { type: "number" },
                                width: {type: "number"},
                            },
                            required: ["x_pos", "y_pos", "width"],
                            additionalProperties: false
                        }
                    },
                    paragraph2: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                x_pos: { type: "number" },
                                y_pos: { type: "number" },
                                width: {type: "number"},
                            },
                            required: ["x_pos", "y_pos", "width"],
                            additionalProperties: false
                        }
                    },
                },
                required: ["image1", "image2", "paragraph1", "paragraph2"],
                additionalProperties: false
            },
            strict: true
        }
    }
});

  say("");
  say("result.content");
  say(result.content);

  say("");
  say("result.parsed");
  say(JSON.stringify(result.parsed, null, 2));

  say("");
  say(result.parsed.image1[0].x_pos);
//   say(`Name: ${character.name}`);
//   say(`Title: ${character.title}`);
//   say(`Race: ${character.race}`);
//   say(`Class: ${character.class}`);
//   say(`Alignment: ${character.alignment}`);
}
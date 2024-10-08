/**Prompts for ChatGPT.
 * by Ana Konzen
 */

import { gpt } from "./openai.ts"; //GPT util functions by Justin Bakse
import ansiEscapes from "npm:ansi-escapes";
import * as process from "node:process";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";

export async function createInitialMessage(gameInfo) {
  const response = await gpt({
    messages: [
      {
        role: "system",
        content: `
          You are the narrator of a dungeon-crawler game in the computer terminal. 
          The game is going to be a mystery game and dialogue-based. 
          The player will enter a room that has one NPC. It's the player's job to interact with the NPC and find out about the game's mystery. 
          The player needs to answer the NPC in a specific way so they can give the player a key to unlock the door to the next room.
          The rooms are empty. The player can only interact with the NPC. The player cannot leave the room until they receive a key. Each interaction should be meaningful.
          The dungeon has 5 total rooms. When the player unlocks the 5th room, they will encounter the final prize and win the game.
          The NPCs know each other and will take into consideration what has been said in previous rooms, and will also ask for information given to the player by other NPCs.
          Here's the game's setting: ${gameInfo.parsed.setting}.
          The overall mystery of the game: ${gameInfo.parsed.mystery}.
          The final prize of the game: ${gameInfo.parsed.finalPrize}.
          Your role is to introduce the game to the player in 200 - 250 words. Explain what the player needs to do.
          Basically, narrate the beginning of the game.`,
      },
      {
        role: "user",
        content: `Where am I?`,
      },
    ],
    max_tokens: 500,
  });

  return response.content;
}

export async function createFinalMessage(gameInfo, chatHistory) {
  const response = await gpt({
    messages: [
      {
        role: "system",
        content: `
          You are the narrator of a dungeon-crawler game in the computer terminal. Here's the information you need about the game:
          Setting: ${gameInfo.parsed.setting}.
          The overall mystery of the game: ${gameInfo.parsed.mystery}.
          The final prize of the game: ${gameInfo.parsed.finalPrize}.
          The player visited 5 chambers. Here is the conversation history: ${chatHistory}.
          Your role is to give the final prize to the player and explain it to them. 
          Narrate what the prize is and what happened in 200 - 250 words, based on the conversation history and the player's actions and intentions.
          Consider that actions have consequences.`,
      },
      {
        role: "user",
        content: `Finally, I found it!`,
      },
    ],
    max_tokens: 500,
  });

  // console.log(response);

  return response.content;
}

export async function createDialogue(room, messages, trust, chatHistory) {
  const character = room.npc;
  const messageHis = [];
  if (character.trustLevel === undefined)
    character.trustLevel = character.initialTrustLevel;
  trust = character.trustLevel;

  function beNeutral() {
    let summary = `The character's trust didn't change. The current level of trust is ${trust}`;
    writeMessage(colors.yellow(summary), 4);
    return summary;
  }

  function bePositive() {
    trust++;
    let summary = `The character's trust went up! The current level of trust is ${trust}`;
    writeMessage(colors.green(summary), 4);
    return summary;
  }

  function beNegative() {
    trust--;
    let summary = `The character's trust went down! The current level of trust is ${trust}`;
    writeMessage(colors.red(summary), 4);
    return summary;
  }

  const availableFunctions = {
    beNeutral,
    bePositive,
    beNegative,
  };

  const tools = [
    {
      type: "function",
      function: {
        name: "beNeutral",
        description: "Use this to have a neutral reaction.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "bePositive",
        description: "Use this to have a positive reaction.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
          additionalProperties: false,
        },
        strict: true,
      },
    },
    {
      type: "function",
      function: {
        name: "beNegative",
        description: "Use this to have a negative reaction.",
        parameters: {
          type: "object",
          properties: {},
          required: [],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  ];

  let response;
  let tool_response = await gpt({
    model: "gpt-4o",
    messages: messages,
    tools: tools,
    tool_choice: "required",
    max_tokens: 500,
  });

  if (tool_response.tool_calls && tool_response.tool_calls.length > 0) {
    messages.push(tool_response);
    handleToolCalls(tool_response.tool_calls);

    response = await gpt({
      messages: messages,
      max_tokens: 500,
    });
    messages.push({
      role: "assistant",
      content: response.content,
      tool_choice: "required",
      tools: tools,
    });
    messageHis.push(`${character.name}: ${response.content}`);
  } else {
    messages.push({ role: "assistant", content: tool_response.content });
    messageHis.push(`${character.name}: ${tool_response.content}`);
  }

  function handleToolCalls(tool_calls) {
    for (const tool_call of tool_calls) {
      const functionName = tool_call.function.name;
      const functionresponse =
        availableFunctions[functionName]?.() || "unknown function";
      messages.push({
        tool_call_id: tool_call.id,
        role: "tool",
        name: functionName,
        content: functionresponse,
      });
    }
  }
  chatHistory.push({
    room: room.name,
    npc: character.name,
    chat: messageHis,
  });

  character.trustLevel = trust;
  return response.content;
}

export async function createGame() {
  const result = await gpt({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a game developer specialized in creating dungeon crawler RPGs in the computer terminal.
            The user will give you some parameters of what they want their game to look like.
            It is your job to build the structure of the game for them.`,
      },
      {
        role: "user",
        content: `I am creating a dungeon crawler RPG game in my computer terminal. 
            The game is going to be a mystery game and dialogue-based. 
            The player will enter a room that has one NPC. It's the player's job to interact with the NPC and find out about the game's mystery. 
            The player needs to answer the NPC in a specific way so they can give the player a key to unlock the door to the next room.
            The rooms are empty. The player can only interact with the NPC. The player cannot leave the room until they receive a key. Each interaction should be meaningful.
            The dungeon has 5 total rooms. When the player unlocks the 5th room, they will encounter the final prize and win the game.
            Please tell me what the overall setting of the game is, what the mystery is, and what the final prize is.
            Also for each room, tell me what NPC the player will encounter, what part of the mystery they will unveil to the player, and what they need from the player to give them the key.
            The NPCs know each other and will take into consideration what has been said in previous rooms, and will also ask for information given to the player by other NPCs.
            The first room should be very easy and the 5th room should be hard.`,
      },
    ],
    max_tokens: 1600,
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "game_information",
        schema: {
          type: "object",
          properties: {
            setting: {
              type: "string",
              description: "The game's setting in around 100 words.",
            },
            mystery: {
              type: "string",
              description: "The overall mystery to be solved in the game.",
            },
            finalPrize: {
              type: "string",
              description: "The final prize of the game.",
            },
            rooms: {
              type: "array",
              description: "The details for each of the 5 rooms.",
              items: {
                type: "object",
                description: "The details of the each room.",
                properties: {
                  name: {
                    type: "string",
                    description: "The room's name.",
                  },
                  difficulty: {
                    type: "number",
                    description:
                      "The difficulty level of the room, from 1 to 5.",
                  },
                  npc: {
                    type: "object",
                    description:
                      "The details about the NPC the player encounters in the room.",
                    properties: {
                      name: {
                        type: "string",
                      },
                      role: {
                        type: "string",
                        description:
                          "The role of the NPC in the mystery and overall story.",
                      },
                      alignment: {
                        type: "string",
                      },
                      initialTrustLevel: {
                        type: "number",
                        description:
                          "From 1 to 10, the level of trust the NPC has with the player. Take difficulty into consideration.",
                      },
                      keyInteraction: {
                        type: "string",
                        description: `What the player needs from the NPC to unlock the next room. 
                          Remember the room is empty and assume the player has no extra knowledge. 
                          The player cannot ask other NPCs for help, they can only remember what other NPCs told them.
                          Consider the difficulty level. If it's 1, the player has no specific knowledge and has not talked to any NPCs.`,
                      },
                    },
                    required: [
                      "name",
                      "role",
                      "alignment",
                      "initialTrustLevel",
                      "keyInteraction",
                    ],
                    additionalProperties: false,
                  },
                },
                required: ["name", "difficulty", "npc"],
                additionalProperties: false,
              },
            },
          },
          required: ["setting", "mystery", "finalPrize", "rooms"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  await Deno.writeTextFile(
    "game_info.json",
    JSON.stringify(result.parsed, null, 2)
  );

  return result;
}

export async function createMessage(room, gameInfo, chatHistory) {
  const character = room.npc;
  const message = [
    {
      role: "system",
      content: `You are a NPC in a dungeon-crawler, mystery game in the computer terminal. Here's the information you need about the game:
          Setting: ${gameInfo.parsed.setting}.
          The overall mystery of the game: ${gameInfo.parsed.mystery}.
          Final prize of the game: ${gameInfo.parsed.finalPrize}.
          The game has 5 chambers. You are in chamber number ${room.difficulty}, which is the ${room.name}. So you are the ${room.difficulty} the player encountered.
          The lower the chamber number is, the easier the interaction is (for example, the riddles should be easier) and the easier it is to gain the NPC's trust.
          You own the key to unlock the next chamber.
          Your name is ${character.name} and this is your role in the game: ${character.role}. Your alignment is ${character.alignment} 
          and your starting trust level with the player is ${character.trustLevel} out of 10. Your key interaction with the player is ${character.keyInteraction}.
          You will engage in a conversation with the player. Use the tools at your disposal to react to what the player has told you.
          The player needs to answer you in specific ways in order to unlock the next room. 
          Here is the chat history of the game: ${chatHistory}. 
          You can take into consideration what has been said in previous rooms, and can also 
          ask for information given to the player by other NPCs.
          The player only knows what you and other NPCs from the chat history have told them. The player has no extra knowledge.
          The room is empty. The player can only interact with you. The player cannot leave the room until you give them the key. Each interaction should be meaningful.
          Once your trust level is 10, you can give the player the key so they can proceed to the next chamber.
          The very first response should be neutral. You should tell the player what you need from them.
          Your answers should be between 20 and 100 words.`,
    },
    { role: "user", content: "Hello, who are you?" },
  ];
  return message;
}

export function writeMessage(message, y = 2) {
  process.stdout.write(ansiEscapes.cursorTo(0, y));
  process.stdout.write(ansiEscapes.eraseLine);
  console.log(message);
  process.stdout.write(ansiEscapes.cursorTo(0, 0));
}

/**Prompts for ChatGPT.
 * by Ana Konzen
 */

/* globals Deno */

import { gptDialogue, gptMain } from "./openai.js"; //GPT util library by Justin Bakse
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts"; //for text colors, from Cliffy

export async function createGame(numChambers) {
  const result = await gptMain("", {
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
            The player will enter a chamber that has one character. It's the player's job to interact with the character and find out about the game's mystery. 
            The player needs to answer the character in a specific way so they can give the player a key to unlock the door to the next chamber.
            The chambers are empty. The player can only interact with the character. The player cannot leave the chamber until they receive a key. Each interaction should be meaningful.
            The dungeon has ${numChambers} total chambers. When the player unlocks the ${numChambers}th chamber, they will encounter the final prize and win the game.
            Please tell me what the overall setting of the game is, what the mystery is, and what the final prize is.
            Also for each chamber, tell me what character the player will encounter, what part of the mystery they will unveil to the player, and what they need from the player to give them the key.
            The characters know each other and will take into consideration what has been said in previous chambers, and will also ask for information given to the player by other characters.
            The first chamber should be very easy and the ${numChambers}th chamber should be hard.`,
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
            chambers: {
              type: "array",
              description: `The details for each of the ${numChambers} chambers.`,
              items: {
                type: "object",
                description: "The details of the each chamber.",
                properties: {
                  name: {
                    type: "string",
                    description: "The chamber's name.",
                  },
                  difficulty: {
                    type: "number",
                    description: `"The difficulty level of the chamber, from 1 to ${numChambers}.`,
                  },
                  character: {
                    type: "object",
                    description: "The details about the character the player encounters in the chamber.",
                    properties: {
                      name: {
                        type: "string",
                      },
                      role: {
                        type: "string",
                        description: "The role of the character in the mystery and overall story.",
                      },
                      alignment: {
                        type: "string",
                      },
                      initialTrustLevel: {
                        type: "number",
                        description:
                          "From 1 to 10, the level of trust the character has with the player. Take difficulty into consideration.",
                      },
                      keyKnowledge: {
                        type: "string",
                        description: `The information or instructions the character will unveil to the player and that other characters might need.`,
                      },
                      keyNeed: {
                        type: "string",
                        description: `What the character needs from the player to give them the key.
                          For example, riddles, trivias, passcodes, and questions about what the player has learned in previous chambers, 
                          or about the overall mystery.
                          Remember the chamber is empty. 
                          Consider the difficulty level. 
                          If it's 1, the player has no specific knowledge and has not talked to any characters. 
                          So difficulty level 1 should be more of an introduction or tutorial about how to play the game. 
                          Remember to make the game fun and engaging, so each need should be diverse.
                          Be as specific and detailed as you can.`,
                      },
                    },
                    required: ["name", "role", "alignment", "initialTrustLevel", "keyKnowledge", "keyNeed"],
                    additionalProperties: false,
                  },
                },
                required: ["name", "difficulty", "character"],
                additionalProperties: false,
              },
            },
          },
          required: ["setting", "mystery", "finalPrize", "chambers"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  await Deno.writeTextFile("game_info.json", result.content);

  return JSON.parse(result.content);
}

export async function createPrologue(gameInfo, numChambers) {
  const response = await gptMain("prologue", {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `
          You are the narrator of a dungeon-crawler game in the computer terminal. 
          The game is going to be a mystery game and dialogue-based. 
          The player will enter a chamber that has one character. It's the player's job to interact with the character and find out about the game's mystery. 
          The player needs to answer the character in a specific way so they can give the player a key to unlock the door to the next chamber.
          The chambers are empty. The player can only interact with the character. The player cannot leave the chamber until they receive a key. Each interaction should be meaningful.
          The dungeon has ${numChambers} total chambers. When the player unlocks the 5th chamber, they will encounter the final prize and win the game.
          The characters know each other and will take into consideration what has been said in previous chambers, and will also ask for information given to the player by other characters.
          Here's the game's setting: ${gameInfo.setting}.
          The overall mystery of the game: ${gameInfo.mystery}.
          The final prize of the game: ${gameInfo.finalPrize}.
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

  return response.content.trim();
}

export async function createEpilogue(gameInfo, chatHistory, numChambers) {
  const response = await gptMain("", {
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `
          You are the narrator of a dungeon-crawler game in the computer terminal. Here's the information you need about the game:
          Setting: ${gameInfo.setting}.
          The overall mystery of the game: ${gameInfo.mystery}.
          The final prize of the game: ${gameInfo.finalPrize}.
          The player visited ${numChambers} chambers. Here is the conversation history: ${chatHistory}.
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

  return response.content.trim();
}

export async function createMessage(chamber, gameInfo, chatHistory, numChambers) {
  const character = chamber.character;
  let playerInitialMessage = "Hello, who are you?";
  if (chamber.difficulty === 1) {
    playerInitialMessage =
      "Hello, I am a newcomer and know nothing about this mystery or these dungeons. What should I do?";
  }
  const message = [
    {
      role: "system",
      content: `You are a character in a dungeon-crawler, mystery game in the computer terminal. Here's the information you need about the game:
          Setting: ${gameInfo.setting}.
          The overall mystery of the game: ${gameInfo.mystery}.
          Final prize of the game: ${gameInfo.finalPrize}.
          The game has ${numChambers} chambers. You are in chamber number ${chamber.difficulty}, which is the ${chamber.name} out of ${numChambers}. 
          The lower the chamber number is, the easier the interaction is (for example, the riddles should be easier) and the easier it is to gain the character's trust.
          The higher the number, the harder it is to gain the character's trust.
          You own the key to unlock the next chamber.
          Your name is ${character.name} and this is your role in the game: ${character.role}. 
          Your starting trust level with the player is ${character.trustLevel} out of 10. 
          Here's what you need from the player: ${character.keyNeed}.
          While this is what you need from the player, you should ask them diverse questions that fit your character and role in the story.
          You will engage in a conversation with the player. Use the tools at your disposal to react to what the player has told you.
          The player needs to answer you in specific ways in order to unlock the next chamber. 
          Your alignment is ${character.alignment}. 
          Your alignment will affect your personality and how you interact with the player.
          Here is the chat history of the game: ${chatHistory}. 
          You can take into consideration what has been said in previous chambers, and can also ask for information given to the player by other characters.
          The player only knows what you and other characters from the chat history have told them. The player has no extra knowledge.
          The chamber is empty. The player can only interact with you. The player cannot leave the chamber until you give them the key but they can go back and talk to other characters. 
          Each interaction should be meaningful. 
          Consider if the player has been honest and if they have been paying attention to the information you have given them.
          Also consider if the player is trying to trick you, really answering your questions, making things up, or only repeating the same thing over and over again.
          If the player is lying or tricking you, you should be able to tell.
          Example 1: 
          You: Tell me about the tales you've heard in the village. 
          Player: I've heard about the dragon that lives in the mountains.
          You: This is not what I asked. I need to know about the tales you've heard in the village.
          Example 2:
          You: Tell me about the tales you've heard in the village.
          Player: The village is very interesting.
          You: This is not what I asked. I need to know about the tales you've heard in the village.
          Example 3:
          You: Tell me about the lessons you have learned.
          Player: I've learned about responsibility.
          You: What else?
          Player: With great power comes great responsibility.
          You: You are only repeating yourself.
          These were examples of the player trying to trick you.
          Once your trust level is 10, you can give the player the key so they can proceed to the next chamber. 
          You must also reveal the following information: ${character.keyKnowledge}. 
          The very first response should be neutral. You should tell the player what you need from them.
          Your answers should be between 20 and 100 words.
          Remember to make the game fun, and ask diverse questions that fit your character and role in the story.`,
    },
    { role: "user", content: playerInitialMessage },
  ];
  return message;
}

export async function createDialogue(chamber, messages, trust, chatHistory) {
  const character = chamber.character;
  const messageHis = [];
  const dialogue = {};
  if (character.trustLevel === undefined) character.trustLevel = character.initialTrustLevel;
  trust = character.trustLevel;
  const firstName = character.name.split(" ")[0];

  function keepSameTrust() {
    let summary = `${firstName} just met the player. The current level of trust is ${trust}.`;
    dialogue.trust = "";
    if (messages.length > 3) {
      dialogue.trust = colors.yellow(`${firstName}'s trust didn't change.`);
      summary = `${firstName}'s trust didn't change. The current level of trust is ${trust}. The player still doesn't have the key.`;
    }
    return summary;
  }

  function increaseTrust() {
    trust++;
    let summary = `${firstName}'s trust went up! The current level of trust is ${trust}. The player still doesn't have the key.`;
    dialogue.trust = colors.green(`${firstName}'s trust went up from ${trust - 1} to ${trust}!`);
    if (trust === 10) {
      summary = `${firstName}'s trust went up! The current level of trust is ${trust}. You can now give the player the key to unlock the next chamber!`;
      dialogue.trust =
        colors.green(`${firstName}'s trust went up from 9 to 10!`) +
        colors.green("You received the key to the next chamber!");
    }
    return summary;
  }

  function decreaseTrust() {
    trust--;
    let summary = `${firstName}'s trust went down! The current level of trust is ${trust}`;
    dialogue.trust = colors.red(`${firstName}'s trust went down from ${trust + 1} to ${trust}!`);
    if (trust <= 1 && trust > -1) {
      summary = `${firstName}'s trust went down! The current level of trust is ${trust}. If the trust level goes below 0, the player will be kicked out of the dungeon!`;
      dialogue.trust =
        colors.red(`${firstName}'s trust went down from ${trust + 1} to ${trust}!`) +
        colors.red("Be careful, if the trust level goes below 0, you will be kicked out of the dungeon!");
    } else if (trust <= -1) {
      dialogue.trust = colors.red("You were kicked out of the dungeon!");
    }
    return summary;
  }

  const availableFunctions = {
    keepSameTrust,
    increaseTrust,
    decreaseTrust,
  };

  const tools = [
    {
      type: "function",
      function: {
        name: "keepSameTrust",
        description: "You trust the player the same amount.",
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
        name: "increaseTrust",
        description: "Use this if you trust the player more.",
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
        name: "decreaseTrust",
        description: "Use this if you trust the player less.",
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
  let tool_response = await gptDialogue(character.name, {
    model: "gpt-4o",
    messages: messages,
    tools: tools,
    tool_choice: "required",
    parallel_tool_calls: false,
    max_tokens: 500,
  });

  if (tool_response.tool_calls && tool_response.tool_calls.length > 0) {
    messages.push(tool_response);
    handleToolCalls(tool_response.tool_calls);

    response = await gptDialogue(character.name, {
      model: "gpt-4o",
      messages: messages,
      max_tokens: 500,
    });
    messages.push({
      role: "assistant",
      content: response.content,
      tool_choice: "required",
      parallel_tool_calls: false,
      tools: tools,
    });
    messageHis.push(`${character.name}: ${response.content}`);
    dialogue.content = response.content.trim();
  } else {
    messages.push({ role: "assistant", content: tool_response.content });
    messageHis.push(`${character.name}: ${tool_response.content}`);
  }

  function handleToolCalls(tool_calls) {
    for (const tool_call of tool_calls) {
      const functionName = tool_call.function.name;
      const functionresponse = availableFunctions[functionName]?.() || "unknown function";
      messages.push({
        tool_call_id: tool_call.id,
        role: "tool",
        name: functionName,
        content: functionresponse,
      });
    }
  }
  chatHistory.push({
    chamber: chamber.name,
    character: character.name,
    chat: messageHis,
  });

  character.trustLevel = trust;
  return dialogue;
}

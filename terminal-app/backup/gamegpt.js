import { promptGPT, initOpenAI, gpt } from "../../shared/openai.ts";
import { ask, say } from "../../shared/cli.ts";

const gameInfo = await createGame();

const chatHistory = [];

const rooms = gameInfo.parsed.rooms;

for (const room of rooms) {
  say(
    `You have entered the ${room.name} and encountered ${room.character.name}!`
  );
  await talkToCharacter(room);
}

// say(
//   `You have entered the next room and encountered ${rooms[1].character.name}!`
// );
// await talkToCharacter(rooms[1]);

// say(rooms[0].name);
// say(rooms[0].character.name);

// say(gameInfo.parsed);

async function talkToCharacter(room) {
  console.log(chatHistory);
  const character = room.character;
  const messageHis = [];
  let trust = character.trust_level;

  function beNeutral() {
    let summary = `The character's trust didn't change. The current level of trust is ${trust}`;
    return summary;
  }

  function bePositive() {
    trust++;
    let summary = `The character's trust went up! The current level of trust is ${trust}`;
    return summary;
  }

  function beNegative() {
    trust--;
    let summary = `The character's trust went down! The current level of trust is ${trust}`;
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
    // {
    //     type: "function",
    //     function: {
    //         name: "openDoor",
    //         description: "Use this when to open the door to the next chamber"
    //     }
    // }
  ];

  const messages = [
    {
      role: "system",
      content: `You are a character in a dungeon-crawler, mystery game in the computer terminal. Here's the information you need about the game:
      Setting: ${gameInfo.parsed.setting}.
      The overall mystery of the game: ${gameInfo.parsed.mystery}.
      Final prize of the game: ${gameInfo.parsed.final_prize}.
      The game has 5 chambers. You are in chamber number ${room.difficulty}, which is the ${room.name}. So you are the ${room.difficulty} the player encountered.
      The lower the chamber number is, the easier the interaction is (for example, the riddles should be easier) and the easier it is to gain the character's trust.
      You own the key to unlock the next chamber.
      Your name is ${character.name} and this is your role in the game: ${character.role}. Your alignment is ${character.alignment} 
      and your starting trust level with the player is ${character.trust_level} out of 10. Your key interaction with the player is ${character.key_interaction}.
      You will engage in a conversation with the player. Use the tools at your disposal to react to what the player has told you.
    The player needs to answer you in specific ways in order to unlock the next room. 
      Here is the chat history of the game: ${chatHistory}. You can take into consideration what has been said in previous rooms, and can also ask for information given to the player by other characters.
     The player only knows what you and other characters have told them.
      The room is empty. The player can only interact with you. The player cannot leave the room until you give them the key. Each interaction should be meaningul.
      Once your trust level is 10, you can give the character the key so they can proceed to the next chamber.
      The very first response should be neutral. You should tell the player what you need from them.
      Your answers should be between 20 and 150 words.`,
    },
    { role: "user", content: "Hello, who are you?" },
  ];

  let playerResponse = "";

  while (trust < 10) {
    let response = await gpt({
      model: "gpt-4o",
      messages: messages,
      tools: tools,
      tool_choice: "required",
      max_tokens: 500,
    });

    if (response.tool_calls && response.tool_calls.length > 0) {
      messages.push(response);
      handleToolCalls(response.tool_calls);

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
      messages.push({ role: "assistant", content: response.content });
      messageHis.push(`${character.name}: ${response.content}`);
    }

    say(response.content);

    playerResponse = await ask();

    messages.push({ role: "user", content: playerResponse });
    messageHis.push(`Player: ${playerResponse}`);
  }

  function handleToolCalls(tool_calls) {
    for (const tool_call of tool_calls) {
      const functionName = tool_call.function.name;
      const functionresponse =
        availableFunctions[functionName]?.() || "unknown function";
      say(`${functionName}()`);
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
    character: character.name,
    chat: messageHis,
  });
}

async function createGame() {
  const result = await gpt({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: `You are a game developer especialized in creating dungeon crawler RPGs in the computer terminal.
          The user will give you some parameters of what they want their game to look like.
          It is your job to build the structure of the game for them.`,
      },
      {
        role: "user",
        content: `I am creating a dungeon crawler RPG game in my computer terminal. 
          The game is going to be a mystery game and dialogue-based. 
          The player will enter a room that has a character and it's the player's job to interact with the character and find out about the game's mystery. 
          The player needs to answer the character in a specific way so they can give the player a key to unlock the door to the next room.
        The rooms are empty. The player can only interact with the character. The player cannot leave the room until they receive a key. Each interaction should be meaningul.
          The dungeon has 5 total rooms. When the player unlocks the 5th room, they will encounter the final prize and win the game.
          Please tell me what the overall setting of the game is, what the mystery is, and what the final prize is.
          Also for each room, tell me what character the player will encounter, what part of the mystery they will unveil to the player, and what they need from the player to give them the key.
          The characters know each other and will take into consideration what has been said in previous rooms, and will also ask for information given to the player by other characters.
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
            final_prize: {
              type: "string",
              description: "what the final prize of the game is",
            },
            rooms: {
              type: "array",
              description: "The details for each of the 5 rooms",
              items: {
                type: "object",
                description: "the details of the each room",
                properties: {
                  name: {
                    type: "string",
                    description: "the name of the room",
                  },
                  difficulty: {
                    type: "number",
                    description:
                      "the difficulty level of the room, from 1 to 5",
                  },
                  character: {
                    type: "object",
                    description:
                      "the details about the character the player encounters in the room",
                    properties: {
                      name: {
                        type: "string",
                      },
                      role: {
                        type: "string",
                        description:
                          "the role of the character in the mystery and overall story",
                      },
                      alignment: {
                        type: "string",
                      },
                      trust_level: {
                        type: "number",
                        description:
                          "from 1 to 10, the level of trust the character has with the player. take difficulty into consideration",
                      },
                      key_interaction: {
                        type: "string",
                        description:
                          "what the player needs from the character to unlock the next room",
                      },
                    },
                    required: [
                      "name",
                      "role",
                      "alignment",
                      "trust_level",
                      "key_interaction",
                    ],
                    additionalProperties: false,
                  },
                },
                required: ["name", "difficulty", "character"],
                additionalProperties: false,
              },
            },
          },
          required: ["setting", "mystery", "final_prize", "rooms"],
          additionalProperties: false,
        },
        strict: true,
      },
    },
  });

  await Deno.writeTextFile(
    "info5.json",
    JSON.stringify(result.parsed, null, 2)
  );

  return result;
}

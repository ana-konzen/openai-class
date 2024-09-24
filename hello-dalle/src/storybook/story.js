import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "https://cdn.skypack.dev/pdf-lib@^1.11.1?dts";

import * as fal from "npm:@fal-ai/serverless-client";
import { apiKey } from "../shared/falai.ts";
import { promptGPT } from "../shared/openai.ts";
import { ask, say } from "../shared/cli.ts";

import { LogLevel, setLogLevel } from "../shared/logger.ts";

setLogLevel(LogLevel.Debug);

say("");
say("Hello! I am your story book creator.");
say("You currently have the following stories saved:");
say("");
let jsonFile = JSON.parse(await Deno.readTextFile("stories.json"));
let stories_arr = JSON.parse(await Deno.readTextFile("stories.json")).stories;

if (stories_arr.length === 0) {
  say("You have no stories saved!");
} else {
  for (const story of stories_arr) {
    say(`${story.title} (${story.numPages} pages)`);
  }
}

say(`
    Press 'N' to create a new story.
    Press 'A' to add a page to an existing story.`);

const response = await ask("");

if (response.toLowerCase() === "n") {
  await createStory();
}
if (response.toLowerCase() === "a") {
  say("Which story would you like to edit?");
  for (const story of stories_arr) {
    say(stories_arr.indexOf(story) + ": " + story.title);
  }
  const storyKey = await ask(
    "Please reply with the number corresponding to the story."
  );
  const changes = await ask(
    "Is there anything you would like to add or change about the story?"
  );
  await addToStory(storyKey, changes);
}

say("Done!");

async function createStory() {
  const charName = await ask("What is the name of the main character?");
  const charKind = await ask(
    "Are they animal or human? If they're an animal, what animal are they?"
  );
  const charPersonality = await ask("What is their personality?");
  const setting = await ask("What is the setting of the story?");
  const considerations = await ask(
    "Is there anything else you would like the AI to consider when creating the story?"
  );
  const style = await ask(
    "What art style would you like your illustrations to be?"
  );

  const paragraphPrompt = await promptGPT(
    `I am writing a children story book about a ${charPersonality} ${charKind} named ${charName}. 
    The story is set in ${setting}. 
    Keep in mind the following consideration(s): ${considerations}.
    Write a 100-word paragraph to begin the story. Please reply only with the paragraph.`,
    { temperature: 1, max_tokens: 500 }
  );

  const storyTitle = await promptGPT(
    `I am writing a children story book. Here's my first paragraph: ${paragraphPrompt}. Please give me a short, 3-4 word title. Reply with only the title`,
    { temperature: 0.8 }
  );

  const coverPrompt = await promptGPT(
    `I am writing a children story book. The title is ${storyTitle} and this what I have written so far: ${paragraphPrompt}.
        Please write a prompt for an image generator to create the cover art for my book. The style of the art should be ${style}.
        Please only reply with the prompt.`,
    { temperature: 0.8, max_tokens: 500 }
  );

  const imagePrompt = await promptGPT(
    `I am writing a children story book. The title is ${storyTitle}. 
    I previously prompted the generator to create a cover art for the book. This was the prompt: ${coverPrompt}.
    Please write a prompt for an image generator to create an illustration based on this paragraph: ${paragraphPrompt}. 
    Please keep the previous prompt in mind to maintain a consistent style. 
    Please only reply with the prompt.`,
    { temperature: 0.8, max_tokens: 500 }
  );

  const illustration = await createImage(imagePrompt);
  const coverArt = await createImage(coverPrompt);

  const newPDF = await createPDF(storyTitle);
  await createCover(newPDF, storyTitle, coverArt);
  await createPage(newPDF, paragraphPrompt, illustration);
  await savePDF(newPDF, storyTitle);
  await saveJSON(storyTitle, paragraphPrompt, coverPrompt + imagePrompt);
  await saveImage(coverArt, storyTitle, "cover");
  await saveImage(illustration, storyTitle, 1);
}

async function addToStory(index, changes) {
  const story = stories_arr[parseInt(index)];
  const paragraphPrompt = await promptGPT(
    `I am writing a children story book. Here's what I have so far: ${story.text}. Please continue the story with a 100-word paragraph. 
    Please reply with only the paragraph. No need to say the page number.
    Keep the following changes in mind (there may be no changes): ${changes}`,
    { temperature: 0.8, max_tokens: 500 }
  );

  const imagePrompt = await promptGPT(
    `I am writing a children story book. 
            Here's what I have so far: ${story.text}. Please keep this context in mind.
            I have previously prompted the generator to create more illustrations for the book. Those were my prompts: ${story.prompts}.
            Please keep those prompts in mind to maintain a consistency in style.
            Please write a prompt for an image generator to create an illustration based on this paragraph: ${paragraphPrompt}. 
            Keep the style as consistent as possible.
            Please only reply with the prompt.`,
    { temperature: 0.8, max_tokens: 500 }
  );

  const illustration = await createImage(imagePrompt);

  const pdfFile = await fetchPDF(story.title);
  await saveImage(illustration, story.title, parseInt(story.numPages) + 1);
  await createPage(pdfFile, paragraphPrompt, illustration);
  await savePDF(pdfFile, story.title);
  await saveJSON(story.title, paragraphPrompt, imagePrompt, parseInt(index));
}

async function createImage(imagePrompt) {
  fal.config({
    credentials: apiKey,
  });

  const result = await fal.subscribe("fal-ai/flux", {
    input: {
      prompt: imagePrompt,
      //   "image_size": "square_hd",
      //   num_inference_steps: "4", //low quality
      num_images: 1,
      // enable_safety_checker: true,
      // seed: 1337,
    },
  });
  return result.images[0].url;
}

async function createPage(pdfDoc, storyText, pngUrl) {
  const page = pdfDoc.addPage();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 14;

  const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());

  const pngImage = await pdfDoc.embedPng(pngImageBytes);

  const pngDims = pngImage.scale(0.5);

  //draw background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
    color: getRgb(247, 246, 240),
  });

  page.drawImage(pngImage, {
    x: page.getWidth() / 2 - pngDims.width / 2,
    y: page.getHeight() / 2 - pngDims.height + 50,
    width: pngDims.width,
    height: pngDims.height,
  });

  page.drawText(storyText, {
    x: 50,
    y: page.getHeight() - 5 * fontSize,
    size: fontSize,
    font: timesRomanFont,
    maxWidth: page.getWidth() - 250,
  });
}

async function createCover(pdfDoc, storyTitle, pngUrl) {
  const page = pdfDoc.addPage();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const fontSize = 28;

  const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());

  const pngImage = await pdfDoc.embedPng(pngImageBytes);

  const pngDims = pngImage.scale(0.5);

  //draw background
  page.drawRectangle({
    x: 0,
    y: 0,
    width: page.getWidth(),
    height: page.getHeight(),
    color: getRgb(247, 246, 240),
  });

  page.drawImage(pngImage, {
    x: page.getWidth() / 2 - pngDims.width / 2,
    y: page.getHeight() / 2 - pngDims.height + 200,
    width: pngDims.width,
    height: pngDims.height,
  });

  const textWidth = font.widthOfTextAtSize(storyTitle, fontSize);

  page.drawText(storyTitle, {
    x: page.getWidth() / 2 - textWidth / 2,
    y: page.getHeight() - 6 * fontSize,
    size: fontSize,
    font: font,
  });
}

async function createPDF(storyTitle) {
  await Deno.mkdir(`stories/${storyTitle}`, { recursive: true });
  await Deno.mkdir(`stories/${storyTitle}/images`, { recursive: true });

  return await PDFDocument.create();
}

async function saveJSON(
  storyTitle,
  storyText,
  imagePrompt,
  index = stories_arr.length
) {
  let numPages;
  let textData;
  let promptData;
  if (stories_arr[index] === undefined) {
    numPages = 1;
    textData = `Page ${numPages}: ${storyText}`;
    promptData = `Page ${numPages}: ${imagePrompt}`;
  } else {
    numPages = stories_arr[index].numPages + 1;
    textData = `${stories_arr[index].text} Page ${numPages}: ${storyText}`;
    promptData = `${stories_arr[index].prompts} Page ${numPages}: ${imagePrompt}`;
  }
  stories_arr[index] = {
    title: storyTitle,
    text: textData,
    numPages: numPages,
    prompts: promptData,
  };
  jsonFile.stories = stories_arr;
  try {
    await Deno.writeTextFile("stories.json", JSON.stringify(jsonFile));
  } catch (e) {
    console.log(e);
  }
}

async function saveImage(pngUrl, storyTitle, pageNum) {
  const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer());
  await Deno.writeFile(
    `./stories/${storyTitle}/images/image${pageNum}.png`,
    new Uint8Array(pngImageBytes)
  );
}

async function fetchPDF(storyTitle) {
  // const url = `stories/${storyTitle}/story.pdf`;
  const existingPdfBytes = await Deno.readFile(
    `stories/${storyTitle}/story.pdf`
  );

  return await PDFDocument.load(existingPdfBytes);
}

async function savePDF(pdfDoc, storyTitle) {
  const pdfBytes = await pdfDoc.save();
  await Deno.writeFile(`stories/${storyTitle}/story.pdf`, pdfBytes);
}

//credit: https://stackoverflow.com/questions/10756313/javascript-jquery-map-a-range-of-numbers-to-another-range-of-numbers
function getRgb(r, g, b) {
  const red = ((r - 0) * (1 - 0)) / (255 - 0) + 0;
  const green = ((g - 0) * (1 - 0)) / (255 - 0) + 0;
  const blue = ((b - 0) * (1 - 0)) / (255 - 0) + 0;
  return rgb(red, green, blue);
}

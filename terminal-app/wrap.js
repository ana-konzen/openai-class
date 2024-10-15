import { keypress } from "https://deno.land/x/cliffy@v0.25.7/keypress/mod.ts";

const encoder = new TextEncoder();

// Set the word limit for wrapping
const WORD_WRAP_LIMIT = 5;

// Function to wrap text dynamically after a certain number of words
function wrapText(text, maxWords) {
  const words = text.split(/\s+/); // Split the text by spaces
  let output = "";
  let currentLine = [];

  words.forEach((word) => {
    currentLine.push(word);
    if (currentLine.length >= maxWords) {
      output += currentLine.join(" ") + "\n"; // Join words and add a line break
      currentLine = []; // Reset the current line
    }
  });

  // Add remaining words to the output if there are any
  if (currentLine.length > 0) {
    output += currentLine.join(" ");
  }

  return output;
}

async function dynamicInput() {
  let inputBuffer = ""; // Buffer for storing user input
  console.clear(); // Clear the screen initially
  console.log("Start typing your input (wrapped after 20 words):");

  // Capture keypresses in real time
  for await (const key of keypress()) {
    const char = key.sequence;

    // Handle Ctrl+C to exit the process
    if (key.ctrlKey && key.name === "c") {
      console.log("\nProcess interrupted.");
      Deno.exit();
    }

    // Handle Enter key to finish input
    if (key.name === "return") {
      break; // Exit the loop when Enter is pressed
    }

    // Handle Backspace key (remove last character)
    if (char === "\x7f") {
      // Backspace character (ASCII code)
      if (inputBuffer.length > 0) {
        inputBuffer = inputBuffer.slice(0, -1); // Remove the last character
      }
    } else if (!key.ctrlKey && char) {
      inputBuffer += char; // Append character to the buffer
    }

    // Clear the entire screen below the cursor and reset cursor position
    await Deno.stdout.write(encoder.encode("\x1b[0J\x1b[H"));

    // Wrap the input text dynamically every 20 words
    const wrappedText = wrapText(inputBuffer, WORD_WRAP_LIMIT);

    // Move cursor back to the starting position
    await Deno.stdout.write(encoder.encode("\x1b[H"));

    // Print the dynamically wrapped text
    await Deno.stdout.write(encoder.encode(wrappedText));

    // Calculate where the cursor should be placed based on the wrapped text
    const lines = wrappedText.split("\n");
    const lastLine = lines[lines.length - 1];
    const cursorRow = lines.length; // Number of rows based on wrapped lines
    const cursorCol = lastLine.length + 1; // Position cursor at the end of the last line
    await Deno.stdout.write(encoder.encode(`\x1b[${cursorRow};${cursorCol}H`)); // Position cursor
  }

  return inputBuffer;
}

async function main() {
  const userInput = await dynamicInput();
  console.log("\nFinal wrapped input:");
  console.log(userInput);
}

main();

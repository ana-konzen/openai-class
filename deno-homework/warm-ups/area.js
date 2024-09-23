console.log("Hello! I'm a program that calculates the area of a rectangle given its length and width.");
const rectStr = prompt("To start, please give the length and width of your rectangle.");

const regex = /[\d|,|.|\+]+/g;

const rectDims = rectStr.match(regex);

console.log(`The area of your rectangle is ${rectDims[0] * rectDims[1]}.`);
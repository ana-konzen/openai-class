console.log("Hello, I'm a program that checks if a number is even or odd.");
let number = Number(prompt("Please give me a number."));

if(!(Number.isInteger(number))){
    console.log(`${number} is not an integer. Please try again.`)
}
else if(number % 2 === 0){
    console.log(`${number} is an even number!`)
} else {
    console.log(`${number} is an odd number!`)
}
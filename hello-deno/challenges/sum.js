let number = Number(prompt("Tell me a whole number"));
let sum = 0;

for (let i = 0; i <= number; i ++){
    sum += i;
}

if(Number.isInteger(number)){
    console.log(`The sum of all numbers from 1 to ${number} is ${sum}!`);
} else {
    console.log(`${number} is not a whole number. Please try again.`);
}
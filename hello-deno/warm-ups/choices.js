//I asked GPT to generate me 3 multiple-choice questions about JavaScript

let wrongAns = 0;
let rightAns = 0;

console.log("Hello! I will give you three multiple-choice questions about JavaScript.\n")
console.log("Ready? Here's the first question!\n")
console.log(`What is the correct syntax to create a new function in JavaScript?
    A) function = myFunction()
    B) function myFunction() { }
    C) function: myFunction { }
    D) create function myFunction()\n`)
let response1 = prompt("Which one is the correct answer?")


while(checkIfValid(response1)){
    response1 = prompt("Which one is the correct answer?") 
}

checkIfRight(response1, "b");

console.log("Now let's move on to the second question. \n")
console.log(`Which of the following methods is used to remove the last element from an array in JavaScript?
    A) array.pop()
    B) array.push()
    C) array.shift()
    D) array.splice()\n`)
let response2 = prompt("Which one is the correct answer?");

while(checkIfValid(response2)){
    response2 = prompt("Which one is the correct answer?") 
}

checkIfRight(response2, "a");

console.log("...And here's the final question! \n")
console.log(`How do you write a comment in JavaScript?
    A) <!-- This is a comment -->
    B) # This is a comment
    C) // This is a comment
    D) /* This is a comment */\n`)
let response3 = prompt("Which one is the correct answer?");


while(checkIfValid(response3)){
    response3 = prompt("Which one is the correct answer?") 
}

checkIfRight(response3, "c");

console.log(`That's the end of our game. You got ${rightAns} answer(s) right and ${wrongAns} answer(s) wrong. Congrats!`)


function checkIfValid(resp){
    while(resp.toLowerCase() !== 'a' 
    && resp.toLowerCase() !== 'b' 
    && resp.toLowerCase() !== 'c' 
    && resp.toLowerCase() !== 'd' 
    ){
    console.log('Please reply only with the letter corresponding to your answer.')
    return true
    }
}

function checkIfRight(resp, letter){
    if(resp.toLowerCase() === letter){
        console.log(`\nAnswer ${resp.toUpperCase()} is right! Congrats :)\n`);
        rightAns++;
    } else {
        console.log(`\nAnswer ${resp.toUpperCase()} is wrong :( \n`);
        wrongAns++;
    }
}


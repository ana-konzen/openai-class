//tried to challenge myself and looked through Mozilla to find ways to make this secure w/ crypto
//was a little overwhelmed haha so used a simple method

const minLength = 7;
const maxLength = 30;

let response = prompt(`How long would you like your password to be? Your password must be between ${minLength} and ${maxLength} characters.`)

let password = "";

let pLength = Number(response);

while (isNaN(pLength) || pLength <= minLength || pLength >= maxLength){
    response = prompt(`Please only reply with a number between ${minLength} and ${maxLength}.`);
    pLength = Number(response);
} 

let arr = new Uint8Array(pLength); 

getNumbers(arr);


//letters: 65 - 90 upper and 97 - 122 lower
// numbers: 48 - 57
// special: 33 - 47 and 58 - 64 and 91 - 96 and 123 - 126

// i made it so the password must contain an upper- and lower-case letter, and a number

while(checkValues(arr, 48, 57) // check for numbers
    || checkValues(arr, 65, 90) // check for uppercase
    || checkValues(arr, 97, 122) // check for lower case
    ){
    getNumbers(arr);
}

for (let c of arr){
    password += String.fromCharCode(c);
}

console.log(`Here's your random password: ${password}`);


function getNumbers(arr) {
    self.crypto.getRandomValues(arr);
    for (let i = 0; i < arr.length; i ++){
        let num = arr[i] % (127 - 33) + 33; // I'm sure there's an easier way to do this but this works for now
        arr[i] = num;
    }
}

function checkValues(arr, min, max) {
    for(let i = 0; i < arr.length; i ++){
        if(arr[i] >= min && arr[i] <= max){
            return false;
        } 
    }
    return true;
}


let ogResponse = prompt("Tell me a word or phrase.");

let response = ogResponse.replace(/\s/g, '');

let arr = response.split("");

let halfLen = Math.floor(arr.length/2);

if(arr.length % 2 !== 0){
    arr.splice(halfLen, 1);
} 

const half1 = arr.slice(0, halfLen);
const half2 = arr.slice(halfLen, arr.length).reverse();



if(checkValues(half1, half2)){
    console.log(`\n"${ogResponse}" is a palindrome!\n`);
} else {
    console.log(`\n"${ogResponse}" is not a palindrome!\n`);
}


function checkValues(half1, half2){
    for(let i = 0; i < halfLen; i ++){
        if(half1[i] !== half2[i]){
            return false;
        } 
    }
    return true;
}
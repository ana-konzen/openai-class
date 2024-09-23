const names = prompt("Hello! What is your first and last name?");

const nameArr = names.split(' ');

console.log(nameArr[Math.floor(Math.random()*nameArr.length)]);
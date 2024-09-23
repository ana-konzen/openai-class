console.log("Hello! This is a USD to Brazilian Reais converter");

const currencyStr = prompt("How many dollars would you like to convert?");

const regex = /[\d|,|.|\+]+/g; //looked up on stack overflow how to find numbers in strings

const currency = currencyStr.match(regex);

for (let c of currency){
    let result = Number(c) * 5.64;
    console.log(`${Number(c)} USD is equivalent to ${result.toFixed(2)} Brazilian Reais`);
}
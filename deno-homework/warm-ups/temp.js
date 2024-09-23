console.log("Hello! I analyze temperatures. I can tell if it's cold, warm, or hot outside based on the temperature you give me.");
let tempUnit = prompt("Say 'C' to use Celsius or 'F' to use Fahrenheit.");
const regex = /[\d|.|\+]+/g;

while(tempUnit.toLowerCase() !== "c" && tempUnit.toLowerCase() !== "f"){
    console.log("Whoops! Looks like you pressed another key. Let's try that again.")
    tempUnit = prompt("Say 'C' to use Celsius or 'F' to use Fahrenheit.");
}

if(tempUnit.toLowerCase() === "c"){
    let temperatureStr = prompt("Great! Give me a temperature in Celsius.");
    let temperature = Number(temperatureStr.match(regex)[0]);
    checkTemperature(temperature);
}
else if(tempUnit.toLowerCase() === "f"){
    let temperatureStr = prompt("Great! Give me a temperature in Fahrenheit.");
    let faren = Number(temperatureStr.match(regex)[0]);
    let temperature = (faren - 32) / 1.8;
    checkTemperature(temperature);
} 

function checkTemperature(temperature){
    if (temperature >= 45){
        console.log("Wow! That's really really hot. In fact, I'm pretty sure you shouldn't be alive right now.")
    }
    else if (temperature >= 32 && temperature < 45){
        console.log("Wow! It's boiling outside! Drink lots of water")
    }
    else if (temperature > 25 && temperature < 32){
        console.log("Looks like it's pretty hot outside!");
    } 
    else if(temperature > 18 && temperature <= 25){
        console.log("Looks like it's pretty warm outside!");
    }
    else if(temperature > 10 && temperature <= 18){
        console.log("That's chilly!");
    }
    else if(temperature < 10 && temperature > 0){
        console.log("That's pretty cold!");
    }   
    else if(temperature <= 0){
        console.log("Brrr! It's freezing outside!");
    } 
}
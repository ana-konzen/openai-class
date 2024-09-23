console.log("I kidnapped Mondrian and now he's imprisoned in the terminal, tasked with creating mediocre ASCII art for all eternity.\n")

let userH = Number(prompt("How tall would you like your painting to be? Minimum is 3, please give a whole number."));
while (!Number.isInteger(userH) || userH <= 3){
    userH = Number(prompt(`Please only reply with a whole number bigger than 3.`));
} 

let userW = Number(prompt("How wide would you like your painting to be? Minimum is 3."));
while (!Number.isInteger(userW) || userW <= 3){
    userW = Number(prompt(`Please only reply with a whole number bigger than 3.`));
} 

const artW = userW + 1;
const artH = userH;

let art_arr = buildFrame(artW, artH);

let nSquares = randomNumber(2, Math.min(artW/2, artH/2));

for (let i = 0; i <= nSquares; i++){
    let rows = [];
    let columns = [];
    getDims(rows, artW);
    getDims(columns, artH);
    buildSquare(columns, rows, art_arr);

}

let art = "";

for (let arr of art_arr){
for(let i = 0; i < arr.length; i++){
    let sub_arr = arr[i];
    for(let j = 0; j < sub_arr.length; j++){
        art += arr[i][j];
    }
}
}

console.log("\nHere's what Mondrian made for you:")
console.log(art + "\n");

function buildArray(width, height){
    let arr = [];
    for(let i = 0; i < height; i++){
        arr.push([]);
        for(let j = 0; j < width; j++){
            // arr[i] = [];
        }
    }
    return arr
}


function buildFrame(width, height){
    let arr = [];
    for(let i = 0; i < height; i++){
        arr.push([]);
        for(let j = 0; j < width; j++){
            if(i===0){
                arr[0][j] = "‾‾";
                arr[0][0] = "\n|‾";
                arr[0][width - 1] = "‾|";
            } 
            else if (i === height - 1){
                arr[height - 1][j] = "__";
                arr[height - 1][0]="\n|_";
                arr[height - 1][width-1] = "_|";
            } 
            else {
                arr[i][j] = "  ";
                arr[i][0] = "\n| ";
                if(j === width - 1){
                    arr[i][j] = " |";
                }
            }
        }
    }
    return arr;
}

//I was trying to use array.slice() so I wouldn't have to create another huge function but couldn't make it work
function buildSquare(columns, rows, art_arr){
    for (let i = columns[0]; i <= columns[1]; i++){
        for(let j = rows[0]; j <= rows[1]; j++){
            if(i === columns[0]){
                if(j === rows[0]){
                    if(j === 0){
                        art_arr[i][j] = "\n|‾";
                    } 
                    else {
                        art_arr[i][j] = "|‾";
                    }
                } 
                else if (j === rows[1]){
                    art_arr[i][j] = "‾|";
                }
                else {
                    art_arr[i][j] = "‾‾";
                }
            }
            else if(i === columns[1]){
                if(j === rows[0]){
                    if(j === 0){
                        art_arr[i][j] = "\n|_";
                    } 
                    else {
                        art_arr[i][j] = "|_";
                    }
                } 
                else if (j === rows[1]){
                    art_arr[i][j] = "_|";
                }
                else {
                    art_arr[i][j] = "__";
                }
            }
            else {
                if(j === rows[0]){
                    if(j === 0){
                        art_arr[i][j] = "\n| ";
                    } 
                    else {
                        art_arr[i][j] = "| ";
                    }
                } 
                else if (j === rows[1]){
                    art_arr[i][j] = " |";
                }
                else {
                    art_arr[i][j] = "  ";
                }
            } 
        }
    }
}

function getDims(arr, param){
    let index = randomNumber(0, param - 5);
    arr.push(index);
    let index2 = randomNumber(index + 2, param - 1);
    arr.push(index2);
    return arr
}


function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

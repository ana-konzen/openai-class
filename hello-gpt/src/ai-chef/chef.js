/**
 * This program uses the LLM to generate recipes and a shopping list based on what the user 
 * has on their pantry (pantry.txt)
 */

import { ask, say } from "../shared/cli.ts";
import { promptGPT } from "../shared/openai.ts";

let pantry = await Deno.readTextFile("pantry.txt");
let shopList = await Deno.readTextFile("shopping-list.txt");


let option = prompt(`
    \nHello! I am your AI chef. I will give you a recipe based on the items in your pantry.
    \nPress 'P' to manage your pantry.
    \nPress 'S' to manage your shopping list.
    \nPress 'G' to generate a new shopping list.
    \nPress 'R' to get a recipe.`)

while(option.toLowerCase() === "p" 
      || option.toLowerCase() === "s"
      || option.toLowerCase() === "g"){
    if(option.toLowerCase() === "p"){
        await createMenu('pantry', 'pantry.txt');
    }
    if(option.toLowerCase() === "s"){
        await createMenu('shopping list', 'shopping-list.txt');
    }
    if(option.toLowerCase() === "g"){
        await createShopList();
        await createMenu('shopping list', 'shopping-list.txt');
    }
    option = prompt(`
        \nPress 'P' to manage your pantry.
        \nPress 'S' to manage your shopping list.
        \nPress 'G' to generate a new shopping list.
        \nPress 'R' to get a recipe.`);
}

if(option.toLowerCase() === "r"){
    say("")
    getRecipe();
}

async function getRecipe(){
    const listType = await ask(`Would you like your recipe to consider your shopping list? Answer 'Y' for yes and 'N' for no`);
    let ingredients;
    if(listType.toLowerCase() === 'n'){
        ingredients = pantry;
    } else {
        ingredients = pantry + shopList;
    }

    let mealType = await ask("Would you like to get a recipe for dinner, breakfast, dessert, or lunch?");
    const recipe = await promptGPT(
        `You are a personal chef.
        I have some specifcs items in my pantry right now. 
        Can you give me a recipe of something to cook for ${mealType} using only these items? 
        Please consider whether ${mealType} asks for a sweet or savory dish.
        Only give me the recipe for one dish.
        You don't have to use every single item, but do not list ingredients I don't have in my pantry.
        If you don't know any recipes that only use the items in my pantry, suggest I do some shopping first.
        Here are the items in my pantry: ${ingredients}`, 
        {max_tokens: 1000, temperature: 0.8}
    )
    say(recipe);

    const recipeTitle = await promptGPT(
        `I will give you a recipe. Please give me a 2-3 word title for this recipe.
         The title needs to be all lower case, with no spaces. 
         You can use hiphens(-) instead of spaces. For example: "chicken-fried-rice".
         Here's the recipe: ${recipe}`, {max_tokens: 64, temperature: 0.3}
    )
    await Deno.writeTextFile(`recipe-book/${recipeTitle}.txt`, recipe);
}

async function createShopList(){
    const list = await promptGPT(
        `You are a personal chef.
        I have some specifcs items in my pantry right now. 
        Give me a shopping list of items I could add to my pantry.
        Only list the items I should buy, separated by a comma.
        Here are the items in my pantry:
        ${pantry}`, 
        {temperature: 0.5, max_tokens: 1000}
    )
    await Deno.writeTextFile(`shopping-list.txt`, list.replace(/, ?/g, "\n"));
    say("\nYour shopping list was updated!")
}

async function createMenu(type, file){
    let text = await Deno.readTextFile(file);

    let sub_option = prompt(`
        \nPress 'V' to view the items in your ${type}.
        \nPress 'A' to add items to your ${type}.
        \nPress 'B' to go back.`)
    while(sub_option.toLowerCase() === 'v' || sub_option.toLowerCase() === 'a' || sub_option.toLowerCase() === 'b'){
        if(sub_option.toLowerCase() === 'v'){
            say(`
                \nThe current items in your ${type} are: 
                \n${text}\n
                `);
            sub_option = prompt(`
                \nPress 'A' to add items to your ${type}.
                \nPress 'B' to go back.`)
            continue
        }
        if(sub_option.toLowerCase() === 'a'){
            const newItem = "\n" + await ask("What would you like to add? Separate multiple items by a comma");
            text += newItem.replace(/, ?/g, "\n");
            await Deno.writeTextFile(file, text);
            say(`Thank you! We added your item(s)`);
            
            sub_option = prompt(`
                \nPress 'V' to view the items in your ${type}.
                \nPress 'B' to go back.`);
            continue
        }
        if(sub_option.toLowerCase() === 'b'){
        break
        }
    }

}
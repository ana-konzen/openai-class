import { keypress } from "https://deno.land/x/cliffy@v1.0.0-rc.4/keypress/mod.ts";
import { tty } from "https://deno.land/x/cliffy@v1.0.0-rc.4/ansi/tty.ts";

const myTty = tty({
  writer: Deno.stdout,
  reader: Deno.stdin,
});

let x = 0;

for await (const event of keypress()) {
  if (event.key === "right") {
    x++;
    myTty.cursorForward(x);
    console.log("hey");
  }

  if (event.key !== "k") {
    console.log(event.key);
  }

  if (event.ctrlKey && event.key === "c") {
    console.log("exit");
    break;
  }
}

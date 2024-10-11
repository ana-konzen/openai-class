import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import { randomInt } from "./util.js";
import { placeAt } from "./ansi.js";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";

export class Chamber {
  constructor(w, h, x = 0, y = 0) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.npcX = randomInt(this.x + 2, this.x + this.w - 5);
    this.npcY = randomInt(this.y + 2, this.y + this.h - 4);
    this.exitX = this.x + this.w;
    this.exitY = randomInt(this.y + 2, this.y + this.h - 4);

    this.entrance = false;
    this.entranceY = 0;
    this.entranceX = this.x;
    this.color = "white";
    this.doorColor = 0xffffff;
    this.npcColor = 0xffffff;
  }
  create() {
    placeAt(0, 0);
    console.log(
      boxen("", {
        width: this.w,
        height: this.h,
        margin: { left: this.x, top: this.y },
        borderStyle: "classic",
        borderColor: this.color,
      })
    );
    placeAt(this.npcX, this.npcY);
    console.log(colors.cyan("&"));
    placeAt(this.exitX, this.exitY);
    console.log(colors.rgb24("%", this.doorColor));
    if (this.entrance) {
      placeAt(this.entranceX, this.entranceY);
      console.log(colors.rgb24("%", this.doorColor));
    }

    placeAt(0, 0);
  }
}

export function createChambers(numChambers) {
  const chambers = [];
  let offset = 0;
  for (let i = 0; i < numChambers; i++) {
    let w = randomInt(6, 15) * 2;
    let newChamber = new Chamber(w, randomInt(10, 12), i + offset, randomInt(5, 8));
    chambers.push(newChamber);
    if (i > 0) {
      newChamber.entrance = true;
      newChamber.entranceY = chambers[i - 1].exitY;
    }
    offset += w;
  }
  return chambers;
}

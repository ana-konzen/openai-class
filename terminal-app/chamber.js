import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import { randomInt } from "./util.js";
import { placeAt } from "./ansi.js";

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
  }
  create() {
    placeAt(0, 0);
    console.log(
      boxen("", {
        width: this.w,
        height: this.h,
        margin: { left: this.x, top: this.y },
        borderStyle: "classic",
      })
    );
    placeAt(this.npcX, this.npcY);
    console.log("&");
    placeAt(this.exitX, this.exitY);
    console.log("%");
    if (this.entrance) {
      placeAt(this.entranceX, this.entranceY);
      console.log("%");
    }

    placeAt(0, 0);
  }
}

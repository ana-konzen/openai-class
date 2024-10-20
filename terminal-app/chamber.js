import boxen from "npm:boxen@7.1.1"; //library for terminal boxes
import { randomInt } from "./util.js";
import { cursorTo } from "./ansi.js";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";

// const { columns, rows } = Deno.consoleSize();

export class Chamber {
  constructor(number, title, w, h, npc, x = 0, y = 0) {
    this.number = number;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.npcX = randomInt(this.x + this.w / 2 - 1, this.x + this.w / 2 + 1);
    this.npcY = randomInt(this.y + this.h / 2 - 1, this.y + this.h / 2 + 1);
    // this.npcX = Math.floor(this.x + this.w / 2);
    // this.npcY = Math.floor(this.y + this.h / 2);
    this.exitX = this.x + this.w;
    this.exitY = randomInt(Math.max(this.y + 2, 10), Math.min(this.y + this.h - 2, 14));

    this.hasEntrance = false;
    this.entranceY = 0;
    this.entranceX = this.x + 1;
    this.color = "white";
    this.doorColor = 0xed9755;
    this.npcColor = 0x48d1cc;

    this.exitSymbol = "∏";
    this.entranceSymbol = "├";

    this.closedDoor = "∏";
    this.openDoor = "‾";
    this.unlockedDoor = "▒";
    this.title = title;
    this.steps = 0;

    this.npcSymbol = npc;

    this.locked = true;
    this.messages = [];
  }
  openExit() {
    //door open and closes after timeout
    this.exitSymbol = this.openDoor;
    this.steps = 0;
  }
  openEntrance() {
    //door open and closes after timeout
    this.entranceSymbol = this.openDoor;
    this.steps = 0;
  }
  render() {
    // if (!this.locked) this.exitSymbol = "░";

    if (this.exitSymbol === this.openDoor) {
      this.steps++;
      if (this.steps > 5) {
        this.exitSymbol = this.closedDoor;
      }
    }
    if (this.entranceSymbol === this.openDoor) {
      this.steps++;
      if (this.steps > 5) {
        this.entranceSymbol = this.closedDoor;
      }
    }
    cursorTo(0, 0);
    console.log(
      boxen("", {
        width: this.w,
        height: this.h,
        margin: { left: this.x, top: this.y },
        borderStyle: "classic",
        borderColor: this.color,
        // backgroundColor: "yellow",
      })
    );
    cursorTo(this.npcX, this.npcY);
    console.log(colors.bold.rgb24(this.npcSymbol, this.npcColor));
    cursorTo(this.exitX, this.exitY);
    console.log(colors.bold.rgb24(this.exitSymbol, this.doorColor));
    if (this.hasEntrance) {
      cursorTo(this.entranceX, this.entranceY);
      console.log(colors.bold.rgb24(this.entranceSymbol, this.doorColor));
    }

    cursorTo(0, 0);
  }
}

export function createChambers(numChambers, chambersInfo) {
  const chambers = [];
  const npcSymbols = ["δ", "Φ", "ζ", "ξ", "θ", "Ψ", "∂", "⥉", "§"];
  let offset = 0;
  for (let i = 0; i < numChambers; i++) {
    let w = randomInt(8, 15) * 2;
    let newChamber = new Chamber(
      i + 1,
      chambersInfo[i].name,
      w,
      randomInt(10, 12),
      npcSymbols[i % npcSymbols.length],
      i * 2 + offset,
      randomInt(5, 8)
    );
    chambers.push(newChamber);
    if (i > 0) {
      newChamber.hasEntrance = true;
      newChamber.entranceY = chambers[i - 1].exitY;
    }
    offset += w;
  }
  return chambers;
}

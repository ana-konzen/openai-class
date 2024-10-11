import { moveTo } from "./ansi.js";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";

export class Character {
  constructor(x, y) {
    this.symbol = "@";
    this.color = 0xffffff;
    this.x = x;
    this.y = y;
    this.chamber;
    this.talking = false;
    this.moving = false;
    this.inDialogue = false;
    this.inPrologue = true;
    this.inEpilogue = false;
  }
  goToEpilogue() {
    this.talking = false;
    this.moving = false;
    this.inDialogue = false;
    this.inPrologue = false;
    this.inEpilogue = true;
  }
  startMoving() {
    this.talking = false;
    this.moving = true;
    this.inDialogue = false;
    this.inPrologue = false;
    this.inEpilogue = false;
  }
  render() {
    moveTo(this.x, this.y);
    console.log(colors.rgb24(this.symbol, this.color));
  }
  placeInChamber(currentChamber) {
    this.chamber = currentChamber;
  }
  isCloseToExit() {
    return this.y === this.chamber.exitY - 1 && this.x >= this.chamber.exitX - 3;
  }
  isCloseToNPC() {
    return (
      this.y <= this.chamber.npcY &&
      this.y >= this.chamber.npcY - 2 &&
      this.x >= this.chamber.npcX - 3 &&
      this.x <= this.chamber.npcX + 1
    );
  }
}

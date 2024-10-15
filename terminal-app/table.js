import { Cell, Row, Table } from "https://deno.land/x/cliffy@v1.0.0-rc.4/table/mod.ts";
import { cursorTo } from "./ansi.js";

let options = ["[w][a][s][d] move", "[e] interact", "[q] quit"];

renderMenu(options, 0, 0);

renderMenu(options, 20, 20);

function renderMenu(options, x, y) {
  let actionsMenu = new Table();
  actionsMenu.body([options]);
  actionsMenu.padding(5);
  let menuString = actionsMenu.toString();
  cursorTo(x, y);
  console.log(menuString);
}

export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function splitSentences(str) {
  return str.match(/[^\.!\?]+[\.!\?]+[\n\r]*/g);
}

export function getPlayerOverlaps(currentChamber, playerX, playerY) {
  return {
    wall: {
      right: playerX >= currentChamber.x + currentChamber.w - 3,
      left: playerX <= currentChamber.x + 1,
      top: playerY <= currentChamber.y + 1,
      bottom: playerY >= currentChamber.y + currentChamber.h - 2,
    },
    npc: {
      right:
        playerX >= currentChamber.npcX - 2 && playerY === currentChamber.npcY,
      left:
        playerX <= currentChamber.npcX + 2 && playerY === currentChamber.npcY,
      top:
        playerY <= currentChamber.npcY + 1 && playerX === currentChamber.npcX,
      bottom:
        playerY >= currentChamber.npcY - 1 && playerX === currentChamber.npcX,
    },
  };
}

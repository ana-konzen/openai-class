export function randomInt(min, max) {
  return Math.floor(Math.floor(Math.random() * (max - min + 1)) + min);
}

export function splitSentences(str) {
  let str2 = str.trim();
  const sentences = str2.match(/[^\.!\?]+[\.!\?]+[\s\n\r]*/g);
  const cleanedSentences = sentences.map((sentence) => sentence.trim().replace(/[\n\r]+/g, ""));
  return cleanedSentences;
}

export function getOverlaps(currentChamber, playerX, playerY) {
  return {
    wall: {
      right: playerX >= currentChamber.x + currentChamber.w - 3,
      left: playerX <= currentChamber.x + 1,
      top: playerY <= currentChamber.y + 1,
      bottom: playerY >= currentChamber.y + currentChamber.h - 2,
    },
    npc: {
      right:
        (playerX === currentChamber.npcX - 2 || playerX === currentChamber.npcX - 3) &&
        playerY === currentChamber.npcY - 1,
      left:
        (playerX === currentChamber.npcX + 1 || playerX === currentChamber.npcX) &&
        playerY === currentChamber.npcY - 1,
      top: playerY === currentChamber.npcY && playerX === currentChamber.npcX - 1,
      bottom: playerY === currentChamber.npcY - 2 && playerX === currentChamber.npcX - 1,
    },
  };
}

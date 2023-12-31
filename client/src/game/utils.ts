import type { Player } from "./objects";
import { v4 as uuidv4 } from "uuid";

export function animateText(ctx: CanvasRenderingContext2D, player: Player) {
  if (player.isTyping) {
    const fontSize = 18 * player.scale;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "#555555";
    const dots = Math.floor(Date.now() / 200) % 4;
    const trailingDots = "....".substring(0, dots);
    const xPos = player.x;
    ctx.fillText(trailingDots, xPos, player.y - (12 * player.scale) / 3);
  } else if (player.activeMessage) {
    const fontSize = (14 * player.scale) / 2;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle = "black";
    ctx.fillText(
      player.activeMessage,
      player.x,
      player.y - (10 * player.scale) / 3,
    );
  }
}

export function getPlayerId() {
  const storedPlayerId = localStorage.getItem("playerId");
  if (storedPlayerId) {
    return storedPlayerId;
  }
  const playerId = uuidv4();
  localStorage.setItem("playerId", playerId);
  return playerId;
}

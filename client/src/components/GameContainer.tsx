import { onMount } from "solid-js";
import { Renderer } from "../game";
import { Player } from "../game/objects";

export default function GameContainer() {
  let container: HTMLDivElement | undefined = undefined;
  const players = new Map();

  onMount(() => {
    const playerId = localStorage.getItem("playerId") ?? crypto.randomUUID();
    localStorage.setItem("playerId", playerId);

    const renderer = new Renderer();
    container!.appendChild(renderer.canvas);

    const player = new Player();
    player.controls();
    players.set(playerId, player);
    renderer.add(player);
    renderer.animate(player.aniamte.bind(player));

    const socket = new WebSocket(`ws://localhost:3000?playerId=${playerId}`);
    socket.onopen = () => console.log("ws connected");
    socket.onclose = () => console.log("ws connection closed");
    window.onbeforeunload = () => socket.close(1000, playerId);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "on-join") {
        data.state.players.forEach((p: any) => {
          if (p.playerId === playerId) return;
          const player = new Player();
          player.position(p.x, p.y);
          players.set(data.playerId, player);
          renderer.add(player);
        });
      }

      if (data.type === "player-joined") {
        if (players.has(data.playerId)) return;
        const player = new Player();
        player.position(data.state.x, data.state.y);
        player.color = data.state.color;
        player.movement = data.state.movement;
        players.set(data.playerId, player);
        renderer.add(player);
      }

      if (data.type === "player-update") {
        if (data.playerId === playerId) return;
        const player = players.get(data.playerId);
        if (player) {
          player.position(data.state.x, data.state.y);
          player.movement = data.state.movement;
        } else {
          const player = new Player();
          player.position(data.state.x, data.state.y);
          players.set(data.playerId, player);
          renderer.add(player);
        }
      }
    };

    let lastUpdate = 0;
    renderer.animate(() => {
      if (player.isMoving()) {
        const now = Date.now();
        if (now - lastUpdate > 1000 / 60) {
          lastUpdate = now;
          socket.send(
            JSON.stringify({ type: "player-update", state: player, playerId }),
          );
        }
      }
    });

    renderer.start();
  });

  return <div ref={container} class="h-screen w-screen"></div>;
}

import { onCleanup, onMount } from "solid-js";
import { Renderer } from "../game/renderer";
import { Player } from "../game/objects";

export default function GameContainer() {
  let container: HTMLDivElement | undefined = undefined;

  onMount(async () => {
    const socket = new WebSocket(`ws://localhost:3000/ws`);
    socket.onclose = () => console.log("ws connection closed");
    await new Promise((reslove) => (socket.onopen = reslove));

    const playerId = getCookieByName(document.cookie, "playerId");

    window.onbeforeunload = () => {
      if (socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "player-disconnected", playerId }));
        socket.close(1000, "connection closed");
      }
    };

    const renderer = new Renderer();
    container!.appendChild(renderer.canvas);

    const players = new Map();
    const player = new Player();
    player.controls();
    players.set(playerId, player);
    renderer.add(player);
    renderer.animate(player.animate.bind(player), player.id);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "on-join") {
        data.state.players.forEach((p: any) => {
          if (p.playerId === playerId) {
            return;
          }
          const _player = new Player();
          _player.position(p.x, p.y);
          _player.movement = p.movement;
          players.set(data.playerId, _player);
          renderer.add(_player);
          renderer.animate(_player.animate.bind(_player), _player.id);
        });
      }

      if (data.type === "player-joined") {
        if (players.has(data.playerId)) {
          const _player = players.get(data.playerId);
          _player.position(0, 0);
          return;
        }
        const _player = new Player();
        _player.position(data.state.x, data.state.y);
        _player.color = data.state.color;
        _player.movement = data.state.movement;
        players.set(data.playerId, _player);
        renderer.add(_player);
        renderer.animate(_player.animate.bind(_player), _player.id);
      }

      if (data.type === "player-update") {
        if (data.playerId === playerId) {
          return;
        }
        if (players.has(data.playerId)) {
          const _player = players.get(data.playerId);
          _player.movement = data.state.movement;
        } else {
          const _player = new Player();
          _player.position(data.state.x, data.state.y);
          _player.movement = data.state.movement;
          players.set(data.playerId, _player);
          renderer.add(_player);
          renderer.animate(_player.animate.bind(_player), _player.id);
        }
      }

      if (data.type === "player-disconnected") {
        if (players.has(data.playerId)) {
          const _player = players.get(data.playerId);
          renderer.removeAnimation(_player.id);
          renderer.remove(_player);
          players.delete(data.playerId);
        }
      }
    };

    let lastUpdate = 0;
    let stoppedMoving = false;

    function updatePlayer() {
      if (player.isMoving()) {
        const now = Date.now();
        if (now - lastUpdate > 1000 / 30) {
          lastUpdate = now;
          socket.send(
            JSON.stringify({ type: "player-update", state: player, playerId }),
          );
        }
        stoppedMoving = false;
      } else if (!stoppedMoving) {
        socket.send(
          JSON.stringify({ type: "player-update", state: player, playerId }),
        );
        stoppedMoving = true;
      }
    }

    renderer.animate(updatePlayer, "update-player");
    renderer.start();

    onCleanup(() => {
      renderer.removeAnimation("update-player");
    });
  });

  return <div ref={container} class="h-screen w-screen"></div>;
}

function getCookieByName(cookie: string, name: string) {
  const value = `; ${cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
}

import { onMount } from "solid-js";
import { Renderer } from "../game/renderer";
import { Player } from "../game/objects";

const WS_URL = import.meta.env.PUBLIC_WS_URL;
const PLACEHOLDER_GAME_ID = 1; // TODO: create lobby for creaing and joining games
const SERVER_UPDATE_RATE = 1000 / 60; // send 60 updates per second to server
const SYNC_RATE = 1000 * 5; // sync x,y player coords every 5 seconds

export default function GameContainer() {
  let container: HTMLDivElement | undefined = undefined;
  let syncPosition = 0;

  onMount(async () => {
    const playerId = localStorage.getItem("playerId") ?? crypto.randomUUID();
    localStorage.setItem("playerId", playerId);
    document.cookie = `playerId=${playerId}; SameSite=None; Secure; Expires=Fri, 31 Dec 9999 23:59:59 GMT;`;

    const socket = new WebSocket(`${WS_URL}/game/${PLACEHOLDER_GAME_ID}`);

    socket.onerror = () => console.log("ws connection error");
    socket.onclose = () => console.log("ws connection closed");
    window.onbeforeunload = () => {
      if (socket.readyState == WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "player-disconnected", playerId }));
        socket.close(1000, "connection closed");
      }
    };
    await new Promise(
      (reslove) => (socket.onopen = () => reslove(console.log("ws connected"))),
    );

    const renderer = new Renderer();
    container!.appendChild(renderer.canvas);

    const players = new Map();
    const player = new Player();
    player.controls();
    players.set(playerId, player);
    renderer.addObject(player);
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
          players.set(p.playerId, _player);
          renderer.addObject(_player);
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
        renderer.addObject(_player);
        renderer.animate(_player.animate.bind(_player), _player.id);
      }

      if (data.type === "player-update") {
        if (data.playerId === playerId) {
          return;
        }
        if (players.has(data.playerId)) {
          const _player = players.get(data.playerId);
          if (syncPosition < Date.now() - SYNC_RATE) {
            _player.position(data.state.x, data.state.y);
            syncPosition = Date.now();
          }
          _player.movement = data.state.movement;
        } else {
          const _player = new Player();
          _player.position(data.state.x, data.state.y);
          _player.movement = data.state.movement;
          players.set(data.playerId, _player);
          renderer.addObject(_player);
          renderer.animate(_player.animate.bind(_player), _player.id);
        }
      }

      if (data.type === "player-disconnected") {
        if (players.has(data.playerId)) {
          const _player = players.get(data.playerId);
          renderer.removeAnimation(_player.id);
          renderer.removeObject(_player);
          players.delete(data.playerId);
        }
      }
    };

    let lastUpdate = 0;
    let stoppedMoving = false;

    function updatePlayer() {
      if (player.isMoving()) {
        const now = Date.now();
        if (now - lastUpdate > SERVER_UPDATE_RATE) {
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
  });

  return <div ref={container} class="h-screen w-screen"></div>;
}

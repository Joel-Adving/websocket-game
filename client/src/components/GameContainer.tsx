import { createSignal, onMount } from "solid-js";
import { Renderer } from "../game/renderer";
import { Player } from "../game/objects";
import "toolcool-color-picker";
import ColorPicker from "toolcool-color-picker";
import { v4 as uuidv4 } from "uuid";
import { getPlayerId } from "../game/utils";

const WS_URL = import.meta.env.PUBLIC_WS_URL;
const PLACEHOLDER_GAME_ID = 1; // TODO: create lobby for creaing and joining games
const UPDATE_RATE = 1000 / 60; // send 60 updates per second to server
const SYNC_RATE = 1000 * 5; // sync x, y player coords every 5 seconds
const INITIAL_COLOR = "#e76ff1";
const INITIAL_SCALE = 3;

export default function GameContainer() {
  let container: HTMLDivElement | undefined = undefined;
  let socket: WebSocket;
  let players: Map<string, Player>;
  let player: Player;
  let playerId: string;
  let lastSync = 0;

  const [scale, setScale] = createSignal(INITIAL_SCALE);
  const [movementSpeed, setMovementSpeed] = createSignal(10);
  const [messageInput, setMessageInput] = createSignal("");

  let inputElementRef: HTMLInputElement | undefined = undefined;

  onMount(async () => {
    playerId = getPlayerId();
    socket = new WebSocket(`${WS_URL}/game/${PLACEHOLDER_GAME_ID}`);
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
    players = new Map();
    player = new Player();
    player.color = INITIAL_COLOR;
    player.controls();
    players.set(playerId, player);
    renderer.addObject(player);
    renderer.addToLoop(player.animate.bind(player), player.id);

    socket.onmessage = (e) => {
      const data = JSON.parse(e.data);

      if (data.type === "on-join") {
        data.state.players.forEach((p: any) => {
          if (p.playerId === playerId) {
            return;
          }
          const newPlayer = new Player();
          newPlayer.update(p);
          players.set(p.playerId, newPlayer);
          renderer.addObject(newPlayer);
          renderer.addToLoop(newPlayer.animate.bind(newPlayer), newPlayer.id);
        });
      }

      if (data.type === "player-joined") {
        const foundPlayer = players.get(data.playerId);
        if (foundPlayer) {
          foundPlayer.position(200, 200);
          return;
        }
        const newPlayer = new Player();
        newPlayer.update(data.state);
        players.set(data.playerId, newPlayer);
        renderer.addObject(newPlayer);
        renderer.addToLoop(newPlayer.animate.bind(newPlayer), newPlayer.id);
      }

      if (data.type === "player-update") {
        if (data.playerId === playerId) {
          return;
        }
        const foundPlayer = players.get(data.playerId);
        if (foundPlayer) {
          if (lastSync < Date.now() - SYNC_RATE) {
            foundPlayer.position(data.state.x, data.state.y);
            lastSync = Date.now();
          }
          foundPlayer.update(data.state, { withPosition: false });
        } else {
          const newPlayer = new Player();
          newPlayer.update(data.state);
          players.set(data.playerId, newPlayer);
          renderer.addObject(newPlayer);
          renderer.addToLoop(newPlayer.animate.bind(newPlayer), newPlayer.id);
        }
      }

      if (data.type === "player-disconnected") {
        const foundPlayer = players.get(data.playerId);
        if (foundPlayer) {
          renderer.removeFromLoop(foundPlayer.id);
          renderer.removeObject(foundPlayer);
          players.delete(data.playerId);
        }
      }
    };

    let lastUpdate = 0;
    let stoppedMoving = false;

    function updatePlayer() {
      if (player.isMoving()) {
        const now = Date.now();
        if (now - lastUpdate > UPDATE_RATE) {
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

    renderer.addToLoop(updatePlayer, "update-player");

    renderer.startLoop();
  });

  onMount(() => {
    const colorPicker = document.getElementById("color-picker") as ColorPicker;
    colorPicker.addEventListener("change", (evt: any) => {
      player.color = evt.detail.hex8;
      socket.send(
        JSON.stringify({ type: "player-update", state: player, playerId }),
      );
    });

    inputElementRef!.addEventListener("focus", () => {
      player.stopMovement();
      player.isTyping = true;
      socket.send(
        JSON.stringify({ type: "player-update", state: player, playerId }),
      );
    });

    inputElementRef!.addEventListener("blur", () => {
      player.isTyping = false;
      socket.send(
        JSON.stringify({ type: "player-update", state: player, playerId }),
      );
    });
  });

  function handleScaleChange(
    e: InputEvent & { currentTarget: HTMLInputElement },
  ) {
    setScale(e.currentTarget.valueAsNumber);
    player.scale = e.currentTarget.valueAsNumber;
    socket.send(
      JSON.stringify({
        type: "player-update",
        state: player,
        playerId,
      }),
    );
  }

  function handleMovementSpeedChange(
    e: InputEvent & { currentTarget: HTMLInputElement },
  ) {
    setMovementSpeed(e.currentTarget.valueAsNumber);
    player.movementSpeed = e.currentTarget.valueAsNumber;
    socket.send(
      JSON.stringify({
        type: "player-update",
        state: player,
        playerId,
      }),
    );
  }

  function handleSendMessage(e: Event) {
    e.preventDefault();
    const message = messageInput();
    if (!message) return;
    player.activeMessage = message;
    socket.send(
      JSON.stringify({
        type: "message",
        state: message,
        playerId,
      }),
    );
    player.isTyping = false;
    setMessageInput("");
    inputElementRef!.blur();
  }

  return (
    <div class="relative h-screen w-screen">
      <div ref={container} class="absolute inset-0"></div>

      <div class="absolute top-4 left-4 flex gap-10">
        {/* @ts-ignore */}
        <toolcool-color-picker
          id="color-picker"
          color="#e76ff1"
          button-width="xl"
          button-height="lg"
          button-padding="3px"
        />

        <div class="flex items-center gap-2">
          <label for="scale">Scale</label>
          <input
            id="scale"
            type="range"
            min="1"
            max="10"
            value={scale()}
            onInput={handleScaleChange}
          />
        </div>

        <div class="flex items-center gap-2">
          <label for="movement-speed">Movement Speed</label>
          <input
            id="movement-speed"
            type="range"
            min="1"
            max="30"
            value={movementSpeed()}
            onInput={handleMovementSpeedChange}
          />
        </div>
      </div>

      <form
        onSubmit={handleSendMessage}
        class="absolute flex gap-3 bottom-5 left-5"
      >
        <input
          ref={inputElementRef}
          id="message"
          class="rounded border-2 p-2 bg-transparent"
          value={messageInput()}
          onChange={(e) => setMessageInput(e.currentTarget.value)}
        />
        <button type="submit" class="rounded border-2 p-2 px-4 text-gray-500">
          Send
        </button>
      </form>
    </div>
  );
}

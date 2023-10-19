import { animateText } from "../utils";
import { Entity } from "./entity";

type Movement = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export class Player extends Entity {
  movement: Movement;
  movementSpeed: number;
  activeMessage: string;
  messages: string[];
  isTyping: boolean;

  constructor(id?: string) {
    super(id);
    this.messages = [];
    this.movementSpeed = 10;
    this.activeMessage = "";
    this.isTyping = false;
    this.movement = {
      up: false,
      down: false,
      left: false,
      right: false,
    };
  }

  isMoving() {
    return (
      this.movement.up ||
      this.movement.down ||
      this.movement.left ||
      this.movement.right
    );
  }

  stopMovement() {
    this.movement.up = false;
    this.movement.down = false;
    this.movement.left = false;
    this.movement.right = false;
  }

  animate(delta: number) {
    if (this.isTyping) return;

    if (this.movement.up) {
      this.y -= this.movementSpeed * delta;
    }
    if (this.movement.down) {
      this.y += this.movementSpeed * delta;
    }
    if (this.movement.left) {
      this.x -= this.movementSpeed * delta;
    }
    if (this.movement.right) {
      this.x += this.movementSpeed * delta;
    }
  }

  controls() {
    window.addEventListener("keydown", (e) => {
      if (this.isTyping) return;

      if (e.key === "ArrowLeft" || e.key === "a") {
        this.movement.left = true;
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        this.movement.right = true;
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") {
        this.movement.up = true;
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        this.movement.down = true;
      }
    });

    window.addEventListener("keyup", (e) => {
      if (this.isTyping) return;

      if (e.key === "ArrowLeft" || e.key === "a") {
        this.movement.left = false;
      }
      if (e.key === "ArrowRight" || e.key === "d") {
        this.movement.right = false;
      }
      if (e.key === "ArrowUp" || e.key === "w" || e.key === " ") {
        this.movement.up = false;
      }
      if (e.key === "ArrowDown" || e.key === "s") {
        this.movement.down = false;
      }
    });
  }

  update(
    data: {
      x: number;
      y: number;
      scale: number;
      color: string;
      movement: Movement;
      movementSpeed: number;
      activeMessage: string;
      isTyping: boolean;
    },
    { withPosition = true } = {},
  ) {
    this.scale = data.scale;
    this.color = data.color;
    this.movement = data.movement;
    this.movementSpeed = data.movementSpeed;
    this.activeMessage = data.activeMessage;
    this.isTyping = data.isTyping;
    if (withPosition) {
      this.position(data.x, data.y);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const width = this.width * this.scale;
    const height = this.height * this.scale;

    // Keeps the object in the viewport bounds
    if (this.x < 0) {
      this.x = 0;
    } else if (this.x > window.innerWidth - width) {
      this.x = window.innerWidth - width;
    }
    if (this.y < 0) {
      this.y = 0;
    } else if (this.y > window.innerHeight - height) {
      this.y = window.innerHeight - height;
    }

    animateText(ctx, this);

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, width, height);
  }
}

import { Entity } from "./entity";

type Movement = {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
};

export class Player extends Entity {
  color: string;
  scale: number;
  movement: Movement;
  movementSpeed: number;

  constructor({ color = "black", scale = 10 } = {}) {
    super();
    this.color = color;
    this.scale = scale;
    this.movementSpeed = 10;
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

  aniamte(delta: number) {
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

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, 50, 50);
  }
}

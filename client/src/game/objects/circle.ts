import { Entity } from "./entity";

export class Circle extends Entity {
  color: string;
  radius: number;

  constructor({ color = "red", radius = 10 } = {}) {
    super();
    this.color = color;
    this.radius = radius;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

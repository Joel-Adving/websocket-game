export class Entity {
  #id: string;
  x: number;
  y: number;

  constructor() {
    this.#id = crypto.randomUUID();
    this.x = 0;
    this.y = 0;
  }

  get id() {
    return this.#id;
  }

  position(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y, 50, 50);
  }
}

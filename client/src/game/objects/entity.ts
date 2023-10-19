export class Entity {
  #id: string;
  x: number;
  y: number;
  color: string;
  scale: number;

  constructor() {
    this.#id = crypto.randomUUID();
    this.color = "black";
    this.scale = 3;
    this.x = 200;
    this.y = 200;
  }

  get id() {
    return this.#id;
  }

  position(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    const s = 25 * this.scale;
    ctx.fillRect(this.x, this.y, s, s);
  }
}

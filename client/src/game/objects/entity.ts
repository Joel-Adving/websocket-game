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
    const size = 25 * this.scale;

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x > window.innerWidth - size) {
      this.x = window.innerWidth - size;
    }

    if (this.y < 0) {
      this.y = 0;
    } else if (this.y > window.innerHeight - size) {
      this.y = window.innerHeight - size;
    }

    ctx.fillRect(this.x, this.y, size, size);
  }
}

export class Entity {
  #id: string;
  x: number;
  y: number;
  height: number;
  width: number;
  color: string;
  scale: number;

  constructor() {
    this.#id = crypto.randomUUID();
    this.color = "black";
    this.scale = 3;
    this.width = 25;
    this.height = 25;
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

    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, width, height);
  }
}

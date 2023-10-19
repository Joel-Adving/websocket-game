import type { Entity } from "./objects/entity";

export class Renderer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  speedConstant: number;
  #previousTime: number;
  #deltaTime: number;
  #running: boolean;
  #objects: Map<string, Entity>;
  #animations: Map<string, (deltaTime: number, currentTime: number) => void>;

  constructor() {
    const canvas = this.newCanvas();
    const ctx = canvas.getContext("2d")!;
    this.canvas = canvas;
    this.ctx = ctx;
    this.speedConstant = 60;
    this.#previousTime = 0;
    this.#deltaTime = 0;
    this.#running = false;
    this.#objects = new Map();
    this.#animations = new Map();
  }

  get objects() {
    return this.#objects;
  }

  get animations() {
    return this.#animations;
  }

  addObject(entity: Entity) {
    this.#objects.set(entity.id, entity);
  }

  removeObject(entity: Entity | string) {
    if (typeof entity === "object") {
      this.#objects.delete(entity.id);
    }
    if (typeof entity === "string") {
      this.#objects.delete(entity);
    }
  }

  animate(fn: (deltaTime: number, currentTime: number) => void, name?: string) {
    this.#animations.set(name ?? fn.name, fn);
  }

  removeAnimation(
    animation: string | ((deltaTime: number, currentTime: number) => void),
  ) {
    if (typeof animation === "function") {
      this.#animations.delete(animation.name);
    } else if (typeof animation === "string") {
      this.#animations.delete(animation);
    }
  }

  newCanvas() {
    const canvas = document.createElement("canvas");
    canvas.style.height = "100%";
    canvas.style.width = "100%";

    function setSize() {
      canvas.height = canvas.offsetHeight;
      canvas.width = canvas.offsetWidth;
    }

    setTimeout(setSize); // hack for initial size
    window.addEventListener("resize", setSize);
    return canvas;
  }

  #frame(currentTime: number) {
    currentTime *= 0.001;
    this.#deltaTime = this.speedConstant * (currentTime - this.#previousTime);
    this.#previousTime = currentTime;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.#animations.forEach((fn) => fn(this.#deltaTime, currentTime));
    this.#objects.forEach((obj) => obj.draw(this.ctx));
    requestAnimationFrame(this.#frame.bind(this));
  }

  start() {
    if (!this.#running) {
      this.#running = true;
      requestAnimationFrame(this.#frame.bind(this));
    }
  }
}

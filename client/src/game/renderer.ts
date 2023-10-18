import type { Entity } from "./objects/entity";

export class Renderer {
  ctx: CanvasRenderingContext2D;
  canvas: HTMLCanvasElement;
  speedConstant: number;
  #previousTime: number;
  #deltaTime: number;
  #running: boolean;
  #objects: Map<string, Entity>;
  #animations: Function[];

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
    this.#animations = [];
  }

  newCanvas() {
    const canvas = document.createElement("canvas");
    canvas.style.height = "100%";
    canvas.style.width = "100%";

    function setSize() {
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    }

    setTimeout(setSize); // hack for initial size
    window.addEventListener("resize", setSize);
    return canvas;
  }

  add(entity: Entity) {
    this.#objects.set(entity.id, entity);
  }

  animate(fn: (deltaTime: number, currentTime: number) => void) {
    this.#animations.push(fn);
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

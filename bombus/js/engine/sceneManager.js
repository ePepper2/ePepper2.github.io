/**
 * @typedef {Object} Scene
 * @property {(ctx: { canvas: HTMLCanvasElement }) => void} [enter]
 * @property {() => void} [exit]
 * @property {(dt: number) => void} [update]
 * @property {(ctx: CanvasRenderingContext2D) => void} [render]
 * @property {(pos: { x: number, y: number }) => void} [onPointerDown]
 * @property {(pos: { x: number, y: number }) => void} [onPointerMove]
 * @property {(pos: { x: number, y: number }) => void} [onPointerUp]
 * @property {(land: boolean) => void} [decideLanding]
 */

export class SceneManager {
  /** @type {Scene | null} */
  #current = null;
  /** @type {HTMLCanvasElement} */
  #canvas;

  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.#canvas = canvas;
  }

  /**
   * @param {Scene} scene
   */
  goTo(scene) {
    this.#current?.exit?.();
    this.#current = scene;
    this.#current.enter?.({ canvas: this.#canvas });
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    this.#current?.update?.(dt);
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    this.#current?.render?.(ctx);
  }

  get current() {
    return this.#current;
  }
}

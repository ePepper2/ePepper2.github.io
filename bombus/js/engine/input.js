import { toCanvasCoords } from './canvasScaler.js';

/**
 * Unifies mouse, touch, and pen input via the Pointer Events API so the same
 * drag gesture works identically on desktop Chrome and mobile Chrome.
 * @param {HTMLCanvasElement} canvas
 * @param {{
 *   onDown?: (pos: { x: number, y: number }) => void,
 *   onMove?: (pos: { x: number, y: number }) => void,
 *   onUp?: (pos: { x: number, y: number }) => void,
 * }} handlers
 */
export function attachPointerInput(canvas, handlers) {
  /** @type {number | null} */
  let activePointerId = null;

  /**
   * @param {PointerEvent} event
   */
  function toLocal(event) {
    return toCanvasCoords(canvas, event.clientX, event.clientY);
  }

  /**
   * @param {PointerEvent} event
   */
  function onDown(event) {
    activePointerId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    handlers.onDown?.(toLocal(event));
  }

  /**
   * @param {PointerEvent} event
   */
  function onMove(event) {
    if (event.pointerId !== activePointerId) return;
    handlers.onMove?.(toLocal(event));
  }

  /**
   * @param {PointerEvent} event
   */
  function onUp(event) {
    if (event.pointerId !== activePointerId) return;
    activePointerId = null;
    handlers.onUp?.(toLocal(event));
  }

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', onUp);
  canvas.addEventListener('pointercancel', onUp);

  return function detach() {
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', onUp);
    canvas.removeEventListener('pointercancel', onUp);
  };
}

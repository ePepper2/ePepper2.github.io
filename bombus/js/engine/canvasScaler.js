const MIN_ASPECT = 9 / 16;
const MAX_ASPECT = 16 / 9;

/**
 * Sizes a canvas to fill the viewport within a portrait-to-landscape aspect
 * range, backed by devicePixelRatio, so the same game world reads well on a
 * phone held upright and a wide desktop Chrome window alike.
 * @param {HTMLCanvasElement} canvas
 * @param {{ onResize?: (size: { width: number, height: number }) => void }} [options]
 */
export function attachResponsiveCanvas(canvas, options = {}) {
  const ctx = /** @type {CanvasRenderingContext2D | null} */ (canvas.getContext('2d'));
  if (!ctx) throw new Error('2D canvas context unavailable');
  const context = /** @type {CanvasRenderingContext2D} */ (ctx);

  function resize() {
    const availableWidth = window.innerWidth;
    const availableHeight = window.innerHeight;
    const aspect = Math.max(MIN_ASPECT, Math.min(MAX_ASPECT, availableWidth / availableHeight));

    let width = availableWidth;
    let height = width / aspect;
    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspect;
    }

    const dpr = window.devicePixelRatio || 1;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    context.setTransform(dpr, 0, 0, dpr, 0, 0);

    options.onResize?.({ width, height });
  }

  window.addEventListener('resize', resize);
  resize();

  return { ctx: context, resize };
}

/**
 * Converts a client-space (pointer event) coordinate to world-space canvas
 * coordinates, independent of the current devicePixelRatio scaling.
 * @param {HTMLCanvasElement} canvas
 * @param {number} clientX
 * @param {number} clientY
 */
export function toCanvasCoords(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  return {
    x: ((clientX - rect.left) / rect.width) * (canvas.width / dpr),
    y: ((clientY - rect.top) / rect.height) * (canvas.height / dpr),
  };
}

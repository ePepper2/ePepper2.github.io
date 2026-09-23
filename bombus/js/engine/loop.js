/**
 * @param {{ update: (dt: number) => void, render: () => void }} handlers
 */
export function createLoop({ update, render }) {
  /** @type {number | null} */
  let rafId = null;
  /** @type {number | null} */
  let lastTime = null;

  /**
   * @param {number} timestamp
   */
  function frame(timestamp) {
    if (lastTime === null) lastTime = timestamp;
    const dt = Math.min((timestamp - lastTime) / 1000, 0.1);
    lastTime = timestamp;
    update(dt);
    render();
    rafId = requestAnimationFrame(frame);
  }

  return {
    start() {
      lastTime = null;
      rafId = requestAnimationFrame(frame);
    },
    stop() {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    },
  };
}

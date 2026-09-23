import { describe, it, expect, vi } from 'vitest';
import { SceneManager } from './sceneManager.js';

function makeScene() {
  return {
    enter: vi.fn(),
    exit: vi.fn(),
    update: vi.fn(),
    render: vi.fn(),
  };
}

describe('SceneManager', () => {
  it('calls exit on the previous scene and enter on the next', () => {
    const manager = new SceneManager(/** @type {any} */ ({}));
    const first = makeScene();
    const second = makeScene();

    manager.goTo(first);
    expect(first.enter).toHaveBeenCalledTimes(1);

    manager.goTo(second);
    expect(first.exit).toHaveBeenCalledTimes(1);
    expect(second.enter).toHaveBeenCalledTimes(1);
  });

  it('delegates update and render to the current scene', () => {
    const manager = new SceneManager(/** @type {any} */ ({}));
    const scene = makeScene();
    manager.goTo(scene);

    manager.update(0.016);
    manager.render(/** @type {any} */ ({}));

    expect(scene.update).toHaveBeenCalledWith(0.016);
    expect(scene.render).toHaveBeenCalledTimes(1);
  });

  it('does nothing when no scene has been set', () => {
    const manager = new SceneManager(/** @type {any} */ ({}));
    expect(() => manager.update(0.016)).not.toThrow();
    expect(() => manager.render(/** @type {any} */ ({}))).not.toThrow();
  });
});

import { attachResponsiveCanvas } from './engine/canvasScaler.js';
import { attachPointerInput } from './engine/input.js';
import { SceneManager } from './engine/sceneManager.js';
import { createLoop } from './engine/loop.js';
import { SpringEmergencePhase } from './phases/springEmergence.js';

const canvas = /** @type {HTMLCanvasElement} */ (document.getElementById('game-canvas'));
const energyFill = /** @type {HTMLElement} */ (document.getElementById('energy-fill'));
const pollenFill = /** @type {HTMLElement} */ (document.getElementById('pollen-fill'));
const pollenGoalMarker = /** @type {HTMLElement} */ (document.getElementById('pollen-goal-marker'));
const fieldNote = /** @type {HTMLElement} */ (document.getElementById('field-note'));
const landingPrompt = /** @type {HTMLElement} */ (document.getElementById('landing-prompt'));
const landingQuestion = /** @type {HTMLElement} */ (document.getElementById('landing-question'));
const landYesButton = /** @type {HTMLButtonElement} */ (document.getElementById('land-yes'));
const landNoButton = /** @type {HTMLButtonElement} */ (document.getElementById('land-no'));
const outcomeOverlay = /** @type {HTMLElement} */ (document.getElementById('outcome-overlay'));
const outcomeTitle = /** @type {HTMLElement} */ (document.getElementById('outcome-title'));
const outcomeBody = /** @type {HTMLElement} */ (document.getElementById('outcome-body'));
const retryButton = /** @type {HTMLButtonElement} */ (document.getElementById('retry-button'));

const sceneManager = new SceneManager(canvas);

const { ctx } = attachResponsiveCanvas(canvas, {
  onResize: () => {
    sceneManager.current?.enter?.({ canvas });
  },
});

/** @type {ReturnType<typeof setTimeout> | null} */
let fieldNoteTimer = null;

/** @param {string} fact */
function showFieldNote(fact) {
  fieldNote.textContent = fact;
  fieldNote.classList.add('visible');
  if (fieldNoteTimer) clearTimeout(fieldNoteTimer);
  fieldNoteTimer = setTimeout(() => fieldNote.classList.remove('visible'), 4200);
}

/**
 * @param {number} value
 * @param {number} max
 */
function setEnergy(value, max) {
  energyFill.style.width = `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
}

/**
 * @param {number} value
 * @param {number} max
 * @param {number} goal
 */
function setPollen(value, max, goal) {
  pollenFill.style.width = `${Math.max(0, Math.min(100, (value / max) * 100))}%`;
  pollenGoalMarker.style.left = `${Math.max(0, Math.min(100, (goal / max) * 100))}%`;
}

/** @param {{ name: string }} flower */
function showLandingPrompt(flower) {
  landingQuestion.textContent = `Land on the ${flower.name}?`;
  landingPrompt.classList.add('visible');
}

function hideLandingPrompt() {
  landingPrompt.classList.remove('visible');
}

/** @param {'won' | 'lost'} status */
function showOutcome(status) {
  outcomeOverlay.classList.add('visible');
  if (status === 'won') {
    outcomeTitle.textContent = 'Nest site found';
    outcomeBody.textContent =
      "She's found an abandoned rodent burrow — a favorite nest site for real western bumblebee queens. Next: founding the nest.";
  } else {
    outcomeTitle.textContent = 'Out of energy';
    outcomeBody.textContent =
      'A queen that cannot refuel before finding a nest site does not survive the season. Try feeding at more flowers along the way.';
  }
}

function startSpringEmergence() {
  outcomeOverlay.classList.remove('visible');
  fieldNote.classList.remove('visible');
  hideLandingPrompt();
  sceneManager.goTo(
    new SpringEmergencePhase({
      onEnergyChange: setEnergy,
      onPollenChange: setPollen,
      onFieldNote: showFieldNote,
      onLandingPrompt: showLandingPrompt,
      onComplete: showOutcome,
    }),
  );
}

retryButton.addEventListener('click', startSpringEmergence);

landYesButton.addEventListener('click', () => {
  hideLandingPrompt();
  sceneManager.current?.decideLanding?.(true);
});

landNoButton.addEventListener('click', () => {
  hideLandingPrompt();
  sceneManager.current?.decideLanding?.(false);
});

attachPointerInput(canvas, {
  onDown: (pos) => sceneManager.current?.onPointerDown?.(pos),
  onMove: (pos) => sceneManager.current?.onPointerMove?.(pos),
  onUp: (pos) => sceneManager.current?.onPointerUp?.(pos),
});

const loop = createLoop({
  update: (dt) => sceneManager.update(dt),
  render: () => sceneManager.render(ctx),
});

startSpringEmergence();
loop.start();

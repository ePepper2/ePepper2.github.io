export const MAX_ENERGY = 100;

/**
 * @param {number} [initial]
 * @returns {{ value: number }}
 */
export function createEnergyState(initial = MAX_ENERGY) {
  return { value: clamp(initial) };
}

/**
 * @param {{ value: number }} state
 * @param {number} amount
 */
export function drain(state, amount) {
  state.value = clamp(state.value - amount);
  return state.value;
}

/**
 * @param {{ value: number }} state
 * @param {number} amount
 */
export function refuel(state, amount) {
  state.value = clamp(state.value + amount);
  return state.value;
}

/**
 * @param {{ value: number }} state
 */
export function isDepleted(state) {
  return state.value <= 0;
}

/**
 * @param {number} value
 */
function clamp(value) {
  return Math.max(0, Math.min(MAX_ENERGY, value));
}

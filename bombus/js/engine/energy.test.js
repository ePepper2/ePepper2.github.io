import { describe, it, expect } from 'vitest';
import { createEnergyState, drain, refuel, isDepleted, MAX_ENERGY } from './energy.js';

describe('energy', () => {
  it('clamps the initial value to MAX_ENERGY', () => {
    const state = createEnergyState(500);
    expect(state.value).toBe(MAX_ENERGY);
  });

  it('drains and clamps at zero', () => {
    const state = createEnergyState(10);
    drain(state, 25);
    expect(state.value).toBe(0);
    expect(isDepleted(state)).toBe(true);
  });

  it('refuels and clamps at MAX_ENERGY', () => {
    const state = createEnergyState(90);
    refuel(state, 50);
    expect(state.value).toBe(MAX_ENERGY);
  });

  it('is not depleted above zero', () => {
    const state = createEnergyState(1);
    expect(isDepleted(state)).toBe(false);
  });
});

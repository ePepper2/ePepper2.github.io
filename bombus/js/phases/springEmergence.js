import { createEnergyState, drain, refuel, isDepleted, MAX_ENERGY } from '../engine/energy.js';
import { SPRING_FLOWERS } from '../data/flowers.js';
import { drawSky, drawTreeline, drawMeadow, drawBurrow, drawFlower, drawBee } from '../render/scenery.js';

const BEE_RADIUS = 14;
const FLOWER_RADIUS = 26;
const DETECT_RADIUS = FLOWER_RADIUS + BEE_RADIUS + 55;
const BURROW_RADIUS = 26;
const FOLLOW_SPEED = 3.2;
const IDLE_DRAIN_PER_SEC = 1.6;
const MOVE_DRAIN_PER_SEC = 3.4;
const GATHER_PER_SEC = 16;
const FLOWER_BUDGET = 50;
const POLLEN_GOAL = 70;
const HORIZON_RATIO = 0.56;
const GRASS_TUFT_COUNT = 36;

/**
 * @typedef {{ id: string, name: string, color: string, fact: string, x: number, y: number, nectar: number }} Flower
 */

/**
 * Phase 1: a newly-emerged queen must feed at real early-spring forage
 * plants — choosing whether to land on each one — while gathering enough
 * pollen to provision a nest, before her energy runs out.
 */
export class SpringEmergencePhase {
  /**
   * @param {{
   *   onEnergyChange?: (value: number, max: number) => void,
   *   onPollenChange?: (value: number, max: number, goal: number) => void,
   *   onComplete?: (status: 'won' | 'lost') => void,
   *   onFieldNote?: (fact: string) => void,
   *   onLandingPrompt?: (flower: Flower) => void,
   * }} [callbacks]
   */
  constructor(callbacks = {}) {
    this.onEnergyChange = callbacks.onEnergyChange;
    this.onPollenChange = callbacks.onPollenChange;
    this.onComplete = callbacks.onComplete;
    this.onFieldNote = callbacks.onFieldNote;
    this.onLandingPrompt = callbacks.onLandingPrompt;

    this.energy = createEnergyState(70);
    this.pollen = createEnergyState(0);
    this.status = 'playing';
    /** @type {'flying' | 'prompt' | 'landed'} */
    this.mode = 'flying';
    /** @type {{ x: number, y: number } | null} */
    this.pointerTarget = null;
    /** @type {Flower | null} */
    this.pendingFlower = null;
    /** @type {string | null} */
    this.landedFlowerId = null;
    /** @type {string | null} */
    this.cooldownFlowerId = null;
    /** @type {Set<string>} */
    this.visitedFlowers = new Set();
    this.burrowNoticeShown = false;
    this.elapsed = 0;

    this.bounds = { width: 0, height: 0 };
    this.horizon = 0;
    this.bee = { x: 0, y: 0 };
    /** @type {Flower[]} */
    this.flowers = [];
    this.burrow = { x: 0, y: 0, radius: BURROW_RADIUS, discovered: false, unlocked: false };
    /** @type {Array<{ x: number, y: number, scale: number }>} */
    this.grassTufts = [];
  }

  /**
   * @param {{ canvas: HTMLCanvasElement }} context
   */
  enter({ canvas }) {
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    this.bounds = { width, height };
    this.horizon = height * HORIZON_RATIO;

    this.bee = { x: width * 0.5, y: height * 0.85 };

    this.flowers = SPRING_FLOWERS.map((data, index) => ({
      ...data,
      x: width * (0.24 + index * 0.5),
      y: this.horizon + (height - this.horizon) * 0.32,
      nectar: FLOWER_BUDGET,
    }));

    this.burrow = {
      x: width * 0.82,
      y: this.horizon + (height - this.horizon) * 0.68,
      radius: BURROW_RADIUS,
      discovered: false,
      unlocked: false,
    };

    this.grassTufts = Array.from({ length: GRASS_TUFT_COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      scale: 0.6 + Math.random() * 0.8,
    }));

    this.onEnergyChange?.(this.energy.value, MAX_ENERGY);
    this.onPollenChange?.(this.pollen.value, MAX_ENERGY, POLLEN_GOAL);
  }

  /**
   * @param {{ x: number, y: number }} pos
   */
  onPointerDown(pos) {
    this.pointerTarget = pos;
  }

  /**
   * @param {{ x: number, y: number }} pos
   */
  onPointerMove(pos) {
    if (this.pointerTarget) this.pointerTarget = pos;
  }

  onPointerUp() {
    this.pointerTarget = null;
  }

  /**
   * Resolves a landing prompt raised via onLandingPrompt.
   * @param {boolean} land
   */
  decideLanding(land) {
    if (this.mode !== 'prompt' || !this.pendingFlower) return;
    const flower = this.pendingFlower;
    this.pendingFlower = null;
    if (land) {
      this.mode = 'landed';
      this.landedFlowerId = flower.id;
    } else {
      this.cooldownFlowerId = flower.id;
      this.mode = 'flying';
    }
  }

  /**
   * @param {number} dt
   */
  update(dt) {
    if (this.status !== 'playing' || this.mode === 'prompt') return;
    this.elapsed += dt;

    const moved = this.#followPointer(dt);
    const gathering = this.mode === 'landed' ? this.#gatherAtLandedFlower(dt) : false;

    if (!gathering) {
      drain(this.energy, (moved ? MOVE_DRAIN_PER_SEC : IDLE_DRAIN_PER_SEC) * dt);
    }

    this.onEnergyChange?.(this.energy.value, MAX_ENERGY);
    this.onPollenChange?.(this.pollen.value, MAX_ENERGY, POLLEN_GOAL);

    if (this.mode === 'flying') {
      this.#checkFlowerApproach();
    }

    this.#checkOutcome();
  }

  /**
   * @param {number} dt
   */
  #followPointer(dt) {
    if (!this.pointerTarget) return false;
    const dx = this.pointerTarget.x - this.bee.x;
    const dy = this.pointerTarget.y - this.bee.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) return false;

    const step = Math.min(dist, dist * Math.min(1, FOLLOW_SPEED * dt));
    this.bee.x += (dx / dist) * step;
    this.bee.y += (dy / dist) * step;
    return true;
  }

  /**
   * Draws down the currently-landed flower's budget into both energy and
   * pollen, and releases the bee if she drifts off or the flower runs dry.
   * @param {number} dt
   */
  #gatherAtLandedFlower(dt) {
    const flower = this.flowers.find((candidate) => candidate.id === this.landedFlowerId);
    const stillNear = !!flower && Math.hypot(flower.x - this.bee.x, flower.y - this.bee.y) < FLOWER_RADIUS + BEE_RADIUS;

    if (!flower || flower.nectar <= 0 || !stillNear) {
      this.cooldownFlowerId = this.landedFlowerId;
      this.landedFlowerId = null;
      this.mode = 'flying';
      return false;
    }

    const amount = Math.min(flower.nectar, GATHER_PER_SEC * dt);
    flower.nectar -= amount;
    refuel(this.energy, amount);
    refuel(this.pollen, amount);

    if (!this.visitedFlowers.has(flower.id)) {
      this.visitedFlowers.add(flower.id);
      this.onFieldNote?.(flower.fact);
    }
    return true;
  }

  #checkFlowerApproach() {
    for (const flower of this.flowers) {
      const distance = Math.hypot(flower.x - this.bee.x, flower.y - this.bee.y);
      if (distance > DETECT_RADIUS) {
        if (this.cooldownFlowerId === flower.id) this.cooldownFlowerId = null;
        continue;
      }
      if (flower.id === this.cooldownFlowerId || flower.nectar <= 0) continue;

      this.mode = 'prompt';
      this.pendingFlower = flower;
      this.pointerTarget = null;
      this.onLandingPrompt?.(flower);
      return;
    }
  }

  #checkOutcome() {
    const distanceToBurrow = Math.hypot(this.burrow.x - this.bee.x, this.burrow.y - this.bee.y);
    const nearBurrow = distanceToBurrow < this.burrow.radius + BEE_RADIUS;
    const hasEnoughPollen = this.pollen.value >= POLLEN_GOAL;
    this.burrow.unlocked = hasEnoughPollen;

    if (nearBurrow && hasEnoughPollen) {
      this.burrow.discovered = true;
      this.status = 'won';
      this.onComplete?.('won');
    } else if (nearBurrow) {
      if (!this.burrowNoticeShown) {
        this.burrowNoticeShown = true;
        this.onFieldNote?.('Not enough pollen gathered yet — visit more flowers before settling in.');
      }
    } else {
      this.burrowNoticeShown = false;
    }

    if (isDepleted(this.energy)) {
      this.status = 'lost';
      this.onComplete?.('lost');
    }
  }

  /**
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    const { width, height } = this.bounds;

    drawSky(ctx, width, this.horizon, this.elapsed);
    drawTreeline(ctx, width, this.horizon);
    drawMeadow(ctx, width, height, this.horizon, this.grassTufts);
    drawBurrow(ctx, this.burrow, this.elapsed, this.burrow.unlocked);

    for (const flower of this.flowers) {
      const scale = 0.45 + 0.55 * (flower.nectar / FLOWER_BUDGET);
      drawFlower(ctx, flower, scale);
    }

    drawBee(ctx, this.bee.x, this.bee.y, BEE_RADIUS);
  }
}

/**
 * Hand-drawn canvas "sprites" for the meadow scene: sky, clouds, treeline,
 * grass, the nest burrow, and the two forage flowers. Kept separate from
 * game logic so phases stay readable.
 */

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} horizon
 * @param {number} elapsed
 */
export function drawSky(ctx, width, horizon, elapsed) {
  const gradient = ctx.createLinearGradient(0, 0, 0, horizon);
  gradient.addColorStop(0, '#7ec8f7');
  gradient.addColorStop(1, '#d8f0ff');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, horizon);

  ctx.beginPath();
  ctx.arc(width * 0.84, horizon * 0.22, Math.min(width, horizon) * 0.09, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255, 246, 214, 0.95)';
  ctx.fill();

  drawClouds(ctx, width, horizon, elapsed);
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} horizon
 * @param {number} elapsed
 */
function drawClouds(ctx, width, horizon, elapsed) {
  const layout = [
    { x: 0.1, y: 0.24, scale: 1 },
    { x: 0.48, y: 0.14, scale: 0.7 },
    { x: 0.75, y: 0.32, scale: 0.85 },
  ];
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  for (const cloud of layout) {
    const drift = (elapsed * 5 * cloud.scale) % (width + 220);
    const cx = ((cloud.x * width + drift) % (width + 220)) - 110;
    const cy = horizon * cloud.y;
    drawCloudPuff(ctx, cx, cy, 42 * cloud.scale);
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} size
 */
function drawCloudPuff(ctx, x, y, size) {
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.55, 0, 0, Math.PI * 2);
  ctx.ellipse(x - size * 0.65, y + size * 0.18, size * 0.6, size * 0.4, 0, 0, Math.PI * 2);
  ctx.ellipse(x + size * 0.68, y + size * 0.12, size * 0.65, size * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} horizon
 */
export function drawTreeline(ctx, width, horizon) {
  const bandHeight = Math.max(20, horizon * 0.14);
  ctx.fillStyle = '#3c5f3d';
  ctx.beginPath();
  ctx.moveTo(0, horizon);
  const columns = 12;
  for (let i = 0; i <= columns; i++) {
    const x = (i / columns) * width;
    const peak = horizon - bandHeight * (0.55 + 0.45 * Math.abs(Math.sin(i * 1.9)));
    ctx.lineTo(x, peak);
  }
  ctx.lineTo(width, horizon);
  ctx.closePath();
  ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} width
 * @param {number} height
 * @param {number} horizon
 * @param {Array<{ x: number, y: number, scale: number }>} grassTufts
 */
export function drawMeadow(ctx, width, height, horizon, grassTufts) {
  const gradient = ctx.createLinearGradient(0, horizon, 0, height);
  gradient.addColorStop(0, '#8fc76b');
  gradient.addColorStop(1, '#548c4c');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, horizon, width, height - horizon);

  ctx.strokeStyle = 'rgba(45, 82, 43, 0.55)';
  ctx.lineWidth = 2;
  for (const tuft of grassTufts) {
    const gx = tuft.x * width;
    const gy = horizon + tuft.y * (height - horizon);
    const h = 10 * tuft.scale;
    ctx.beginPath();
    ctx.moveTo(gx - 5, gy + 4);
    ctx.lineTo(gx - 2, gy - h);
    ctx.moveTo(gx, gy + 5);
    ctx.lineTo(gx + 1, gy - h * 1.2);
    ctx.moveTo(gx + 5, gy + 4);
    ctx.lineTo(gx + 3, gy - h * 0.9);
    ctx.stroke();
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, radius: number, discovered: boolean }} burrow
 * @param {number} elapsed
 * @param {boolean} unlocked
 */
export function drawBurrow(ctx, burrow, elapsed, unlocked) {
  const pulse = 0.5 + 0.5 * Math.sin(elapsed * 2.4);
  const glowRadius = burrow.radius * (2.2 + 0.35 * pulse);
  const glow = ctx.createRadialGradient(burrow.x, burrow.y, burrow.radius * 0.3, burrow.x, burrow.y, glowRadius);
  const glowColor = unlocked
    ? `rgba(244, 196, 48, ${0.5 * pulse + 0.2})`
    : `rgba(190, 210, 130, ${0.3 * pulse + 0.12})`;
  glow.addColorStop(0, glowColor);
  glow.addColorStop(1, 'rgba(244, 196, 48, 0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(burrow.x, burrow.y, glowRadius, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(burrow.x, burrow.y, burrow.radius * 1.3, burrow.radius * 0.7, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#6b4a30';
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(burrow.x, burrow.y + burrow.radius * 0.08, burrow.radius * 0.7, burrow.radius * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#2b1c10';
  ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ id: string, x: number, y: number }} flower
 * @param {number} scale
 */
export function drawFlower(ctx, flower, scale) {
  if (flower.id === 'willow') {
    drawWillow(ctx, flower.x, flower.y, scale);
  } else {
    drawOregonGrape(ctx, flower.x, flower.y, scale);
  }
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} scale
 */
function drawWillow(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);

  ctx.strokeStyle = '#7a5a3a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(0, 32);
  ctx.lineTo(0, -18);
  ctx.moveTo(0, -6);
  ctx.lineTo(-16, -30);
  ctx.moveTo(0, -12);
  ctx.lineTo(16, -32);
  ctx.stroke();

  drawCatkin(ctx, 0, -20, 22 * scale, 0);
  drawCatkin(ctx, -17, -34, 17 * scale, -0.5);
  drawCatkin(ctx, 17, -36, 16 * scale, 0.5);

  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx
 * @param {number} cy
 * @param {number} length
 * @param {number} angle
 */
function drawCatkin(ctx, cx, cy, length, angle) {
  if (length <= 1) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);
  const width = length * 0.42;
  const gradient = ctx.createLinearGradient(0, -length / 2, 0, length / 2);
  gradient.addColorStop(0, '#efe4b0');
  gradient.addColorStop(1, '#c9b45c');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.ellipse(0, 0, width / 2, length / 2, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.arc(0, (i * length) / 7, width * 0.16, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} scale
 */
function drawOregonGrape(ctx, x, y, scale) {
  ctx.save();
  ctx.translate(x, y);

  drawSpikyLeaf(ctx, -6, 14, -32, 18);
  drawSpikyLeaf(ctx, 6, 14, 32, 18);

  const petalCount = 6;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2;
    const r = 13 * scale;
    const fx = Math.cos(angle) * r;
    const fy = Math.sin(angle) * r * 0.55 - 8;
    drawTinyFlower(ctx, fx, fy, 6.5 * scale);
  }
  drawTinyFlower(ctx, 0, -8, 7.5 * scale);

  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} r
 */
function drawTinyFlower(ctx, x, y, r) {
  if (r <= 0.5) return;
  ctx.fillStyle = '#f2c11d';
  const petals = 6;
  for (let p = 0; p < petals; p++) {
    const angle = (p / petals) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(
      x + Math.cos(angle) * r * 0.6,
      y + Math.sin(angle) * r * 0.6,
      r * 0.5,
      r * 0.28,
      angle,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.fillStyle = '#8a5a12';
  ctx.beginPath();
  ctx.arc(x, y, r * 0.28, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} length
 * @param {number} height
 */
function drawSpikyLeaf(ctx, x, y, length, height) {
  ctx.save();
  ctx.translate(x, y);
  const teeth = 5;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  for (let i = 0; i <= teeth; i++) {
    const t = i / teeth;
    const lx = length * t;
    const ly = -Math.sin(t * Math.PI) * height - (i % 2 === 0 ? 4 : -2);
    ctx.lineTo(lx, ly);
  }
  ctx.lineTo(length, 6);
  ctx.closePath();
  ctx.fillStyle = '#2f5c3a';
  ctx.fill();
  ctx.restore();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} x
 * @param {number} y
 * @param {number} radius
 */
export function drawBee(ctx, x, y, radius) {
  ctx.save();
  ctx.translate(x, y);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.ellipse(-radius * 0.3, -radius * 0.9, radius * 0.7, radius * 0.4, -0.4, 0, Math.PI * 2);
  ctx.ellipse(radius * 0.3, -radius * 0.9, radius * 0.7, radius * 0.4, 0.4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(0, 0, radius, radius * 0.75, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#2b2b2b';
  ctx.fill();

  ctx.fillStyle = '#f4c430';
  ctx.fillRect(-radius * 0.65, -radius * 0.32, radius * 1.3, radius * 0.3);
  ctx.fillRect(-radius * 0.65, radius * 0.05, radius * 1.3, radius * 0.3);

  ctx.restore();
}

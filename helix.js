/* =========================================================
   helix.js — 3D Helical Dual Strand Engine
   Fluid Dynamic Scaling for Laptops & Desktop Monitors
   ========================================================= */

function renderRotatingHelix(canvasId, phaseOffset) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    // Dynamically scales between 140px on small laptops and 240px on wide monitors
    width = Math.min(240, Math.max(140, window.innerWidth * 0.135));
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);
  resize();

  let time = phaseOffset || 0;
  const reduceMotion = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLOR_CYAN = '#41b8cd';
  const COLOR_DARK = '#1e3a6e';
  const COLOR_RUNG = '#243f73';

  function draw() {
    // Skip the heavy work while the canvas is hidden (mobile layout hides it)
    if (!canvas.getClientRects().length) { requestAnimationFrame(draw); return; }
    ctx.clearRect(0, 0, width, height);
    if (!reduceMotion) time += 0.009;

    const centerX = width / 2;
    // Scale helix radius dynamically with canvas width
    const radiusX = Math.min(64, width * 0.32);
    const dy = 4;
    const totalSteps = Math.ceil(height / dy) + 4;

    const strand1 = [];
    const strand2 = [];

    for (let i = 0; i <= totalSteps; i++) {
      const y = i * dy;
      const angle = y * 0.009 + time;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      strand1.push({ x: centerX + radiusX * cosA, y: y, z: sinA });
      strand2.push({ x: centerX - radiusX * cosA, y: y, z: -sinA });
    }

    function drawStrandSegments(points, color, isFrontPass) {
      ctx.save();
      ctx.lineWidth = Math.min(22, Math.max(14, width * 0.11));
      ctx.lineCap = 'round';
      ctx.strokeStyle = color;

      for (let i = 1; i < points.length; i++) {
        const p0 = points[i - 1];
        const p1 = points[i];
        const avgZ = (p0.z + p1.z) / 2;

        if ((isFrontPass && avgZ >= 0) || (!isFrontPass && avgZ < 0)) {
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    const rungInterval = 56;
    const totalRungs = Math.floor(height / rungInterval);

    function drawRung(r) {
      const targetY = r * rungInterval;
      const idx = Math.min(Math.floor(targetY / dy), strand1.length - 1);
      ctx.save();
      ctx.lineWidth = Math.min(11, Math.max(7, width * 0.055));
      ctx.lineCap = 'round';
      ctx.strokeStyle = COLOR_RUNG;
      ctx.beginPath();
      ctx.moveTo(strand1[idx].x, strand1[idx].y);
      ctx.lineTo(strand2[idx].x, strand2[idx].y);
      ctx.stroke();
      ctx.restore();
    }

    drawRung(0);
    drawStrandSegments(strand2, COLOR_DARK, false);
    drawStrandSegments(strand1, COLOR_CYAN, false);
    drawStrandSegments(strand2, COLOR_DARK, true);
    drawStrandSegments(strand1, COLOR_CYAN, true);
    for (let r = 1; r <= totalRungs + 1; r++) drawRung(r);

    requestAnimationFrame(draw);
  }

  draw();
}

function initHelices() {
  renderRotatingHelix('dna-left', 0);
  renderRotatingHelix('dna-right', Math.PI * 0.7);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initHelices);
} else {
  initHelices();
}
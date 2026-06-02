// dot-grid.js

function throttle(func, limit) {
  let lastCall = 0;
  return function (...args) {
    const now = performance.now();
    if (now - lastCall >= limit) {
      lastCall = now;
      func.apply(this, args);
    }
  };
}

function hexToRgb(hex) {
  const m = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (!m) return { r: 0, g: 0, b: 0 };
  return {
    r: parseInt(m[1], 16),
    g: parseInt(m[2], 16),
    b: parseInt(m[3], 16)
  };
}

class DotGrid {
  constructor(container, options = {}) {
    this.wrapper = container;
    this.dotSize = options.dotSize || 16;
    this.gap = options.gap || 32;
    this.baseColor = options.baseColor || '#5227FF';
    this.activeColor = options.activeColor || '#E3FF2C';
    this.proximity = options.proximity || 150;
    this.speedTrigger = options.speedTrigger || 100;
    this.shockRadius = options.shockRadius || 250;
    this.shockStrength = options.shockStrength || 5;
    this.maxSpeed = options.maxSpeed || 5000;
    this.resistance = options.resistance || 750;
    this.returnDuration = options.returnDuration || 1.5;

    this.baseRgb = hexToRgb(this.baseColor);
    this.activeRgb = hexToRgb(this.activeColor);

    this.pointer = { x: 0, y: 0, vx: 0, vy: 0, speed: 0, lastTime: 0, lastX: 0, lastY: 0 };
    this.dots = [];
    this.rafId = null;

    this.init();
  }

  init() {
    this.innerWrap = document.createElement('div');
    this.innerWrap.classList.add('dot-grid__wrap');
    this.innerWrap.style.position = 'absolute';
    this.innerWrap.style.top = '0';
    this.innerWrap.style.left = '0';
    this.innerWrap.style.width = '100%';
    this.innerWrap.style.height = '100%';
    this.wrapper.appendChild(this.innerWrap);

    this.canvas = document.createElement('canvas');
    this.canvas.classList.add('dot-grid__canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.innerWrap.appendChild(this.canvas);
    this.ctx = this.canvas.getContext('2d');

    this.circlePath = new Path2D();
    this.circlePath.arc(0, 0, this.dotSize / 2, 0, Math.PI * 2);

    this.buildGrid = this.buildGrid.bind(this);
    this.draw = this.draw.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onClick = this.onClick.bind(this);

    this.buildGrid();
    
    if ('ResizeObserver' in window) {
      this.ro = new ResizeObserver(this.buildGrid);
      this.ro.observe(this.innerWrap);
    } else {
      window.addEventListener('resize', this.buildGrid);
    }

    this.draw();

    this.throttledMove = throttle(this.onMove, 50);
    window.addEventListener('mousemove', this.throttledMove, { passive: true });
    window.addEventListener('click', this.onClick);
  }

  buildGrid() {
    const { width, height } = this.innerWrap.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;
    this.ctx.scale(dpr, dpr);

    const cols = Math.floor((width + this.gap) / (this.dotSize + this.gap));
    const rows = Math.floor((height + this.gap) / (this.dotSize + this.gap));
    const cell = this.dotSize + this.gap;

    const gridW = cell * cols - this.gap;
    const gridH = cell * rows - this.gap;

    const extraX = width - gridW;
    const extraY = height - gridH;

    const startX = extraX / 2 + this.dotSize / 2;
    const startY = extraY / 2 + this.dotSize / 2;

    this.dots = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cx = startX + x * cell;
        const cy = startY + y * cell;
        this.dots.push({ cx, cy, xOffset: 0, yOffset: 0, _inertiaApplied: false });
      }
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Use an extended proximity zone (2x) for soft outer glow effect
    const softRadius = this.proximity * 2;
    const softRadiusSq = softRadius * softRadius;
    const { x: px, y: py } = this.pointer;

    for (const dot of this.dots) {
      const ox = dot.cx + dot.xOffset;
      const oy = dot.cy + dot.yOffset;
      const dx = dot.cx - px;
      const dy = dot.cy - py;
      const dsq = dx * dx + dy * dy;

      let style = this.baseColor;
      if (dsq <= softRadiusSq) {
        const dist = Math.sqrt(dsq);
        // Smooth cubic easing: strong in center, fades out gradually
        const rawT = 1 - dist / softRadius;
        const t = rawT * rawT * (3 - 2 * rawT); // smoothstep
        const r = Math.round(this.baseRgb.r + (this.activeRgb.r - this.baseRgb.r) * t);
        const g = Math.round(this.baseRgb.g + (this.activeRgb.g - this.baseRgb.g) * t);
        const b = Math.round(this.baseRgb.b + (this.activeRgb.b - this.baseRgb.b) * t);
        style = `rgb(${r},${g},${b})`;
      }

      this.ctx.save();
      this.ctx.translate(ox, oy);
      this.ctx.fillStyle = style;
      this.ctx.fill(this.circlePath);
      this.ctx.restore();
    }

    this.rafId = requestAnimationFrame(this.draw);
  }

  onMove(e) {
    const now = performance.now();
    const pr = this.pointer;
    const dt = pr.lastTime ? now - pr.lastTime : 16;
    const dx = e.clientX - pr.lastX;
    const dy = e.clientY - pr.lastY;
    let vx = (dx / dt) * 1000;
    let vy = (dy / dt) * 1000;
    let speed = Math.hypot(vx, vy);
    if (speed > this.maxSpeed) {
      const scale = this.maxSpeed / speed;
      vx *= scale;
      vy *= scale;
      speed = this.maxSpeed;
    }
    pr.lastTime = now;
    pr.lastX = e.clientX;
    pr.lastY = e.clientY;
    pr.vx = vx;
    pr.vy = vy;
    pr.speed = speed;

    const rect = this.canvas.getBoundingClientRect();
    pr.x = e.clientX - rect.left;
    pr.y = e.clientY - rect.top;

    for (const dot of this.dots) {
      const dist = Math.hypot(dot.cx - pr.x, dot.cy - pr.y);
      if (speed > this.speedTrigger && dist < this.proximity && !dot._inertiaApplied) {
        dot._inertiaApplied = true;
        gsap.killTweensOf(dot);
        const pushX = (dot.cx - pr.x + vx * 0.005) * 0.15;
        const pushY = (dot.cy - pr.y + vy * 0.005) * 0.15;
        
        // Use standard GSAP easing instead of InertiaPlugin to avoid premium plugin requirement
        gsap.to(dot, {
          xOffset: pushX, 
          yOffset: pushY, 
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(dot, {
              xOffset: 0,
              yOffset: 0,
              duration: this.returnDuration,
              ease: 'elastic.out(1,0.75)'
            });
            dot._inertiaApplied = false;
          }
        });
      }
    }
  }

  onClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    for (const dot of this.dots) {
      const dist = Math.hypot(dot.cx - cx, dot.cy - cy);
      if (dist < this.shockRadius && !dot._inertiaApplied) {
        dot._inertiaApplied = true;
        gsap.killTweensOf(dot);
        const falloff = Math.max(0, 1 - dist / this.shockRadius);
        const pushX = (dot.cx - cx) * this.shockStrength * falloff;
        const pushY = (dot.cy - cy) * this.shockStrength * falloff;
        
        gsap.to(dot, {
          xOffset: pushX, 
          yOffset: pushY, 
          duration: 0.4,
          ease: "power2.out",
          onComplete: () => {
            gsap.to(dot, {
              xOffset: 0,
              yOffset: 0,
              duration: this.returnDuration,
              ease: 'elastic.out(1,0.75)'
            });
            dot._inertiaApplied = false;
          }
        });
      }
    }
  }

  destroy() {
    cancelAnimationFrame(this.rafId);
    if (this.ro) this.ro.disconnect();
    else window.removeEventListener('resize', this.buildGrid);
    window.removeEventListener('mousemove', this.throttledMove);
    window.removeEventListener('click', this.onClick);
    this.wrapper.innerHTML = '';
  }
}

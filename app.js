(() => {
  "use strict";

  const cfg = window.ROULETTE_CONFIG;
  const cases = cfg.cases;
  const N = cases.length;
  const TAU = Math.PI * 2;
  const SEG = TAU / N;
  const FONT = '"Arial Black", "Arial Bold", "Liberation Sans", "DejaVu Sans", sans-serif';

  const stage = document.getElementById("stage");
  const wheel = document.getElementById("wheel");
  const wheelCanvas = document.getElementById("wheel-canvas");
  const lights = document.getElementById("lights");
  const pointer = document.getElementById("pointer");
  const result = document.getElementById("result");
  const resultTitle = document.getElementById("result-title");
  const resultMessage = document.getElementById("result-message");

  if (new URLSearchParams(location.search).has("kiosk")) document.body.classList.add("kiosk");

  // ------------------------------------------------------------------
  // Dessin de la roue
  // ------------------------------------------------------------------
  function drawWheel() {
    const size = wheel.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    wheelCanvas.width = Math.round(size * dpr);
    wheelCanvas.height = Math.round(size * dpr);
    const ctx = wheelCanvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = size / 2;
    ctx.translate(r, r);

    for (let i = 0; i < N; i++) {
      const c = cases[i];
      const start = -Math.PI / 2 + i * SEG;
      const end = start + SEG;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, r, start, end);
      ctx.closePath();
      ctx.fillStyle = c.couleur;
      ctx.fill();

      // Reflet lumineux
      const shine = ctx.createRadialGradient(0, 0, r * 0.1, 0, 0, r);
      shine.addColorStop(0, "rgba(255,255,255,0.35)");
      shine.addColorStop(0.6, "rgba(255,255,255,0.05)");
      shine.addColorStop(1, "rgba(0,0,0,0.25)");
      ctx.fillStyle = shine;
      ctx.fill();

      ctx.lineWidth = r * 0.018;
      ctx.strokeStyle = "#fff6d5";
      ctx.stroke();

      // Texte, écrit du centre vers l'extérieur
      ctx.save();
      ctx.rotate(start + SEG / 2);
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const maxWidth = r * 0.54;
      const maxHeight = 2 * r * 0.6 * Math.sin(SEG / 2) * 0.75;
      let fs = r * 0.13;
      ctx.font = `900 ${fs}px ${FONT}`;
      while ((ctx.measureText(c.texte).width > maxWidth || fs > maxHeight) && fs > 8) {
        fs -= 1;
        ctx.font = `900 ${fs}px ${FONT}`;
      }
      ctx.lineJoin = "round";
      ctx.lineWidth = fs * 0.22;
      ctx.strokeStyle = "rgba(0,0,0,0.55)";
      ctx.strokeText(c.texte, r * 0.9, 0);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(c.texte, r * 0.9, 0);
      ctx.restore();
    }

    // Clous dorés entre les cases
    for (let i = 0; i < N; i++) {
      const a = -Math.PI / 2 + i * SEG;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * r * 0.955, Math.sin(a) * r * 0.955, r * 0.025, 0, TAU);
      ctx.fillStyle = "#ffd54f";
      ctx.fill();
      ctx.lineWidth = r * 0.006;
      ctx.strokeStyle = "#8d6e00";
      ctx.stroke();
    }
  }

  function buildLights() {
    const count = 24;
    for (let i = 0; i < count; i++) {
      const b = document.createElement("div");
      b.className = "bulb" + (i % 2 ? " odd" : "");
      b.style.transform = `rotate(${(360 / count) * i}deg) translateY(calc(var(--size) * -0.467))`;
      lights.appendChild(b);
    }
  }

  // ------------------------------------------------------------------
  // Sons (générés, pas de fichier nécessaire)
  // ------------------------------------------------------------------
  const audio = {
    ctx: null,
    lastTick: 0,
    unlock() {
      if (!cfg.son) return;
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    },
    tone(freq, at, dur, type = "square", vol = 0.15, freqEnd) {
      if (!this.ctx) return;
      const t = this.ctx.currentTime + at;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t);
      if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, t + dur);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    },
    tick() {
      const now = performance.now();
      if (now - this.lastTick < 35) return;
      this.lastTick = now;
      this.tone(1500, 0, 0.035, "square", 0.07, 900);
    },
    win() {
      [523, 659, 784, 1047].forEach((f, i) => this.tone(f, i * 0.12, 0.18, "square", 0.12));
      [523, 659, 784, 1047].forEach((f) => this.tone(f, 0.5, 0.9, "triangle", 0.12));
      [1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.55 + i * 0.08, 0.3, "sine", 0.06));
    },
    lose() {
      [392, 370, 349].forEach((f, i) => this.tone(f, i * 0.3, 0.28, "triangle", 0.18));
      this.tone(330, 0.9, 0.8, "triangle", 0.18, 250);
    },
  };

  // ------------------------------------------------------------------
  // Confettis
  // ------------------------------------------------------------------
  const confetti = (() => {
    const canvas = document.getElementById("confetti");
    const ctx = canvas.getContext("2d");
    const colors = ["#ff1744", "#ffea00", "#00e676", "#2979ff", "#ff9100", "#d500f9", "#00e5ff", "#ffffff"];
    let parts = [];
    let running = false;

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burst(x, y, count, spread, power, dirAngle) {
      const s = Math.min(innerWidth, innerHeight);
      for (let i = 0; i < count; i++) {
        const a = dirAngle + (Math.random() - 0.5) * spread;
        const v = power * s * (0.4 + Math.random() * 0.6);
        parts.push({
          x, y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          w: s * (0.008 + Math.random() * 0.012),
          h: s * (0.004 + Math.random() * 0.008),
          rot: Math.random() * TAU,
          vrot: (Math.random() - 0.5) * 12,
          wobble: Math.random() * TAU,
          color: colors[(Math.random() * colors.length) | 0],
          round: Math.random() < 0.3,
          life: 0,
        });
      }
      if (!running) {
        running = true;
        last = performance.now();
        requestAnimationFrame(loop);
      }
    }

    let last = 0;
    function loop(now) {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = Math.min(innerWidth, innerHeight) * 1.1;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.y < innerHeight + 50 && p.life < 8);
      for (const p of parts) {
        p.life += dt;
        p.vx *= 1 - 1.2 * dt;
        p.vy = p.vy * (1 - 1.2 * dt) + g * dt;
        p.wobble += dt * 8;
        p.x += (p.vx + Math.sin(p.wobble) * 30) * dt;
        p.y += p.vy * dt;
        p.rot += p.vrot * dt;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, Math.cos(p.wobble));
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.arc(0, 0, p.h, 0, TAU);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        ctx.restore();
      }
      if (parts.length) requestAnimationFrame(loop);
      else running = false;
    }

    function explode() {
      const W = innerWidth, H = innerHeight;
      burst(W / 2, H / 2, 220, TAU, 2.2, 0);                          // explosion centrale
      setTimeout(() => {
        burst(0, H, 120, 0.6, 2.6, -Math.PI / 3);                      // canon gauche
        burst(W, H, 120, 0.6, 2.6, -Math.PI * 2 / 3);                  // canon droit
      }, 250);
      setTimeout(() => burst(W / 2, H / 3, 160, TAU, 1.8, 0), 700);   // 2e explosion
      setTimeout(() => {
        burst(W * 0.25, H * 0.4, 90, TAU, 1.5, 0);
        burst(W * 0.75, H * 0.4, 90, TAU, 1.5, 0);
      }, 1200);
    }

    resize();
    addEventListener("resize", resize);
    return { explode };
  })();

  // ------------------------------------------------------------------
  // Rotation
  // ------------------------------------------------------------------
  let angle = 0;
  let spinning = false;
  let showingResult = false;
  let resultShownAt = 0;

  function pickIndex() {
    const weights = cases.map((c) => (c.poids == null ? 1 : Math.max(0, c.poids)));
    const total = weights.reduce((a, b) => a + b, 0);
    let x = Math.random() * total;
    for (let i = 0; i < N; i++) {
      x -= weights[i];
      if (x < 0) return i;
    }
    return N - 1;
  }

  // Index de la case sous l'indicateur (en haut) pour un angle de roue donné
  function indexAt(a) {
    const p = (((-a) % TAU) + TAU) % TAU;
    return Math.floor(p / SEG) % N;
  }

  function kickPointer() {
    if (pointer.animate) {
      pointer.animate(
        [{ transform: "rotate(-22deg)" }, { transform: "rotate(0deg)" }],
        { duration: 140, easing: "ease-out" }
      );
    }
  }

  function spin() {
    if (spinning || showingResult) return;
    audio.unlock();
    spinning = true;
    document.body.classList.add("spinning");

    const idx = pickIndex();
    const jitter = (Math.random() - 0.5) * SEG * 0.7;           // ne s'arrête pas toujours au centre de la case
    const targetPos = idx * SEG + SEG / 2 + jitter;
    const targetMod = (((TAU - targetPos) % TAU) + TAU) % TAU;
    const curMod = ((angle % TAU) + TAU) % TAU;
    const delta = (((targetMod - curMod) % TAU) + TAU) % TAU;
    const from = angle;
    const to = angle + (cfg.tours || 6) * TAU + delta;
    const duration = (cfg.dureeSecondes || 5) * 1000;
    const t0 = performance.now();
    let lastIdx = indexAt(angle);

    function frame(now) {
      const t = Math.min(1, (now - t0) / duration);
      const e = 1 - Math.pow(1 - t, 4);
      angle = from + (to - from) * e;
      wheel.style.transform = `rotate(${angle}rad)`;
      const cur = indexAt(angle);
      if (cur !== lastIdx) {
        lastIdx = cur;
        audio.tick();
        kickPointer();
      }
      if (t < 1) requestAnimationFrame(frame);
      else finish(idx);
    }
    requestAnimationFrame(frame);
  }

  function finish(idx) {
    spinning = false;
    document.body.classList.remove("spinning");
    const c = cases[idx];
    setTimeout(() => {
      showingResult = true;
      resultShownAt = performance.now();
      resultTitle.textContent = c.gagnant ? "BRAVO !" : "DOMMAGE !";
      resultMessage.textContent = c.message;
      result.classList.toggle("lose", !c.gagnant);
      result.classList.remove("hidden");
      if (c.gagnant) {
        document.body.classList.add("celebrate");
        confetti.explode();
        audio.win();
      } else {
        audio.lose();
      }
    }, 350);
  }

  function closeResult() {
    if (!showingResult || performance.now() - resultShownAt < 1000) return;
    showingResult = false;
    result.classList.add("hidden");
    document.body.classList.remove("celebrate");
  }

  // ------------------------------------------------------------------
  // Événements
  // ------------------------------------------------------------------
  stage.addEventListener("pointerdown", (e) => { e.preventDefault(); spin(); });
  result.addEventListener("pointerdown", (e) => { e.preventDefault(); closeResult(); });
  addEventListener("keydown", (e) => {
    if (e.code === "Space" || e.code === "Enter") {
      e.preventDefault();
      if (showingResult) closeResult();
      else spin();
    }
  });
  addEventListener("contextmenu", (e) => e.preventDefault());

  buildLights();
  drawWheel();
  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(drawWheel, 100);
  });
})();

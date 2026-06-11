/* ═══════════════════════════════════════════════════════════
   AURIS — script.js
   Handles: particles, scroll reveal, parallax, navbar, mobile menu
═══════════════════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── NAVBAR ──────────────────────────────────────────── */
  const navbar = document.getElementById("navbar");
  const hamburger = document.querySelector(".hamburger");
  const navLinks = document.querySelector(".nav-links");

  window.addEventListener("scroll", () => {
    navbar.classList.toggle("scrolled", window.scrollY > 40);
  }, { passive: true });

  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("mobile-open");
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      hamburger.classList.remove("open");
      navLinks.classList.remove("mobile-open");
    });
  });

  /* ── SCROLL REVEAL ───────────────────────────────────── */
  const revealEls = document.querySelectorAll(".reveal");
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const delay = el.dataset.delay ? parseInt(el.dataset.delay) : 0;
      setTimeout(() => el.classList.add("visible"), delay);
      revealObserver.unobserve(el);
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── HERO CONTENT REVEAL (immediate) ────────────────── */
  window.addEventListener("load", () => {
    const heroContent = document.querySelector(".hero-content");
    if (heroContent) {
      setTimeout(() => heroContent.classList.add("visible"), 300);
    }
  });

  /* ── PARTICLE CANVAS ─────────────────────────────────── */
  const canvas  = document.getElementById("particle-canvas");
  const ctx     = canvas.getContext("2d");

  let W, H, particles = [];

  function resizeCanvas() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas, { passive: true });

  /* Particle constructor */
  function Particle() {
    this.reset = function () {
      this.x  = Math.random() * W;
      this.y  = Math.random() * H;
      this.r  = Math.random() * 1.8 + 0.3;
      this.vx = (Math.random() - 0.5) * 0.25;
      this.vy = -(Math.random() * 0.5 + 0.15);
      this.life   = 0;
      this.maxLife= Math.random() * 200 + 120;
      /* blue-white palette */
      const hue = Math.random() > 0.6 ? 220 : 210;
      const sat = 70 + Math.random() * 30;
      this.color = `hsla(${hue},${sat}%,72%,`;
    };
    this.reset();
    /* scatter initial ages */
    this.life = Math.random() * this.maxLife;
  }

  Particle.prototype.update = function () {
    this.x += this.vx;
    this.y += this.vy;
    this.life++;
    if (this.life >= this.maxLife) this.reset();
  };

  Particle.prototype.draw = function () {
    const progress = this.life / this.maxLife;
    /* fade in + fade out */
    const alpha = progress < 0.1
      ? progress / 0.1
      : progress > 0.8
        ? 1 - (progress - 0.8) / 0.2
        : 1;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.color + (alpha * 0.7) + ")";
    ctx.fill();
  };

  const PARTICLE_COUNT = 90;
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  let animId;
  function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    animId = requestAnimationFrame(loop);
  }

  /* Pause particles when hero leaves viewport to save GPU */
  const heroSection = document.getElementById("hero");
  const heroObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      if (!animId) loop();
    } else {
      cancelAnimationFrame(animId);
      animId = null;
    }
  }, { threshold: 0 });
  heroObserver.observe(heroSection);
  loop();

  /* ── PARALLAX (showcase section) ────────────────────── */
  const parallaxSection = document.querySelector(".parallax-section");

  if (parallaxSection && window.matchMedia("(min-width: 768px)").matches) {
    window.addEventListener("scroll", () => {
      const rect   = parallaxSection.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      const shift  = center * 0.06;
      parallaxSection.style.backgroundPositionY = `calc(50% + ${shift}px)`;

      const rings = parallaxSection.querySelectorAll(".centerpiece-ring");
      rings.forEach((r, i) => {
        r.style.transform = `scale(${1 + i * 0.05}) translateY(${-shift * (i + 1) * 0.3}px)`;
      });
    }, { passive: true });
  }

  /* ── SMOOTH ANCHOR SCROLL ────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", e => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset = navbar.offsetHeight + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* ── GLASS CARD TILT (showcase) ──────────────────────── */
  document.querySelectorAll(".glass-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      card.style.transform = `perspective(600px) rotateY(${dx * 6}deg) rotateX(${-dy * 6}deg) translateY(-8px) scale(1.02)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  /* ── FEATURE CARD LIGHT TRAIL ────────────────────────── */
  document.querySelectorAll(".feature-card").forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty("--mx", `${x}%`);
      card.style.setProperty("--my", `${y}%`);
      card.style.background =
        `radial-gradient(circle at ${x}% ${y}%, rgba(37,99,235,0.12) 0%, var(--c-surface) 60%)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.background = "";
    });
  });

})();

"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";

// mango, as an rgb triple so it can be dropped into rgba(...) at varying opacity
const PARTICLE_COLOR = "255, 194, 44";
const LINE_MAX_DISTANCE = 140;

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

function particleCountFor(width: number) {
  if (width < 640) return 26;
  if (width < 1024) return 42;
  return 64;
}

/**
 * A single canvas, mounted once at the root layout, that persists across
 * every navigation (root layout.tsx never remounts). Deliberately hand
 * -rolled instead of pulling in a particles library: this needs to run
 * continuously, on every page, for as long as the tab is open, so a small
 * amount of precisely-tuned code beats a general-purpose library's
 * overhead and default config surface.
 *
 * Sits behind all real content via plain DOM order (painted first, before
 * `children`, with no z-index needed) rather than negative z-index tricks
 * against an ancestor's background-color, which is fragile across browsers.
 */
export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let animationFrame = 0;
    let isVisible = true;

    function createParticles() {
      const count = particleCountFor(width);
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height);

      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, 1.6, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(${PARTICLE_COLOR}, 0.55)`;
        ctx!.fill();
      }

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINE_MAX_DISTANCE) {
            const opacity = 0.15 * (1 - dist / LINE_MAX_DISTANCE);
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.strokeStyle = `rgba(${PARTICLE_COLOR}, ${opacity})`;
            ctx!.lineWidth = 1;
            ctx!.stroke();
          }
        }
      }
    }

    function step() {
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }
      drawFrame();
      if (isVisible) animationFrame = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);

    function handleVisibilityChange() {
      isVisible = document.visibilityState === "visible";
      if (isVisible && !prefersReducedMotion) {
        animationFrame = requestAnimationFrame(step);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Reduced motion: draw the network once, statically, rather than
    // skipping it entirely — keeps the decorative pattern without motion.
    if (prefersReducedMotion) {
      drawFrame();
    } else {
      animationFrame = requestAnimationFrame(step);
    }

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0"
    />
  );
}

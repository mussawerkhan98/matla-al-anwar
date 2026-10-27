import { useEffect, useRef } from "react";

type Flake = {
  x: number;
  y: number;
  size: number;
  speed: number;
  drift: number;
  driftPhase: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
};

/**
 * Builds one normalized (unit-size) six-armed snowflake path, reused for
 * every flake. Reusing a single Path2D and transforming the canvas per
 * flake (translate/rotate/scale) is far cheaper than rebuilding a
 * branching path from scratch every frame for every flake.
 */
function buildSnowflakePath(): Path2D {
  const path = new Path2D();
  const armLen = 1;
  const branchLen = 0.42;
  const branchAngle = 0.7; // radians, ~40°
  const branchPoints = [0.45, 0.75];

  const rot = (x: number, y: number, angle: number): [number, number] => [
    x * Math.cos(angle) - y * Math.sin(angle),
    x * Math.sin(angle) + y * Math.cos(angle),
  ];

  for (let i = 0; i < 6; i++) {
    const armAngle = (Math.PI / 3) * i;
    const [tipX, tipY] = rot(armLen, 0, armAngle);
    path.moveTo(0, 0);
    path.lineTo(tipX, tipY);

    for (const frac of branchPoints) {
      const [bx, by] = rot(armLen * frac, 0, armAngle);
      for (const sign of [1, -1]) {
        const [ex, ey] = rot(
          armLen * frac + branchLen * Math.cos(sign * branchAngle),
          branchLen * Math.sin(sign * branchAngle),
          armAngle,
        );
        path.moveTo(bx, by);
        path.lineTo(ex, ey);
      }
    }
  }
  return path;
}

/**
 * Lightweight canvas snowfall effect for the homepage hero, styled as
 * proper branching snowflake icons (not plain dots).
 * - Purely decorative: sits behind the headline text, in front of the
 *   hero photo + gradient overlay (see z-index stacking in Hero()).
 * - Performance-conscious: one shared Path2D snowflake shape is reused
 *   for every flake (just transformed per-flake), particle count scales
 *   down on narrow viewports, the animation pauses when the tab isn't
 *   visible, and it never renders at all for prefers-reduced-motion users.
 * - Depth illusion: smaller/farther flakes are fainter and fall slower;
 *   larger/closer flakes are more opaque and faster, each drifting and
 *   slowly tumbling on its own.
 */
export function HeroSnowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const snowflakePath = buildSnowflakePath();
    const SNOW_COLOR = "#7FD8FF"; // brand-aligned sky blue

    let width = 0;
    let height = 0;
    let flakes: Flake[] = [];
    let rafId: number | null = null;
    let running = true;

    function flakeCount(w: number) {
      // Fewer, bigger icon-style flakes than a plain-dot effect needs —
      // keeps per-frame drawing cheap while still reading as "snowy".
      if (w < 480) return 16;
      if (w < 900) return 26;
      return 40;
    }

    function makeFlake(w: number, h: number, seedY?: number): Flake {
      const size = 5 + Math.random() * 6; // 5–11px "radius"
      const depth = (size - 5) / 6; // 0 (far) .. 1 (close)
      return {
        x: Math.random() * w,
        y: seedY ?? Math.random() * h,
        size,
        speed: 10 + depth * 22,
        drift: 8 + Math.random() * 18,
        driftPhase: Math.random() * Math.PI * 2,
        opacity: 0.35 + depth * 0.45,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.5,
      };
    }

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.max(1, Math.floor(width * dpr));
      canvas!.height = Math.max(1, Math.floor(height * dpr));
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = flakeCount(width);
      if (flakes.length === 0) {
        flakes = Array.from({ length: target }, () => makeFlake(width, height));
      } else if (flakes.length < target) {
        flakes = flakes.concat(
          Array.from({ length: target - flakes.length }, () => makeFlake(width, height)),
        );
      } else if (flakes.length > target) {
        flakes = flakes.slice(0, target);
      }
    }

    let lastT = performance.now();
    function frame(t: number) {
      if (!running) return;
      const dt = Math.min(0.05, (t - lastT) / 1000);
      lastT = t;

      ctx!.clearRect(0, 0, width, height);
      ctx!.strokeStyle = SNOW_COLOR;
      ctx!.lineCap = "round";
      ctx!.lineJoin = "round";

      for (const f of flakes) {
        f.y += f.speed * dt;
        f.driftPhase += dt * 0.6;
        f.rotation += f.rotationSpeed * dt;
        const x = f.x + Math.sin(f.driftPhase) * f.drift * 0.05;

        if (f.y - f.size > height) {
          f.y = -f.size;
          f.x = Math.random() * width;
        }

        ctx!.save();
        ctx!.translate(x, f.y);
        ctx!.rotate(f.rotation);
        ctx!.scale(f.size, f.size);
        ctx!.globalAlpha = f.opacity;
        ctx!.lineWidth = 0.16;
        ctx!.stroke(snowflakePath);
        ctx!.restore();
      }
      ctx!.globalAlpha = 1;

      rafId = requestAnimationFrame(frame);
    }

    function handleVisibility() {
      if (document.hidden) {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
      } else if (!running) {
        running = true;
        lastT = performance.now();
        rafId = requestAnimationFrame(frame);
      }
    }

    resize();
    lastT = performance.now();
    rafId = requestAnimationFrame(frame);

    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full"
    />
  );
}

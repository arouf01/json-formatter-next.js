import * as React from "react";

/**
 * Soft circular glow that trails the cursor with eased interpolation, tinted
 * with the active brand color via `--primary` (retints instantly with the Theme
 * Color Picker / hourly rotation).
 *
 * Layering: rendered as a viewport overlay with `pointer-events-none` at a
 * z-index ABOVE page content but BELOW the fixed controls, so it is always
 * visible, never blocks clicks, and never sits over the fixed UI. Its opacity
 * is low enough that text under it stays perfectly readable.
 *
 * Performance: one rAF loop lerps toward the target and parks itself when
 * settled; movement is a GPU-composited `translate3d` on a `will-change` layer
 * and the blur is static → 60 FPS. Disabled on touch/coarse pointers and when
 * reduced-motion is requested.
 */
export function CursorSpotlight() {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;

    const el = ref.current;
    if (!el) return;

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let curX = targetX;
    let curY = targetY;
    let raf = 0;
    let visible = false;

    const tick = () => {
      const dx = targetX - curX;
      const dy = targetY - curY;
      curX += dx * 0.14;
      curY += dy * 0.14;
      el.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      raf =
        Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5
          ? requestAnimationFrame(tick)
          : 0;
    };

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        el.style.opacity = "1";
      }
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const hide = () => {
      el.style.opacity = "0";
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("mouseleave", hide);
    window.addEventListener("blur", hide);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("mouseleave", hide);
      window.removeEventListener("blur", hide);
    };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 overflow-hidden"
      aria-hidden
    >
      <div
        ref={ref}
        className="absolute left-[-150px] top-[-150px] h-[300px] w-[300px] rounded-full opacity-0 transition-opacity duration-500 will-change-transform"
        style={{
          // ~300px soft brand glow, peak opacity ~12% (within the 8–15% band).
          background:
            "radial-gradient(circle, hsl(var(--primary) / 0.12) 0%, hsl(var(--primary) / 0.05) 45%, transparent 72%)",
          filter: "blur(20px)",
        }}
      />
    </div>
  );
}

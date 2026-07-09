/**
 * Subtle, brand-tinted background wash rendered behind ALL page content, so
 * the app isn't flat in light mode (and gets gentle depth in dark mode too). It
 * reads `--primary-*`, so it retints with the Theme Color Picker / hourly
 * rotation. Sits at the very back (`-z-20`, behind the cursor spotlight) and is
 * purely decorative.
 */
export function SiteBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-90 dark:opacity-70"
        style={{
          backgroundImage: `
            radial-gradient(55% 45% at 12% -5%, hsl(var(--primary-h) var(--primary-s) 58% / 0.08) 0%, transparent 55%),
            radial-gradient(50% 45% at 100% 8%, hsl(var(--primary-h) var(--primary-s) 55% / 0.07) 0%, transparent 55%),
            radial-gradient(60% 55% at 50% 110%, hsl(var(--primary-h) var(--primary-s) 62% / 0.06) 0%, transparent 55%)
          `,
        }}
      />
    </div>
  );
}

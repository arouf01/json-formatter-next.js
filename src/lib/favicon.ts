/**
 * Live, brand-colored favicon. Draws the JSON "{ }" glyph on a canvas filled
 * with the active brand color and swaps the <link rel="icon"> href, so the
 * browser-tab icon retints along with the theme (hourly rotation or manual
 * pick). Falls back silently if canvas isn't available.
 */

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Build a PNG data URL for the favicon in the given brand hex. */
export function faviconDataUrl(hex: string): string | null {
  if (typeof document === "undefined") return null;
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // Brand-filled rounded square.
  ctx.fillStyle = hex;
  roundRect(ctx, 0, 0, size, size, 14);
  ctx.fill();

  // White "{ }" braces — matches the header's JSON braces mark.
  ctx.fillStyle = "#ffffff";
  ctx.font =
    "bold 38px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("{ }", size / 2, size / 2 + 3);

  return canvas.toDataURL("image/png");
}

/** Draw the favicon for `hex` and install it as the tab icon. */
export function updateFavicon(hex: string) {
  const url = faviconDataUrl(hex);
  if (!url) return;
  let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  link.href = url;
}

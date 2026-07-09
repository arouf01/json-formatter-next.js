import { useEffect } from "react";
import { hexToHsl } from "@/lib/theme";
import { useThemeControl } from "@/components/ThemeProvider";

/**
 * Regenerates the favicon from the active brand color whenever the theme color
 * changes (hourly rotation, picker, or custom hex). The JSON "{ }" braces mark
 * mirrors the header logo, but its gradient stops are derived live from the
 * current `--primary` hue so the tab icon always matches the site.
 */
const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;

function faviconSvg(hex: string): string {
  const [h, s, l] = hexToHsl(hex);
  const light = hsl(h, s, Math.min(l + 12, 82));
  const dark = hsl(h, s, Math.max(l - 22, 26));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100" fill="none">
  <defs><linearGradient id="fav" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
    <stop stop-color="${light}"/><stop offset="1" stop-color="${dark}"/>
  </linearGradient></defs>
  <rect x="6" y="6" width="88" height="88" rx="22" fill="url(#fav)"/>
  <path d="M48 22 C40 22 40 30 40 38 C40 46 34 50 26 50 C34 50 40 54 40 62 C40 70 40 78 48 78" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M52 22 C60 22 60 30 60 38 C60 46 66 50 74 50 C66 50 60 54 60 62 C60 70 60 78 52 78" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
}

const DynamicFavicon = () => {
  const { primaryHex } = useThemeControl();

  useEffect(() => {
    const href =
      "data:image/svg+xml," + encodeURIComponent(faviconSvg(primaryHex));
    let link = document.querySelector<HTMLLinkElement>(
      'link[rel="icon"][type="image/svg+xml"]',
    );
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/svg+xml";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [primaryHex]);

  return null;
};

export default DynamicFavicon;

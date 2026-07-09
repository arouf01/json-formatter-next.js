import * as React from "react";
import {
  DEFAULT_HEX,
  KEYS,
  autoHex,
  autoMode,
  hexToHsl,
  isLightColor,
  type Mode,
} from "@/lib/theme";

type ThemeControl = {
  mode: Mode;
  isDark: boolean;
  primaryHex: string;
  /** True while the light/dark mode still follows the clock. */
  modeAuto: boolean;
  /** True while the brand color still rotates hourly. */
  colorAuto: boolean;
  mounted: boolean;
  setMode: (m: Mode) => void;
  toggleTheme: () => void;
  setPrimary: (hex: string) => void;
  reset: () => void;
};

const Ctx = React.createContext<ThemeControl | null>(null);

export function useThemeControl(): ThemeControl {
  const c = React.useContext(Ctx);
  if (!c) throw new Error("useThemeControl must be used within ThemeProvider");
  return c;
}

/* ── storage (localStorage, cookie fallback) ────────────────────────────── */
function read(key: string): string | null {
  try {
    const v = localStorage.getItem(key);
    if (v != null) return v;
  } catch {
    /* blocked */
  }
  const m = document.cookie.match(new RegExp(`(?:^|; )${key}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}
function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    document.cookie = `${key}=${encodeURIComponent(value)};path=/;max-age=31536000;samesite=lax`;
  }
}
function remove(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
  document.cookie = `${key}=;path=/;max-age=0;samesite=lax`;
}

/* ── DOM application ─────────────────────────────────────────────────────── */
let transitionTimer: ReturnType<typeof setTimeout> | undefined;
function apply(hex: string, mode: Mode, animate: boolean) {
  const el = document.documentElement;
  if (animate) {
    el.classList.add("theme-transition");
    clearTimeout(transitionTimer);
    transitionTimer = setTimeout(
      () => el.classList.remove("theme-transition"),
      260,
    );
  }
  const [h, s, l] = hexToHsl(hex);
  el.style.setProperty("--primary-h", String(h));
  el.style.setProperty("--primary-s", `${s}%`);
  el.style.setProperty("--primary-l", `${l}%`);
  el.style.setProperty(
    "--primary-foreground",
    isLightColor(hex) ? "216 40% 14%" : "0 0% 100%",
  );
  el.classList.toggle("dark", mode === "dark");
  el.style.colorScheme = mode;
  // Browser chrome / social preview color follows the active brand color.
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", hex);
  // The favicon retints via the <DynamicFavicon> component (reacts to primaryHex).
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [mode, setModeState] = React.useState<Mode>("dark");
  const [primaryHex, setPrimaryHex] = React.useState<string>(DEFAULT_HEX);
  const [modeAuto, setModeAuto] = React.useState(true);
  const [colorAuto, setColorAuto] = React.useState(true);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  // Latest values for the hourly timer closure (avoids stale reads).
  const stateRef = React.useRef({ hex: primaryHex, mode, modeAuto, colorAuto });
  stateRef.current = { hex: primaryHex, mode, modeAuto, colorAuto };

  // Advance whichever aspect is still automatic, exactly on each hour boundary,
  // without a page refresh.
  const scheduleAuto = React.useCallback(() => {
    clearTimeout(timer.current);
    const st = stateRef.current;
    if (!st.modeAuto && !st.colorAuto) return; // nothing automatic → no timer
    const now = new Date();
    const msToNextHour =
      (60 - now.getMinutes()) * 60000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds() +
      50;
    timer.current = setTimeout(() => {
      const s = stateRef.current;
      const nextHex = s.colorAuto ? autoHex() : s.hex;
      const nextMode = s.modeAuto ? autoMode() : s.mode;
      apply(nextHex, nextMode, true);
      setPrimaryHex(nextHex);
      setModeState(nextMode);
      scheduleAuto();
    }, msToNextHour);
  }, []);

  // Initialize from storage on mount (FOUC script already painted the DOM).
  React.useEffect(() => {
    const mAuto = read(KEYS.modeAuto) !== "false";
    const cAuto = read(KEYS.colorAuto) !== "false";
    const hex = cAuto ? autoHex() : read(KEYS.color) || DEFAULT_HEX;
    const m: Mode = mAuto
      ? autoMode()
      : (read(KEYS.mode) as Mode) || "dark";

    setPrimaryHex(hex);
    setModeState(m);
    setModeAuto(mAuto);
    setColorAuto(cAuto);
    setMounted(true);
    scheduleAuto();

    // Re-sync when returning to a backgrounded tab (may have crossed an hour).
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      const s = stateRef.current;
      if (!s.modeAuto && !s.colorAuto) return;
      const nextHex = s.colorAuto ? autoHex() : s.hex;
      const nextMode = s.modeAuto ? autoMode() : s.mode;
      apply(nextHex, nextMode, true);
      setPrimaryHex(nextHex);
      setModeState(nextMode);
      scheduleAuto();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [scheduleAuto]);

  // Fix the MODE only. Color automation is left untouched (Rule 2).
  const setMode = React.useCallback(
    (m: Mode) => {
      write(KEYS.modeAuto, "false");
      write(KEYS.mode, m);
      setModeAuto(false);
      setModeState(m);
      apply(stateRef.current.hex, m, true);
      scheduleAuto(); // reschedule (color may still be auto)
    },
    [scheduleAuto],
  );

  const toggleTheme = React.useCallback(
    () => setMode(mode === "dark" ? "light" : "dark"),
    [setMode, mode],
  );

  // Fix the COLOR only. Mode automation is left untouched (Rule 3).
  const setPrimary = React.useCallback(
    (hex: string) => {
      write(KEYS.colorAuto, "false");
      write(KEYS.color, hex);
      setColorAuto(false);
      setPrimaryHex(hex);
      apply(hex, stateRef.current.mode, true);
      scheduleAuto(); // reschedule (mode may still be auto)
    },
    [scheduleAuto],
  );

  // Clear everything → both automations back on (Rule 5).
  const reset = React.useCallback(() => {
    remove(KEYS.modeAuto);
    remove(KEYS.colorAuto);
    remove(KEYS.mode);
    remove(KEYS.color);
    remove(KEYS.legacyAuto);
    const hex = autoHex();
    const m = autoMode();
    setColorAuto(true);
    setModeAuto(true);
    setPrimaryHex(hex);
    setModeState(m);
    apply(hex, m, true);
    scheduleAuto();
  }, [scheduleAuto]);

  const value: ThemeControl = {
    mode,
    isDark: mode === "dark",
    primaryHex,
    modeAuto,
    colorAuto,
    mounted,
    setMode,
    toggleTheme,
    setPrimary,
    reset,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

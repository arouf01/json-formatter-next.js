import * as React from "react";
import {
  DEFAULT_HEX,
  KEYS,
  autoState,
  hexToHsl,
  isLightColor,
  type Mode,
} from "@/lib/theme";

type ThemeControl = {
  mode: Mode;
  isDark: boolean;
  primaryHex: string;
  isAuto: boolean;
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
      360,
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
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const [mode, setModeState] = React.useState<Mode>("dark");
  const [primaryHex, setPrimaryHex] = React.useState<string>(DEFAULT_HEX);
  const [isAuto, setIsAuto] = React.useState(true);
  const timer = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  // Advance the automatic theme exactly on each hour boundary, without a refresh.
  const scheduleAuto = React.useCallback(() => {
    clearTimeout(timer.current);
    const now = new Date();
    const msToNextHour =
      (60 - now.getMinutes()) * 60000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds() +
      50;
    timer.current = setTimeout(() => {
      const { hex, mode: m } = autoState();
      apply(hex, m, true);
      setPrimaryHex(hex);
      setModeState(m);
      scheduleAuto();
    }, msToNextHour);
  }, []);

  // Initialize from storage on mount (FOUC script already painted the DOM).
  React.useEffect(() => {
    const auto = read(KEYS.auto) !== "false";
    if (auto) {
      const { hex, mode: m } = autoState();
      setPrimaryHex(hex);
      setModeState(m);
      setIsAuto(true);
      scheduleAuto();
    } else {
      setPrimaryHex(read(KEYS.color) || DEFAULT_HEX);
      setModeState((read(KEYS.mode) as Mode) || "dark");
      setIsAuto(false);
    }
    setMounted(true);

    // Re-sync when returning to a backgrounded tab (may have crossed an hour).
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (read(KEYS.auto) === "false") return;
      const { hex, mode: m } = autoState();
      apply(hex, m, true);
      setPrimaryHex(hex);
      setModeState(m);
      scheduleAuto();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timer.current);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [scheduleAuto]);

  // Any manual change freezes BOTH aspects and disables automation.
  const goManual = React.useCallback((hex: string, m: Mode) => {
    clearTimeout(timer.current);
    write(KEYS.auto, "false");
    write(KEYS.color, hex);
    write(KEYS.mode, m);
    apply(hex, m, true);
    setPrimaryHex(hex);
    setModeState(m);
    setIsAuto(false);
  }, []);

  const setPrimary = React.useCallback(
    (hex: string) => goManual(hex, mode),
    [goManual, mode],
  );
  const setMode = React.useCallback(
    (m: Mode) => goManual(primaryHex, m),
    [goManual, primaryHex],
  );
  const toggleTheme = React.useCallback(
    () => setMode(mode === "dark" ? "light" : "dark"),
    [setMode, mode],
  );

  const reset = React.useCallback(() => {
    remove(KEYS.auto);
    remove(KEYS.color);
    remove(KEYS.mode);
    const { hex, mode: m } = autoState();
    apply(hex, m, true);
    setPrimaryHex(hex);
    setModeState(m);
    setIsAuto(true);
    scheduleAuto();
  }, [scheduleAuto]);

  const value: ThemeControl = {
    mode,
    isDark: mode === "dark",
    primaryHex,
    isAuto,
    mounted,
    setMode,
    toggleTheme,
    setPrimary,
    reset,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

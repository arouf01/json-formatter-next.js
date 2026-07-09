import { useThemeControl } from "@/components/ThemeProvider";

/**
 * Backward-compatible theme hook. The real state now lives in the A1 smart
 * `ThemeProvider` (auto day/night mode + hourly brand rotation, or a manual
 * choice once the visitor picks one). This just exposes the light/dark slice
 * the existing UI expects; toggling flips to a manual choice and disables the
 * automation, exactly like A1's theme toggle.
 */
export function useTheme() {
  const { isDark, toggleTheme } = useThemeControl();
  return { isDark, toggleTheme };
}

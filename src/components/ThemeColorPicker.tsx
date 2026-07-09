import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Palette, RotateCcw, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { PALETTES } from "@/lib/theme";
import { useThemeControl } from "@/components/ThemeProvider";

export function ThemeColorPicker() {
  const { primaryHex, isAuto, mounted, setPrimary, reset } = useThemeControl();
  const [open, setOpen] = React.useState(false);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            role="dialog"
            aria-label="Theme color picker"
            className="mb-3 w-72 rounded-2xl border border-border bg-popover p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold">Theme color</h2>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              {isAuto ? (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  Auto — rotates hourly, light by day / dark by night
                </>
              ) : (
                "Custom — saved on this device"
              )}
            </p>

            <div className="mt-4 grid grid-cols-7 gap-2">
              {PALETTES.map((p) => {
                const active =
                  !isAuto && primaryHex.toLowerCase() === p.hex.toLowerCase();
                return (
                  <button
                    key={p.hex}
                    onClick={() => setPrimary(p.hex)}
                    aria-label={p.name}
                    aria-pressed={active}
                    title={p.name}
                    style={{ backgroundColor: p.hex }}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-full ring-offset-2 ring-offset-popover transition-transform hover:scale-110",
                      active && "ring-2 ring-foreground",
                    )}
                  >
                    {active && <Check className="h-3.5 w-3.5 text-white" />}
                  </button>
                );
              })}
            </div>

            <label className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/40 p-2.5 text-sm">
              <span className="font-medium text-muted-foreground">Custom</span>
              <span className="flex items-center gap-2">
                <span className="font-mono text-xs uppercase">{primaryHex}</span>
                <input
                  type="color"
                  value={primaryHex}
                  onChange={(e) => setPrimary(e.target.value)}
                  aria-label="Pick a custom brand color"
                  className="h-7 w-9 cursor-pointer rounded border border-border bg-transparent"
                />
              </span>
            </label>

            <button
              onClick={reset}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to default
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Customize theme color"
        aria-expanded={open}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background/90 text-primary shadow-lg backdrop-blur transition-transform hover:scale-105"
      >
        <Palette className="h-5 w-5" />
        {isAuto && (
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-primary ring-2 ring-background" />
          </span>
        )}
      </button>
    </div>
  );
}

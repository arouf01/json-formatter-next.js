import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, X } from "lucide-react";

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const shortcuts = [
    {
      key: "Ctrl + Enter",
      description: "Format JSON (or Cmd + Enter on Mac)",
    },
    {
      key: "Ctrl + Shift + M",
      description: "Minify JSON (or Cmd + Shift + M on Mac)",
    },
    {
      key: "Ctrl + Shift + C",
      description: "Clear input (or Cmd + Shift + C on Mac)",
    },
    {
      key: "Ctrl + Shift + D",
      description: "Download JSON (or Cmd + Shift + D on Mac)",
    },
    {
      key: "Ctrl + Shift + H",
      description: "Show this help (or Cmd + Shift + H on Mac)",
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Centering wrapper */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            {/* Modal */}
            <motion.div
              className="pointer-events-auto w-96 max-w-[90vw] max-h-[85vh] overflow-y-auto rounded-2xl bg-card border border-border shadow-xl p-6"
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
            >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">
                  Keyboard Shortcuts
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Shortcuts List */}
            <div className="flex flex-col gap-3 mb-6">
              {shortcuts.map((shortcut, index) => (
                <motion.div
                  key={index}
                  className="flex items-start justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <p className="text-sm text-muted-foreground">
                    {shortcut.description}
                  </p>
                  <kbd className="text-xs font-semibold text-primary bg-primary/10 px-2 py-1 rounded border border-primary/20 whitespace-nowrap ml-2">
                    {shortcut.key}
                  </kbd>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            <motion.button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-lg font-semibold text-primary-foreground"
              style={{ background: "var(--gradient-primary)" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Got it!
            </motion.button>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import { History, Trash2, Copy } from "lucide-react";

interface HistoryItem {
  id: string;
  json: string;
  timestamp: number;
}

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (json: string) => void;
  onClear: () => void;
}

export function HistoryPanel({
  history,
  onSelect,
  onClear,
}: HistoryPanelProps) {
  if (history.length === 0) {
    return null;
  }

  // Format timestamp to readable string
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      className="relative inline-block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <details className="group">
        <summary className="flex items-center gap-2 py-1.5 px-3 md:px-5 md:py-2.5 rounded-sm md:rounded-xl border border-border bg-card text-muted-foreground font-medium shadow-card hover:bg-accent cursor-pointer list-none marker:hidden">
          <History className="h-5 w-5" />
          <span className="text-xs md:text-lg">
            History ({history.length})
          </span>
        </summary>

        <motion.div
          className="absolute left-0 top-full mt-2 z-40 w-64 max-h-72 bg-card border border-border rounded-xl shadow-xl p-4 overflow-y-auto"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-primary">Recent Sessions</h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                onClear();
              }}
              aria-label="Clear history"
              title="Clear history"
              className="text-xs text-destructive hover:text-destructive/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive/50 rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <AnimatePresence mode="popLayout">
              {history.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="p-3 rounded-lg bg-muted/50 hover:bg-muted border border-border/50 cursor-pointer transition-all hover:shadow-sm"
                  onClick={() => onSelect(item.json)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        {item.json.substring(0, 40)}...
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-1">
                        {formatTime(item.timestamp)}
                      </p>
                    </div>
                    <Copy className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      </details>
    </motion.div>
  );
}

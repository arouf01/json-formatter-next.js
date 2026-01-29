import { motion, AnimatePresence } from "framer-motion";
import ReactJson from "react-json-view";
import { CheckCircle2, FileJson2, AlertCircle } from "lucide-react";

interface JsonOutputProps {
  parsedJson: object | null;
  error: string | null;
  settings: {
    selectedFormatterDataTypes: string;
    selecteddisplayObjectSize: string;
    selectedIconStyle: "triangle" | "circle" | "square";
    selectedTheme: string;
    fontSize: number;
  };
  displayLayout: string;
  isDark: boolean;
}

export function JsonOutput({
  parsedJson,
  error,
  settings,
  displayLayout,
  isDark,
}: JsonOutputProps) {
  const isValid = parsedJson !== null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="flex flex-col h-full p-5 rounded-2xl border border-secondary/20 bg-gradient-to-br from-secondary/5 to-secondary/10 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10"
            animate={isValid ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.5 }}
          >
            <FileJson2 className="h-4 w-4 text-secondary" />
          </motion.div>
          <span className="text-sm font-semibold text-secondary">
            Formatted Output
          </span>
        </div>

        <AnimatePresence mode="wait">
          {isValid ? (
            <motion.div
              key="valid"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20"
            >
              <CheckCircle2 className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-secondary">
                Valid JSON
              </span>
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/10 border border-destructive/20"
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs font-medium text-destructive">
                Invalid JSON
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border"
            >
              <span className="text-xs font-medium text-muted-foreground">
                Waiting...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        className={`flex-1 rounded-xl border-2 border-secondary/20 overflow-auto
    [overflow-wrap:anywhere]
    ${displayLayout === "side-by-side" ? "min-h-[350px]" : "min-h-[300px]"}
  `}
      >
        <AnimatePresence mode="wait">
          {parsedJson ? (
            <motion.div
              key="json"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              <ReactJson
                src={parsedJson}
                collapsed={false}
                enableClipboard={true}
                displayDataTypes={
                  settings.selectedFormatterDataTypes === "true"
                }
                displayObjectSize={
                  settings.selecteddisplayObjectSize === "true"
                }
                iconStyle={settings.selectedIconStyle}
                theme={isDark ? "bright" : (settings.selectedTheme as any)}
                style={{
                  backgroundColor: isDark ? "#1a1a2e" : "#f8fdf9",
                  fontSize: `${settings.fontSize}px`,
                  padding: "20px",
                  borderRadius: "0.75rem",
                  minHeight: "100%",
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full p-8 text-center "
            >
              <motion.div
                className="mb-4"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FileJson2 className="h-16 w-16 text-muted-foreground/30 " />
              </motion.div>
              <p className="text-muted-foreground font-medium">
                {error ? error : "Formatted JSON will appear here..."}
              </p>
              <p className="text-sm text-muted-foreground/60 mt-2">
                Paste your JSON and click Format
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

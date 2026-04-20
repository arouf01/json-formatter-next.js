import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactJson from "react-json-view";
import gojoRunning from "@/assets/gojo_running.gif";
import { DotLoader } from "./DotLoader";
import {
  CheckCircle2,
  FileJson2,
  AlertCircle,
  Download,
  Search,
} from "lucide-react";

interface JsonOutputProps {
  parsedJson: object | null;
  settings: {
    selectedFormatterDataTypes: string;
    selecteddisplayObjectSize: string;
    selectedIconStyle: "triangle" | "circle" | "square";
    selectedTheme: string;
    fontSize: number;
  };
  displayLayout: string;
  isDark: boolean;
  isLoading: boolean;
  onDownload: () => void;
}

export function JsonOutput({
  parsedJson,
  settings,
  displayLayout,
  isDark,
  isLoading,
  onDownload,
}: JsonOutputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const isValid = parsedJson !== null;

  // Calculate JSON statistics
  const calculateStats = (obj: any) => {
    let keyCount = 0;
    let arrayCount = 0;
    let depth = 0;

    const traverse = (o: any, currentDepth: number) => {
      depth = Math.max(depth, currentDepth);

      if (Array.isArray(o)) {
        arrayCount++;
        o.forEach((item) => traverse(item, currentDepth + 1));
      } else if (o !== null && typeof o === "object") {
        keyCount += Object.keys(o).length;
        Object.values(o).forEach((value) => traverse(value, currentDepth + 1));
      }
    };

    traverse(obj, 1);
    return { keyCount, arrayCount, depth };
  };

  const stats = parsedJson ? calculateStats(parsedJson) : null;

  // Filter JSON based on search term
  const filterJson = (obj: any, term: string): any => {
    if (!term.trim()) return obj;

    const term_lower = term.toLowerCase();
    let matchCount = 0;

    const filter = (o: any): any => {
      if (o === null || o === undefined) return undefined;

      if (Array.isArray(o)) {
        const filtered = o
          .map((item) => filter(item))
          .filter((item) => item !== undefined);
        return filtered.length > 0 ? filtered : undefined;
      } else if (typeof o === "object") {
        const result: any = {};
        let hasMatch = false;

        for (const [key, value] of Object.entries(o)) {
          const keyMatches = key.toLowerCase().includes(term_lower);
          const filteredValue = filter(value);

          if (keyMatches) {
            matchCount++;
            result[key] = value;
            hasMatch = true;
          } else if (filteredValue !== undefined) {
            result[key] = filteredValue;
            hasMatch = true;
          } else if (
            typeof value === "string" &&
            value.toLowerCase().includes(term_lower)
          ) {
            matchCount++;
            result[key] = value;
            hasMatch = true;
          }
        }

        return hasMatch ? result : undefined;
      } else if (
        typeof o === "string" &&
        o.toLowerCase().includes(term_lower)
      ) {
        matchCount++;
        return o;
      }

      return undefined;
    };

    const filtered = filter(obj);
    return { filtered: filtered || {}, matchCount };
  };

  const searchResult = searchTerm ? filterJson(parsedJson, searchTerm) : null;
  const displayJson = searchResult?.filtered || parsedJson;
  const matchCount = searchResult?.matchCount || 0;

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

        <div className="flex items-center gap-2">
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

          {parsedJson && (
            <motion.button
              onClick={onDownload}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-all duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="h-4 w-4 text-secondary" />
              <span className="text-xs font-medium text-secondary">
                Download
              </span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Search Bar */}
      {parsedJson && (
        <motion.div
          className="mb-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-secondary/20 bg-secondary/5">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search keys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
            />
            {searchTerm && (
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-xs font-medium text-secondary bg-secondary/10 px-2 py-1 rounded"
              >
                {matchCount} match{matchCount !== 1 ? "es" : ""}
              </motion.span>
            )}
            {searchTerm && (
              <motion.button
                onClick={() => setSearchTerm("")}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Statistics */}
      {stats && (
        <motion.div
          className="mb-3 flex flex-wrap gap-2 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
            Keys: {stats.keyCount}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
            Arrays: {stats.arrayCount}
          </div>
          <div className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent-foreground">
            Depth: {stats.depth}
          </div>
        </motion.div>
      )}

      <div
        className={`flex-1 rounded-xl border-2 border-secondary/20 overflow-auto
    [overflow-wrap:anywhere]
    ${displayLayout === "side-by-side" ? "min-h-[350px]" : "min-h-[300px]"}
  `}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full p-8"
            >
              <motion.div
                className={`flex items-center justify-center ${!isDark ? "mb-6" : ""}`}
              >
                {isDark ? (
                  <DotLoader />
                ) : (
                  <motion.div
                    animate={{ y: [0, -12, 0] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <motion.img
                      src={gojoRunning}
                      alt="Gojo running"
                      className="w-40 h-auto"
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.div>
                )}
              </motion.div>

              <motion.p
                className="text-muted-foreground font-medium text-center"
                transition={{ duration: 1, repeat: Infinity }}
              >
                Formatting your JSON...
                {!isDark && (
                  <>
                    <br />
                    <span className="text-sm opacity-75">
                      Gojo's on the run - just a moment.
                    </span>
                  </>
                )}
              </motion.p>
            </motion.div>
          ) : parsedJson ? (
            <motion.div
              key="json"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {searchTerm && Object.keys(displayJson).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Search className="h-12 w-12 text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground font-medium">
                    No matches found
                  </p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Try a different search term
                  </p>
                </div>
              ) : (
                <ReactJson
                  src={displayJson}
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
              )}
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
                Formatted JSON will appear here...
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

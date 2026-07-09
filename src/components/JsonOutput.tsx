import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactJson from "react-json-view";
import { DotLoader } from "./DotLoader";
import {
  CheckCircle2,
  FileJson2,
  AlertCircle,
  Download,
  Search,
  Copy,
  Minimize2,
  ChevronsDownUp,
  ChevronsUpDown,
  Wrench,
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
  error?: string | null;
  onDownload: () => void;
  onCopy: () => void;
  onMinify: () => void;
  onFix?: () => void;
}

export function JsonOutput({
  parsedJson,
  settings,
  displayLayout,
  isDark,
  isLoading,
  error,
  onDownload,
  onCopy,
  onMinify,
  onFix,
}: JsonOutputProps) {
  const [searchTerm, setSearchTerm] = useState("");
  // Debounce the search term so filtering doesn't run on every keystroke.
  const [debouncedTerm, setDebouncedTerm] = useState("");
  useEffect(() => {
    const id = setTimeout(() => setDebouncedTerm(searchTerm), 200);
    return () => clearTimeout(id);
  }, [searchTerm]);

  const isValid = parsedJson !== null;

  // Expand/collapse-all. react-json-view caches expansion internally, so we
  // bump a key to force it to re-apply the new collapsed level on each click.
  const [collapsed, setCollapsed] = useState<boolean | number>(false);
  const [treeKey, setTreeKey] = useState(0);
  const expandAll = () => {
    setCollapsed(false);
    setTreeKey((k) => k + 1);
  };
  const collapseAll = () => {
    setCollapsed(1);
    setTreeKey((k) => k + 1);
  };

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

  const stats = useMemo(
    () => (parsedJson ? calculateStats(parsedJson) : null),
    [parsedJson],
  );

  // Filter JSON based on search term
  const filterJson = (obj: any, term: string): any => {
    if (!term.trim()) return obj;

    const term_lower = term.toLowerCase();
    let matchCount = 0;

    const matchesValue = (value: any) => {
      if (value === undefined) return false;
      if (value === null)
        return String(value).toLowerCase().includes(term_lower);
      if (typeof value === "object") return false;
      return String(value).toLowerCase().includes(term_lower);
    };

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
          const valueMatches = matchesValue(value);
          const filteredValue = filter(value);

          if (keyMatches || valueMatches) {
            matchCount++;
            result[key] = value;
            hasMatch = true;
          } else if (filteredValue !== undefined) {
            result[key] = filteredValue;
            hasMatch = true;
          }
        }

        return hasMatch ? result : undefined;
      } else if (matchesValue(o)) {
        matchCount++;
        return o;
      }

      return undefined;
    };

    const filtered = filter(obj);
    return { filtered: filtered || {}, matchCount };
  };

  const searchResult = useMemo(
    () =>
      debouncedTerm && parsedJson ? filterJson(parsedJson, debouncedTerm) : null,
    [debouncedTerm, parsedJson],
  );
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
            ) : error ? (
              <motion.div
                key="invalid"
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

          {parsedJson && (
            <>
              <motion.button
                onClick={onCopy}
                aria-label="Copy formatted JSON"
                title="Copy formatted JSON"
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Copy className="h-4 w-4 text-secondary" />
              </motion.button>
              <motion.button
                onClick={onMinify}
                aria-label="Copy minified JSON"
                title="Copy minified JSON"
                className="flex items-center justify-center h-8 w-8 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Minimize2 className="h-4 w-4 text-secondary" />
              </motion.button>
              <motion.button
                onClick={onDownload}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Download className="h-4 w-4 text-secondary" />
                <span className="text-xs font-medium text-secondary">
                  Download
                </span>
              </motion.button>
            </>
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
              placeholder="Search keys or values..."
              aria-label="Search JSON keys or values"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-sm text-foreground focus:outline-none placeholder:text-muted-foreground"
            />
            {debouncedTerm && (
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
                aria-label="Clear search"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 rounded"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ✕
              </motion.button>
            )}
          </div>
        </motion.div>
      )}

      {/* Statistics & tree controls */}
      {stats && (
        <motion.div
          className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex flex-wrap gap-2">
            <div className="px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary">
              Keys: {stats.keyCount}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary">
              Arrays: {stats.arrayCount}
            </div>
            <div className="px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent-foreground">
              Depth: {stats.depth}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={expandAll}
              aria-label="Expand all"
              title="Expand all"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
            >
              <ChevronsUpDown className="h-3.5 w-3.5" />
              Expand
            </button>
            <button
              onClick={collapseAll}
              aria-label="Collapse all"
              title="Collapse all"
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 text-secondary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50"
            >
              <ChevronsDownUp className="h-3.5 w-3.5" />
              Collapse
            </button>
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
              className="flex flex-col items-center justify-center h-full p-8 gap-6"
            >
              <DotLoader />
              <p className="text-muted-foreground font-medium text-center">
                Formatting your JSON...
              </p>
            </motion.div>
          ) : parsedJson ? (
            <motion.div
              key="json"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full"
            >
              {debouncedTerm && Object.keys(displayJson).length === 0 ? (
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
                  key={treeKey}
                  src={displayJson}
                  collapsed={collapsed}
                  enableClipboard={true}
                  displayDataTypes={
                    settings.selectedFormatterDataTypes === "true"
                  }
                  displayObjectSize={
                    settings.selecteddisplayObjectSize === "true"
                  }
                  iconStyle={settings.selectedIconStyle}
                  theme={
                    (isDark && settings.selectedTheme === "rjv-default"
                      ? "bright"
                      : settings.selectedTheme) as any
                  }
                  style={{
                    backgroundColor: isDark ? "#0d1119" : "#f4f8fd",
                    fontSize: `${settings.fontSize}px`,
                    padding: "20px",
                    borderRadius: "0.75rem",
                    minHeight: "100%",
                  }}
                />
              )}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full p-8 text-center"
            >
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10"
              >
                <AlertCircle className="h-7 w-7 text-destructive" />
              </motion.div>
              <p className="text-destructive font-semibold">
                Couldn't parse this JSON
              </p>
              <p className="mt-1 max-w-md text-sm text-destructive/80 [overflow-wrap:anywhere]">
                {error}
              </p>
              {onFix && (
                <motion.button
                  onClick={onFix}
                  className="mt-5 flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground shadow-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  style={{ background: "var(--gradient-primary)" }}
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Wrench className="h-5 w-5" />
                  Try to fix
                </motion.button>
              )}
              <p className="mt-3 text-xs text-muted-foreground/70">
                Auto-fixes trailing commas, single quotes, unquoted keys & more
              </p>
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

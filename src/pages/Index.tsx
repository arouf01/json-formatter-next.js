import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Braces, HelpCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { SettingsPanel } from "@/components/SettingsPanel";
import { JsonInput } from "@/components/JsonInput";
import { JsonOutput } from "@/components/JsonOutput";
import { HistoryPanel } from "@/components/HistoryPanel";
import { KeyboardShortcuts } from "@/components/KeyboardShortcutsHelp";
import { useToast } from "@/hooks/use-toast";
import { parseJsonWithError, formatParseError } from "@/lib/jsonError";
import { tryRepairJson } from "@/lib/jsonRepair";

const defaultSettings = {
  jsonInput: "",
  jsonTitle: "",
  selectedTheme: "rjv-default",
  selectedFormatterDataTypes: "true",
  selecteddisplayObjectSize: "true",
  selectedIconStyle: "triangle" as const,
  fontSize: 16,
  displayLayout: "up-down",
};

interface HistoryItem {
  id: string;
  json: string;
  timestamp: number;
}

const HISTORY_KEY = "jsonFormatterHistory";
const MAX_HISTORY = 10;

const Index = () => {
  const { isDark } = useTheme();
  const { toast } = useToast();

  const [jsonInput, setJsonInput] = useState(defaultSettings.jsonInput);
  const [jsonTitle, setJsonTitle] = useState(defaultSettings.jsonTitle);
  const [formattedJson, setFormattedJson] = useState("");
  const [parsedJson, setParsedJson] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [displaySettings, setDisplaySettings] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("jsonFormatterSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setJsonInput(parsed.jsonInput || "");
        setJsonTitle(parsed.jsonTitle || "");
        setSettings({
          ...defaultSettings,
          ...parsed,
        });

        if (parsed.jsonInput) {
          try {
            const jsonParsed = JSON.parse(parsed.jsonInput);
            setFormattedJson(JSON.stringify(jsonParsed, null, 2));
            setParsedJson(jsonParsed);
          } catch {
            setFormattedJson("");
            setParsedJson(null);
            toast({
              title: "Invalid JSON in saved settings",
              description:
                "The saved JSON could not be parsed. Please check your settings.",
              variant: "destructive",
              duration: 4000,
            });
          }
        }
      } catch (err) {
        console.error("Error loading saved settings:", err);
      }
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch (err) {
        console.error("Error loading history:", err);
      }
    }
  }, [toast]);

  const addToHistory = useCallback((json: string) => {
    setHistory((prev) => {
      // Skip if identical to the most recent entry
      if (prev[0]?.json === json) return prev;
      const next: HistoryItem[] = [
        { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, json, timestamp: Date.now() },
        ...prev,
      ].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem(HISTORY_KEY);
  }, []);

  const handleSettingChange = (key: string, value: string | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    const settingsToSave = {
      ...settings,
      jsonInput,
      jsonTitle,
    };
    localStorage.setItem(
      "jsonFormatterSettings",
      JSON.stringify(settingsToSave),
    );
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const clearSettings = () => {
    localStorage.removeItem("jsonFormatterSettings");
    setJsonInput(defaultSettings.jsonInput);
    setJsonTitle(defaultSettings.jsonTitle);
    setSettings(defaultSettings);
    setFormattedJson("");
    setParsedJson(null);
    setError(null);
  };

  const MAX_JSON_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  const isJsonFile = (file: File) => {
    const fileName = file.name.toLowerCase();
    return file.type === "application/json" || fileName.endsWith(".json");
  };

  // Centralized parse + state update. Returns true on success.
  const processJsonString = useCallback(
    (content: string): boolean => {
      const result = parseJsonWithError(content);
      if (!result.ok) {
        setFormattedJson("");
        setParsedJson(null);
        // Surface the error in the persistent banner so the "Try to fix" action
        // is available; keep the toast for immediate feedback.
        setError(formatParseError(result));
        toast({
          title: "Invalid JSON",
          description: formatParseError(result),
          variant: "destructive",
          duration: 5000,
        });
        return false;
      }

      const parsed = result.data as Record<string, unknown>;
      let dataToShow: unknown = parsed;
      if (
        parsed &&
        typeof parsed === "object" &&
        "title" in parsed &&
        "data" in parsed
      ) {
        // Embedded title and data
        setJsonTitle((parsed.title as string) || "");
        dataToShow = parsed.data;
      }
      const pretty = JSON.stringify(dataToShow, null, 2);
      // Only the output reflects the formatted JSON; the input keeps the
      // raw source the user typed/pasted/uploaded.
      setFormattedJson(pretty);
      setParsedJson(dataToShow as object);
      setError(null);
      addToHistory(pretty);
      return true;
    },
    [addToHistory, toast],
  );

  const handleFileUpload = async (file: File) => {
    if (!isJsonFile(file)) {
      const message =
        "Please upload a file with a .json extension or valid JSON mime type.";
      setError(message);
      toast({
        title: "Upload error",
        description: message,
        variant: "destructive",
      });
      setParsedJson(null);
      setFormattedJson("");
      return;
    }

    if (file.size > MAX_JSON_FILE_SIZE) {
      const message =
        "JSON file is too large. Please upload a file smaller than 5MB.";
      setError(message);
      toast({
        title: "Upload error",
        description: message,
        variant: "destructive",
      });
      setParsedJson(null);
      setFormattedJson("");
      return;
    }

    setIsFormatting(true);
    try {
      const fileContent = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result;
          if (typeof content === "string") {
            resolve(content);
          } else {
            reject(new Error("Unable to read file content."));
          }
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
      });

      if (fileContent.trim() === "") {
        toast({
          title: "File is empty",
          description: "The uploaded file contains no JSON data.",
          variant: "destructive",
          duration: 4000,
        });
        return;
      }
      setJsonInput(fileContent);
      processJsonString(fileContent);
    } catch (err) {
      console.error("Failed to load JSON file:", err);
      const message =
        "Unable to read the uploaded file. Please try another JSON file.";
      setError(message);
      toast({
        title: "Upload error",
        description: message,
        variant: "destructive",
      });
      setParsedJson(null);
      setFormattedJson("");
    } finally {
      setIsFormatting(false);
    }
  };

  const formatJSON = useCallback(() => {
    if (jsonInput.trim() === "") {
      toast({
        title: "No JSON entered",
        description: "Please enter some JSON to format.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    processJsonString(jsonInput);
  }, [jsonInput, processJsonString, toast]);

  // Best-effort repair of malformed JSON (only offered after Format fails).
  const repairAndFormat = useCallback(() => {
    if (jsonInput.trim() === "") {
      toast({
        title: "No JSON entered",
        description: "Please enter some JSON to fix.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    const r = tryRepairJson(jsonInput);
    if (!r.ok) {
      toast({
        title: "Couldn't auto-fix",
        description: "The JSON is too malformed to repair automatically.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    // Show the corrected source in the input, then run it through the normal
    // parse/format path (populates output + history, clears the error).
    setJsonInput(r.repaired);
    if (processJsonString(r.repaired)) {
      toast({
        title: "JSON repaired & formatted",
        description: "Common mistakes were fixed automatically.",
        duration: 3000,
      });
    }
  }, [jsonInput, processJsonString, toast]);

  const minifyJSON = useCallback(async () => {
    if (jsonInput.trim() === "") {
      toast({
        title: "No JSON entered",
        description: "Please enter some JSON to minify.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const minified = JSON.stringify(parsed);
      await navigator.clipboard.writeText(minified);
      toast({
        title: "Minified JSON copied",
        description: `${minified.length} characters copied to clipboard.`,
        duration: 3000,
      });
    } catch {
      toast({
        title: "Invalid JSON",
        description: "Please check your JSON syntax and try again.",
        variant: "destructive",
        duration: 4000,
      });
    }
  }, [jsonInput, toast]);

  const copyFormatted = useCallback(async () => {
    if (!formattedJson) return;
    try {
      await navigator.clipboard.writeText(formattedJson);
      toast({ title: "Copied to clipboard", duration: 2000 });
    } catch {
      toast({
        title: "Clipboard error",
        description: "Unable to copy to clipboard.",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [formattedJson, toast]);

  const downloadJSON = useCallback(() => {
    if (parsedJson) {
      const dataToDownload = { title: jsonTitle, data: parsedJson };
      const dataStr = JSON.stringify(dataToDownload, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
      const exportFileDefaultName = `${jsonTitle || "response"} - by json.a1zohosolutions.com.json`;
      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    }
  }, [parsedJson, jsonTitle]);

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
      if (text.trim() === "") {
        toast({
          title: "Clipboard is empty",
          description: "Please copy some JSON to paste.",
          variant: "destructive",
          duration: 4000,
        });
        return;
      }
      processJsonString(text);
    } catch (err) {
      toast({
        title: "Clipboard error",
        description:
          err instanceof Error ? err.message : "Unable to read from clipboard.",
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handleInputChange = (value: string) => {
    setJsonInput(value);
    setFormattedJson("");
    setParsedJson(null);
    setError(null);
  };

  const clearInput = useCallback(() => {
    setJsonInput("");
    setFormattedJson("");
    setParsedJson(null);
    setError(null);
  }, []);

  const loadFromHistory = useCallback(
    (json: string) => {
      setJsonInput(json);
      processJsonString(json);
    },
    [processJsonString],
  );

  // Keyboard shortcuts — keep latest handlers in a ref to avoid stale closures.
  const handlersRef = useRef({
    formatJSON,
    minifyJSON,
    clearInput,
    downloadJSON,
  });
  handlersRef.current = { formatJSON, minifyJSON, clearInput, downloadJSON };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      const key = e.key.toLowerCase();

      if (key === "enter" && !e.shiftKey) {
        e.preventDefault();
        handlersRef.current.formatJSON();
      } else if (e.shiftKey && key === "m") {
        e.preventDefault();
        handlersRef.current.minifyJSON();
      } else if (e.shiftKey && key === "c") {
        e.preventDefault();
        handlersRef.current.clearInput();
      } else if (e.shiftKey && key === "d") {
        e.preventDefault();
        handlersRef.current.downloadJSON();
      } else if (e.shiftKey && key === "h") {
        e.preventDefault();
        setShowShortcuts((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background transition-colors duration-300 overflow-x-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none motion-reduce:hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-primary/5 blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-secondary/5 blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-1 md:gap-3">
            <motion.div
              className="flex w-8 h-8 md:h-12 md:w-12 items-center justify-center rounded-sm md:rounded-xl bg-primary/10 shadow-glow"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Braces className="h-6 w-6 text-primary" />
            </motion.div>
            <h1 className="text-base md:text-4xl font-bold gradient-text-primary leading-none whitespace-nowrap">
              JSON Formatter
            </h1>
          </div>

          <div className="flex flex-row items-center gap-2">
            <HistoryPanel
              history={history}
              onSelect={loadFromHistory}
              onClear={clearHistory}
            />
            <button
              onClick={() => setShowShortcuts(true)}
              aria-label="Keyboard shortcuts"
              title="Keyboard shortcuts"
              className="flex items-center justify-center h-9 w-9 md:h-11 md:w-11 rounded-sm md:rounded-xl border border-border bg-card text-primary shadow-card hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <SettingsPanel
              isOpen={displaySettings}
              onToggle={() => setDisplaySettings((prev) => !prev)}
              settings={settings}
              onSettingChange={handleSettingChange}
              onSave={saveSettings}
              onClear={clearSettings}
              showSaveSuccess={showSaveSuccess}
            />
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${
            settings.displayLayout === "side-by-side"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
              : "flex flex-col gap-6"
          }`}
        >
          <JsonInput
            value={jsonInput}
            onChange={handleInputChange}
            onFormat={formatJSON}
            onClear={clearInput}
            onPaste={pasteFromClipboard}
            onUploadFile={handleFileUpload}
            displayLayout={settings.displayLayout}
            titleValue={jsonTitle}
            onTitleChange={setJsonTitle}
          />

          <JsonOutput
            parsedJson={parsedJson}
            settings={settings}
            displayLayout={settings.displayLayout}
            isDark={isDark}
            isLoading={isFormatting}
            error={error}
            onDownload={downloadJSON}
            onCopy={copyFormatted}
            onMinify={minifyJSON}
            onFix={repairAndFormat}
          />
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Paste • Format • Copy - Your JSON, beautifully formatted
          </p>
          <div className="mt-4 text-xs text-muted-foreground">
            <p>
              Powered by{" "}
              <a
                href="https://a1zohosolutions.com/"
                target="_blank"
                className="text-primary hover:underline"
              >
                A1 Zoho Solutions
              </a>{" "}
              | Developed by{" "}
              <a
                href="https://arouf.a1zohosolutions.com/"
                target="_blank"
                className="text-primary hover:underline"
              >
                Abdur Rouf
              </a>
            </p>
            <p className="mt-2">
              © {new Date().getFullYear()} A1 Zoho Solutions. All rights
              reserved.
            </p>
          </div>
        </motion.footer>
      </div>

      <KeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </div>
  );
};

export default Index;

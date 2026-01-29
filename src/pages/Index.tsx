import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Braces } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsPanel } from "@/components/SettingsPanel";
import { JsonInput } from "@/components/JsonInput";
import { JsonOutput } from "@/components/JsonOutput";
import { ErrorAlert } from "@/components/ErrorAlert";

const defaultSettings = {
  jsonInput: "",
  selectedTheme: "rjv-default",
  selectedFormatterDataTypes: "true",
  selecteddisplayObjectSize: "true",
  selectedIconStyle: "triangle" as const,
  fontSize: 16,
  displayLayout: "side-by-side",
};

const Index = () => {
  const { isDark, toggleTheme } = useTheme();
  
  const [jsonInput, setJsonInput] = useState(defaultSettings.jsonInput);
  const [formattedJson, setFormattedJson] = useState("");
  const [parsedJson, setParsedJson] = useState<object | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState(defaultSettings);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [displaySettings, setDisplaySettings] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("jsonFormatterSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setJsonInput(parsed.jsonInput || "");
        setSettings({
          ...defaultSettings,
          ...parsed,
        });

        if (parsed.jsonInput) {
          try {
            const jsonParsed = JSON.parse(parsed.jsonInput);
            setFormattedJson(JSON.stringify(jsonParsed, null, 2));
            setParsedJson(jsonParsed);
            setError(null);
          } catch {
            setFormattedJson("");
            setParsedJson(null);
            setError("Invalid JSON in saved settings");
          }
        }
      } catch (err) {
        console.error("Error loading saved settings:", err);
      }
    }
  }, []);

  const handleSettingChange = (key: string, value: string | number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    const settingsToSave = {
      ...settings,
      jsonInput,
    };
    localStorage.setItem("jsonFormatterSettings", JSON.stringify(settingsToSave));
    setShowSaveSuccess(true);
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const clearSettings = () => {
    localStorage.removeItem("jsonFormatterSettings");
    setJsonInput(defaultSettings.jsonInput);
    setSettings(defaultSettings);
    setFormattedJson("");
    setParsedJson(null);
    setError(null);
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setFormattedJson(JSON.stringify(parsed, null, 2));
      setParsedJson(parsed);
      setError(null);
    } catch {
      setFormattedJson("");
      setParsedJson(null);
      setError("Invalid JSON");
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setJsonInput(text);
      try {
        const parsed = JSON.parse(text);
        setFormattedJson(JSON.stringify(parsed, null, 2));
        setParsedJson(parsed);
        setError(null);
      } catch {
        setFormattedJson("");
        setParsedJson(null);
        setError("Invalid JSON");
      }
    } catch (err: any) {
      alert("Clipboard error: " + err.message);
    }
  };

  const handleInputChange = (value: string) => {
    setJsonInput(value);
    setFormattedJson("");
    setParsedJson(null);
    setError(null);
  };

  const clearInput = () => {
    setJsonInput("");
    setFormattedJson("");
    setParsedJson(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
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
          className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 shadow-glow"
              whileHover={{ rotate: 10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Braces className="h-6 w-6 text-primary" />
            </motion.div>
            <h1 className="text-3xl md:text-4xl font-bold gradient-text-primary">
              JSON Formatter
            </h1>
          </div>

          <div className="flex flex-row items-center gap-2">
            <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
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
            displayLayout={settings.displayLayout}
          />

          <JsonOutput
            parsedJson={parsedJson}
            error={error}
            settings={settings}
            displayLayout={settings.displayLayout}
            isDark={isDark}
          />
        </motion.div>

        {/* Error Alert */}
        <ErrorAlert
          error={error}
          parsedJson={parsedJson}
          onDismiss={() => setError(null)}
        />

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Paste • Format • Copy — Your JSON, beautifully formatted
          </p>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;

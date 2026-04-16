import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Braces, HelpCircle } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SettingsPanel } from "@/components/SettingsPanel";
import { JsonInput } from "@/components/JsonInput";
import { JsonOutput } from "@/components/JsonOutput";
import { ErrorAlert } from "@/components/ErrorAlert";
import { HistoryPanel } from "@/components/HistoryPanel";
import { KeyboardShortcuts } from "@/components/KeyboardShortcutsHelp";
import { useToast } from "@/hooks/use-toast";

const defaultSettings = {
  jsonInput: "",
  jsonTitle: "",
  selectedTheme: "rjv-default",
  selectedFormatterDataTypes: "true",
  selecteddisplayObjectSize: "true",
  selectedIconStyle: "triangle" as const,
  fontSize: 16,
  displayLayout: "side-by-side",
};

interface HistoryItem {
  id: string;
  json: string;
  timestamp: number;
}

const Index = () => {
  const { isDark, toggleTheme } = useTheme();
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
  }, [toast]);

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

  const handleParsedJsonContent = (content: string) => {
    if (content.trim() === "") {
      toast({
        title: "File is empty",
        description: "The uploaded file contains no JSON data.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }
    setIsFormatting(true);

    setTimeout(() => {
      try {
        const parsed = JSON.parse(content);
        if (
          parsed &&
          typeof parsed === "object" &&
          "title" in parsed &&
          "data" in parsed
        ) {
          // Embedded title and data
          setJsonTitle(parsed.title || "");
          setJsonInput(JSON.stringify(parsed.data, null, 2));
          setFormattedJson(JSON.stringify(parsed.data, null, 2));
          setParsedJson(parsed.data);
        } else {
          // Normal JSON
          setJsonTitle("");
          setJsonInput(content);
          setFormattedJson(JSON.stringify(parsed, null, 2));
          setParsedJson(parsed);
        }
      } catch {
        setJsonTitle("");
        setJsonInput(content);
        setFormattedJson("");
        setParsedJson(null);
        toast({
          title: "Invalid JSON",
          description: "Please check your JSON syntax and try again.",
          variant: "destructive",
          duration: 4000,
        });
      }
      setIsFormatting(false);
    }, 1800);
  };

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

      handleParsedJsonContent(fileContent);
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
    }
  };

  const formatJSON = () => {
    if (jsonInput.trim() === "") {
      toast({
        title: "No JSON entered",
        description: "Please enter some JSON to format.",
        variant: "destructive",
        duration: 4000,
      });
      return;
    }

    setIsFormatting(true);

    // Simulate processing time for better UX
    setTimeout(() => {
      try {
        const parsed = JSON.parse(jsonInput);
        setFormattedJson(JSON.stringify(parsed, null, 2));
        setParsedJson(parsed);
      } catch {
        setFormattedJson("");
        setParsedJson(null);
        toast({
          title: "Invalid JSON",
          description: "Please check your JSON syntax and try again.",
          variant: "destructive",
          duration: 4000,
        });
      }
      setIsFormatting(false);
    }, 1800);
  };

  const downloadJSON = () => {
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
  };

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
      setIsFormatting(true);

      // Simulate processing time for better UX
      setTimeout(() => {
        try {
          const parsed = JSON.parse(text);
          setFormattedJson(JSON.stringify(parsed, null, 2));
          setParsedJson(parsed);
        } catch {
          setFormattedJson("");
          setParsedJson(null);
          toast({
            title: "Invalid JSON",
            description: "Please check your JSON syntax and try again.",
            variant: "destructive",
            duration: 4000,
          });
        }
        setIsFormatting(false);
      }, 1800);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          className="flex flex-row justify-between items-center mb-8 gap-4"
        >
          <div className="flex items-center gap-1 md:gap-3">
            <motion.div
              className="flex w-8 h-8 md:h-12 md:w-12 items-center justify-center rounded-sm md:rounded-xl bg-primary/10 shadow-glow"
              whileHover={{ rotate: 10, scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Braces className="h-6 w-6 text-primary" />
            </motion.div>
            <h1 className="text-medium md:text-4xl w-20 md:w-auto font-bold gradient-text-primary leading-none">
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
            onDownload={downloadJSON}
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
          </div>
        </motion.footer>
      </div>
    </div>
  );
};

export default Index;

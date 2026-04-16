import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Trash2, ClipboardPaste, Minimize2, Upload } from "lucide-react";

interface JsonInputProps {
  value: string;
  onChange: (value: string) => void;
  onFormat: () => void;
  onMinify: () => void;
  onClear: () => void;
  onPaste: () => void;
  displayLayout: string;
}

export function JsonInput({
  value,
  onChange,
  onFormat,
  onMinify,
  onClear,
  onPaste,
  displayLayout,
}: JsonInputProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === "application/json" || file.name.endsWith(".json")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            onChange(content);
          } catch (err) {
            console.error("Error reading file:", err);
          }
        };
        reader.readAsText(file);
      } else {
        alert("Please drop a valid JSON file");
      }
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="flex flex-col h-full p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 shadow-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            <ClipboardPaste className="h-4 w-4 text-primary" />
          </motion.div>
          <span className="text-sm font-semibold text-primary">JSON Input</span>
          <span className="text-xs text-muted-foreground ml-auto">
            (Drag JSON file here)
          </span>
        </div>
      </div>

      <div
        className={`relative flex-1 rounded-xl transition-all duration-200 ${
          isDragOver ? "bg-primary/10" : ""
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full h-full border-2 border-border p-4 rounded-xl font-mono text-sm bg-input-bg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200 placeholder:text-muted-foreground resize-none ${
            displayLayout === "side-by-side" ? "min-h-[350px]" : "min-h-[200px]"
          } ${isDragOver ? "border-primary/50 bg-primary/5" : ""}`}
          placeholder='Paste JSON here (e.g., {"key": "value"}) or drag a JSON file'
        />

        {isDragOver && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center rounded-xl bg-black/0 border-2 border-dashed border-primary/50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Upload className="h-12 w-12 text-primary/70 mb-2" />
            </motion.div>
            <p className="text-primary/70 font-semibold">Drop JSON file here</p>
          </motion.div>
        )}
      </div>

      {/* Action Buttons */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mt-5"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
            },
          },
        }}
      >
        <motion.button
          onClick={onFormat}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-primary-foreground shadow-button transition-all duration-300 min-w-[140px]"
          style={{ background: "var(--gradient-primary)" }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Sparkles className="h-5 w-5" />
          Format
        </motion.button>

        <motion.button
          onClick={onMinify}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-secondary-foreground shadow-lg transition-all duration-300 min-w-[140px]"
          style={{ background: "var(--gradient-secondary)" }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Minimize2 className="h-5 w-5" />
          Minify
        </motion.button>

        <motion.button
          onClick={onClear}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold bg-muted text-muted-foreground hover:bg-muted/80 shadow-lg transition-all duration-300 min-w-[140px]"
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <Trash2 className="h-5 w-5" />
          Clear
        </motion.button>

        <motion.button
          onClick={onPaste}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-secondary-foreground shadow-lg transition-all duration-300 min-w-[140px]"
          style={{ background: "var(--gradient-secondary)" }}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <ClipboardPaste className="h-5 w-5" />
          Paste
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

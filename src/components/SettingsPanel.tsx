import { motion, AnimatePresence } from "framer-motion";
import { Settings2, Save, Trash2, Check, X } from "lucide-react";

export function SettingsPanel({
  isOpen,
  onToggle,
  settings,
  onSettingChange,
  onSave,
  onClear,
  showSaveSuccess,
}: SettingsPanelProps) {
  const selectClass =
    "w-full px-4 py-2.5 rounded-lg border border-border bg-card text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200";

  const labelClass = "block text-sm font-medium text-primary mb-2";

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={onToggle}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-card text-primary font-medium shadow-card hover:bg-accent"
      >
        <Settings2 className="h-5 w-5" />
        <span>Display Settings</span>
      </motion.button>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="
        fixed right-4 top-20 z-40
        w-[250px]
        max-h-[85vh]
        bg-card border border-border
        rounded-xl shadow-xl
        p-4 overflow-y-auto
      "
            initial={{ x: 280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 280, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-primary flex items-center gap-2">
                <Settings2 className="h-4 w-4" />
                Display Settings
              </h2>

              <button
                onClick={onToggle}
                className="h-8 w-8 flex items-center justify-center rounded-md border border-border hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Settings – ONE COLUMN */}
            <div className="flex flex-col gap-4">
              <div>
                <label className={labelClass}>Display Layout</label>
                <select
                  value={settings.displayLayout}
                  onChange={(e) =>
                    onSettingChange("displayLayout", e.target.value)
                  }
                  className={selectClass}
                >
                  <option value="side-by-side">Side by Side</option>
                  <option value="up-down">Up & Down</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Data Types</label>
                <select
                  value={settings.selectedFormatterDataTypes}
                  onChange={(e) =>
                    onSettingChange(
                      "selectedFormatterDataTypes",
                      e.target.value,
                    )
                  }
                  className={selectClass}
                >
                  <option value="true">Show</option>
                  <option value="false">Hide</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Object Size</label>
                <select
                  value={settings.selecteddisplayObjectSize}
                  onChange={(e) =>
                    onSettingChange("selecteddisplayObjectSize", e.target.value)
                  }
                  className={selectClass}
                >
                  <option value="true">Show</option>
                  <option value="false">Hide</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Icon Style</label>
                <select
                  value={settings.selectedIconStyle}
                  onChange={(e) =>
                    onSettingChange("selectedIconStyle", e.target.value)
                  }
                  className={selectClass}
                >
                  <option value="triangle">Triangle</option>
                  <option value="circle">Circle</option>
                  <option value="square">Square</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Font Size: {settings.fontSize}px
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      onSettingChange(
                        "fontSize",
                        Math.max(10, settings.fontSize - 1),
                      )
                    }
                    className="flex-1 border rounded-lg"
                  >
                    −
                  </button>
                  <button
                    onClick={() =>
                      onSettingChange(
                        "fontSize",
                        Math.min(72, settings.fontSize + 1),
                      )
                    }
                    className="flex-1 border rounded-lg"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={onSave}
                className="w-full py-2 rounded-lg font-semibold"
                style={{ background: "var(--gradient-secondary)" }}
              >
                <Save className="inline h-4 w-4 mr-1" />
                Save
              </button>

              <button
                onClick={onClear}
                className="w-full py-2 rounded-lg bg-destructive text-destructive-foreground"
              >
                <Trash2 className="inline h-4 w-4 mr-1" />
                Clear
              </button>
            </div>

            {/* Success */}
            {showSaveSuccess && (
              <div className="mt-4 text-xs text-success font-medium flex items-center gap-2">
                <Check className="h-4 w-4" />
                Saved successfully
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

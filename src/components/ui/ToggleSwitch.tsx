"use client";

import { memo } from "react";
import { motion } from "framer-motion";

interface ToggleSwitchProps {
  /** Whether the toggle is on */
  checked: boolean;
  /** Callback when toggle changes */
  onChange: (checked: boolean) => void;
  /** Label text to display */
  label: string;
  /** Whether the toggle is disabled */
  disabled?: boolean;
}

/**
 * Reusable toggle switch component for boolean settings.
 */
export const ToggleSwitch = memo(function ToggleSwitch({
  checked,
  onChange,
  label,
  disabled = false,
}: ToggleSwitchProps) {
  return (
    <button
      className={`
        w-full py-3 px-4 rounded-lg border text-sm font-medium transition-all
        flex items-center justify-between
        ${
          checked
            ? "bg-indigo-dark/40 border-gold/50 text-white"
            : "border-text-muted/30 text-white"
        }
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
    >
      <span>{label}</span>
      <div
        className={`
          w-10 h-6 rounded-full relative transition-colors
          ${checked ? "bg-gold" : "bg-text-muted/30"}
        `}
      >
        <motion.div
          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
          animate={{
            left: checked ? "calc(100% - 20px)" : "4px",
          }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </div>
    </button>
  );
});

export default ToggleSwitch;


"use client";

import { memo, ReactElement } from "react";

interface ToggleOption<T extends string> {
  value: T;
  label?: string;
}

interface ToggleButtonGroupProps<T extends string> {
  /** Available options to choose from */
  options: readonly T[] | ToggleOption<T>[];
  /** Currently selected value */
  value: T;
  /** Callback when selection changes */
  onChange: (value: T) => void;
  /** Whether buttons are disabled */
  disabled?: boolean;
  /** Size variant */
  size?: "sm" | "md";
}

/**
 * Reusable toggle button group for selecting between multiple options.
 * Used in settings for difficulty, animation speed, etc.
 */
export const ToggleButtonGroup = memo(function ToggleButtonGroup<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  size = "md",
}: ToggleButtonGroupProps<T>) {
  const sizeClasses = size === "sm" ? "py-2 px-3 text-xs" : "py-3 px-4 text-sm";

  const normalizedOptions: ToggleOption<T>[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <div className="flex gap-2">
      {normalizedOptions.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            className={`
              flex-1 ${sizeClasses} rounded-lg border font-medium capitalize transition-all
              ${
                isSelected
                  ? "bg-gold text-midnight border-gold"
                  : "border-text-muted/30 text-white hover:border-gold/50"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
          >
            {option.label || option.value}
          </button>
        );
      })}
    </div>
  );
}) as <T extends string>(props: ToggleButtonGroupProps<T>) => ReactElement;

export default ToggleButtonGroup;


"use client";

import { memo, ReactNode } from "react";
import { FONTS } from "@/lib/styles";

interface SectionProps {
  /** Section title */
  title: string;
  /** Optional description text below content */
  description?: string;
  /** Section content */
  children: ReactNode;
}

/**
 * Reusable glass-panel section with title for grouping related content.
 */
export const Section = memo(function Section({
  title,
  description,
  children,
}: SectionProps) {
  return (
    <div className="glass-panel p-4 rounded-xl">
      <h2
        className="text-sm text-gold font-display mb-3 tracking-wider"
        style={{ fontFamily: FONTS.display }}
      >
        {title}
      </h2>
      {children}
      {description && (
        <p className="text-xs text-white mt-2">{description}</p>
      )}
    </div>
  );
});

export default Section;


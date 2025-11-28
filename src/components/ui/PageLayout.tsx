"use client";

import { memo, ReactNode } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Breadcrumbs } from "./Breadcrumbs";
import { Button } from "./Button";
import { FONTS, ANIMATION_VARIANTS } from "@/lib/styles";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageLayoutProps {
  /** Page title displayed prominently */
  title: string;
  /** Breadcrumb navigation items */
  breadcrumbs: BreadcrumbItem[];
  /** Whether to show loading state */
  loading?: boolean;
  /** Loading message to display */
  loadingMessage?: string;
  /** Error message to display */
  error?: string | null;
  /** Whether to show back to menu button */
  showBackButton?: boolean;
  /** Maximum width class for content */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl";
  /** Page content */
  children: ReactNode;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
} as const;

/**
 * Shared page layout component providing consistent structure across pages.
 * Includes breadcrumbs, animated title, error display, loading states, and back navigation.
 */
export const PageLayout = memo(function PageLayout({
  title,
  breadcrumbs,
  loading = false,
  loadingMessage = "Loading...",
  error = null,
  showBackButton = true,
  maxWidth = "2xl",
  children,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col p-4">
      {/* Header with breadcrumbs */}
      <header className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
      </header>

      <main className={`flex-1 ${maxWidthClasses[maxWidth]} mx-auto w-full`}>
        {/* Animated page title */}
        <motion.h1
          className="text-3xl text-gold font-display text-center mb-8 tracking-wider"
          style={{ fontFamily: FONTS.display }}
          {...ANIMATION_VARIANTS.fadeInDown}
        >
          {title}
        </motion.h1>

        {/* Error display */}
        {error && (
          <motion.div
            className="mb-4 p-3 rounded-lg bg-danger/20 border border-danger/50 text-white text-sm"
            {...ANIMATION_VARIANTS.fadeInDown}
          >
            {error}
          </motion.div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-8 text-text-muted">{loadingMessage}</div>
        ) : (
          <motion.div {...ANIMATION_VARIANTS.fadeInUp} transition={{ delay: 0.1 }}>
            {children}
          </motion.div>
        )}

        {/* Back to menu button */}
        {showBackButton && !loading && (
          <motion.div
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/">
              <Button variant="ghost">Back to Menu</Button>
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
});

export default PageLayout;


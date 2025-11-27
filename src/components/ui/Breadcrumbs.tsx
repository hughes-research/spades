"use client";

import { memo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs = memo(function Breadcrumbs({
  items,
  className = "",
}: BreadcrumbsProps) {
  return (
    <nav
      className={`flex items-center gap-2 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <Link
        href="/"
        className="hover:text-gold transition-colors"
        style={{ color: "#cccccc" }}
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </Link>

      {items.map((item, index) => (
        <motion.div
          key={index}
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <span style={{ color: "#cccccc" }}>/</span>
          {item.href && index !== items.length - 1 ? (
            <Link
              href={item.href}
              className="hover:text-gold transition-colors"
              style={{ color: "#cccccc" }}
            >
              {item.label}
            </Link>
          ) : (
            <span
              style={{ color: index === items.length - 1 ? "#ffd700" : "#cccccc" }}
            >
              {item.label}
            </span>
          )}
        </motion.div>
      ))}
    </nav>
  );
});

export default Breadcrumbs;


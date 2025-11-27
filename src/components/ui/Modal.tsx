"use client";

import { memo, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when backdrop is clicked */
  onClose?: () => void;
  /** Modal content */
  children: ReactNode;
  /** Whether to blur the backdrop */
  blur?: boolean;
  /** Custom class for the modal panel */
  className?: string;
}

/**
 * Reusable modal component with backdrop and animation.
 */
export const Modal = memo(function Modal({
  isOpen,
  onClose,
  children,
  blur = true,
  className = "",
}: ModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className={`absolute inset-0 bg-midnight-deep/90 ${blur ? "backdrop-blur-md" : ""}`}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal panel */}
          <motion.div
            className={`relative glass-panel p-8 rounded-2xl max-w-md w-full ${className}`}
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default Modal;


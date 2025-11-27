"use client";

import { memo, ReactNode } from "react";
import { motion, HTMLMotionProps } from "framer-motion";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-gradient-to-r from-gold to-gold-light text-midnight-deep
    hover:shadow-lg hover:shadow-gold/30
    active:scale-95
  `,
  secondary: `
    bg-transparent border border-white/50 text-white
    hover:bg-white/10 hover:border-gold
    active:scale-95
  `,
  ghost: `
    bg-transparent text-white
    hover:bg-white/10
    active:scale-95
  `,
  danger: `
    bg-danger/20 border border-danger/50 text-white
    hover:bg-danger/30
    active:scale-95
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-md",
  md: "px-4 py-2 text-base rounded-lg",
  lg: "px-6 py-3 text-lg rounded-xl",
};

export const Button = memo(function Button({
  variant = "primary",
  size = "md",
  children,
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = "",
  ...props
}: ButtonProps) {
  return (
    <motion.button
      className={`
        inline-flex items-center justify-center gap-2
        font-medium tracking-wide uppercase
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${className}
      `}
      whileHover={!disabled ? { y: -2 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <motion.div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </motion.button>
  );
});

export default Button;


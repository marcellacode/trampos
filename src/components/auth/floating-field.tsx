"use client";

import { useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {
  label: string;
  icon: LucideIcon;
  error?: string;
  showPasswordToggle?: boolean;
  ref?: React.Ref<HTMLInputElement>;
}

export function FloatingField({
  label,
  icon: Icon,
  error,
  showPasswordToggle,
  type = "text",
  className,
  value,
  onFocus,
  onBlur,
  disabled,
  ref,
  ...props
}: FloatingFieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasValue = String(value ?? "").length > 0;
  const floated = focused || hasValue;
  const inputType =
    showPasswordToggle && type === "password"
      ? showPassword
        ? "text"
        : "password"
      : type;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div
        className={cn(
          "group relative rounded-xl border bg-[#0C0E10] transition-all duration-200",
          error
            ? "border-red-500/50 shadow-[0_0_0_3px_rgba(239,68,68,0.12)]"
            : focused
              ? "border-primary/60 shadow-[0_0_0_3px_rgba(79,124,255,0.18)]"
              : "border-border hover:border-border",
          disabled && "opacity-50"
        )}
      >
        <Icon
          className={cn(
            "pointer-events-none absolute left-3.5 top-1/2 z-10 h-4 w-4 -translate-y-1/2 transition-colors",
            focused || hasValue ? "text-primary" : "text-muted-foreground"
          )}
          aria-hidden="true"
        />

        <label
          htmlFor={id}
          className={cn(
            "pointer-events-none absolute left-10 origin-left transition-all duration-200",
            floated
              ? "top-2 text-[11px] font-medium text-primary"
              : "top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
          )}
        >
          {label}
        </label>

        <input
          {...props}
          ref={ref}
          id={id}
          type={inputType}
          value={value}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            "h-14 w-full rounded-xl bg-transparent pl-10 pr-11 text-sm text-foreground outline-none",
            floated ? "pt-5 pb-2" : "py-0",
            "placeholder:text-transparent"
          )}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
        />

        {showPasswordToggle && (
          <button
            type="button"
            tabIndex={0}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {error ? (
          <motion.p
            id={errorId}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="px-1 text-xs text-red-400"
          >
            {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

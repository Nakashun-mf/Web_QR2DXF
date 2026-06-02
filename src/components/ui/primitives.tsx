import * as React from "react";
import { cn } from "@/lib/utils";

// ── Label ─────────────────────────────────────────────────
export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className
    )}
    {...props}
  />
));
Label.displayName = "Label";

// ── Input ─────────────────────────────────────────────────
export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "flex h-9 w-full rounded-md border border-[var(--line-2)] bg-[var(--surface)] px-3 py-[9px] text-sm text-[var(--ink)] shadow-none transition-[border-color,box-shadow] duration-[170ms] placeholder:text-[var(--ink-3)] focus-visible:outline-none focus-visible:border-[var(--signal)] focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50",
      className
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

// ── Textarea ──────────────────────────────────────────────
export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-[var(--line-2)] bg-[var(--surface)] px-3 py-[9px] text-sm text-[var(--ink)] shadow-none transition-[border-color,box-shadow] duration-[170ms] placeholder:text-[var(--ink-3)] focus-visible:outline-none focus-visible:border-[var(--signal)] focus-visible:[box-shadow:var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50 resize-none",
      className
    )}
    ref={ref}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// ── Badge ─────────────────────────────────────────────────
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "beta" | "soon";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default:     "bg-[var(--signal-wash)] text-[var(--signal-ink)] border-[var(--signal-line)]",
    success:     "bg-[var(--signal-wash)] text-[var(--signal-ink)] border-[var(--signal-line)]",
    beta:        "bg-[var(--info-wash)] text-[var(--info)] border-[var(--info-line)]",
    soon:        "bg-[var(--warn-wash)] text-[var(--warn)] border-[var(--warn-line)]",
    destructive: "bg-[var(--danger-wash)] text-[var(--danger)] border-[var(--danger-line)]",
    secondary:   "bg-[var(--paper-2)] text-[var(--ink-2)] border-[var(--line-2)]",
    outline:     "border-[var(--line-2)] text-[var(--ink)]",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-pill border px-[9px] py-[4px] font-mono text-[11px] font-medium tracking-[0.04em] transition-colors",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

// ── Separator ─────────────────────────────────────────────
export function Separator({ className }: { className?: string }) {
  return <div className={cn("h-px bg-border", className)} />;
}

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[7px] whitespace-nowrap rounded-md font-semibold transition-all duration-[170ms] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-[.42] active:translate-y-px",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--signal)] text-white shadow-sm hover:bg-[var(--signal-bright)]",
        destructive:
          "bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90",
        outline:
          "border border-[var(--line-2)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--line-strong)] hover:bg-[var(--surface-2)]",
        secondary:
          "border border-[var(--line)] bg-[var(--surface-2)] text-[var(--ink)] hover:bg-[var(--paper-2)]",
        ghost:
          "text-[var(--ink-2)] hover:bg-muted hover:text-[var(--ink)]",
        link:
          "text-[var(--signal-ink)] underline-offset-4 hover:underline",
      },
      size: {
        default: "py-[9px] px-4 text-sm",
        sm:      "py-[6px] px-[11px] text-[13px]",
        lg:      "py-3 px-5 text-[15px]",
        icon:    "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };

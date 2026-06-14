import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "ai" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "secondary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          size === "sm" && "px-3 py-1.5 text-sm",
          size === "md" && "px-4 py-2 text-sm",
          size === "lg" && "px-5 py-2.5 text-base",
          variant === "primary" &&
            "bg-sky text-white hover:bg-sky/90",
          variant === "secondary" &&
            "bg-elevated text-text-primary border border-border hover:border-text-secondary",
          variant === "ghost" &&
            "text-text-secondary hover:text-text-primary hover:bg-elevated",
          variant === "ai" &&
            "bg-violet text-white hover:bg-violet/90 shadow-[0_0_24px_-4px_rgba(124,58,237,0.7)] hover:shadow-[0_0_32px_-4px_rgba(124,58,237,0.9)] hover:-translate-y-px active:translate-y-0",
          variant === "danger" &&
            "bg-rose/10 text-rose border border-rose/30 hover:bg-rose/20",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

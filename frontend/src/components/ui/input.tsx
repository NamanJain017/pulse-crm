import { cn } from "@/lib/utils";
import { InputHTMLAttributes, SelectHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-lg bg-elevated border border-border px-3 py-2 text-sm text-text-primary",
        "placeholder:text-text-muted focus:border-violet outline-none transition-colors",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select
      ref={ref}
      className={cn(
        "rounded-lg bg-elevated border border-border px-3 py-2 text-sm text-text-primary",
        "focus:border-violet outline-none transition-colors cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </select>
  )
);
Select.displayName = "Select";

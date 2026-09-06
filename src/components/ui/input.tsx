import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-stone bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
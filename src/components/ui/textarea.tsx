import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full rounded-xl border border-stone bg-white px-4 py-2.5 text-ink placeholder:text-ink-muted/60 focus:border-terracotta focus:outline-none focus:ring-2 focus:ring-terracotta/20 resize-y min-h-[120px]",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
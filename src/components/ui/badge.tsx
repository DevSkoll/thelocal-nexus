import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "verified" | "type" | "interest" | "paid" | "nature";
  className?: string;
}

const variants = {
  default: "bg-cream-dark text-ink-muted border border-stone/40",
  verified: "bg-sage/10 text-sage border border-sage/20",
  type: "bg-terracotta/10 text-terracotta-dark border border-terracotta/20",
  interest: "bg-sage/5 text-sage border border-sage/15",
  paid: "bg-terracotta text-white border border-terracotta-dark font-bold uppercase tracking-wide",
  nature: "bg-white text-ink border border-stone/80",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
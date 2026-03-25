import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[0.72rem] font-bold uppercase tracking-[0.28em] transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[color:var(--primary)] text-[color:var(--primary-foreground)]",
        secondary:
          "border-transparent bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)]",
        outline: "border-[color:var(--border)] bg-[color:var(--popover)] text-[color:var(--foreground)] backdrop-blur-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };

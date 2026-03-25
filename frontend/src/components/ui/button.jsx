import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[color:var(--background)] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 shrink-0 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-[color:var(--primary)] text-[color:var(--primary-foreground)] shadow-[0_14px_35px_rgba(29,38,79,0.22)] hover:-translate-y-0.5 hover:bg-[#273063]",
        secondary:
          "bg-[color:var(--secondary)] text-[color:var(--secondary-foreground)] hover:bg-[#e8d8c4]",
        outline:
          "border border-[color:var(--border)] bg-[color:var(--popover)] text-[color:var(--foreground)] backdrop-blur-xl hover:bg-[color:var(--card)]",
        ghost:
          "text-[color:var(--foreground)] hover:bg-white/60 hover:text-[color:var(--foreground)]",
        link: "text-[color:var(--primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4",
        lg: "h-12 px-6 text-[0.95rem]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";

  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});

Button.displayName = "Button";

export { Button, buttonVariants };

import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef(function Input({ className, type = "text", ...props }, ref) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--popover)] px-4 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted-foreground)] focus:border-[color:var(--ring)] focus:bg-[color:var(--card)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      type={type}
      {...props}
    />
  );
});

Input.displayName = "Input";

export { Input };

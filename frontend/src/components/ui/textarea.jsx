import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-[1.35rem] border border-[color:var(--border)] bg-[color:var(--popover)] px-4 py-3 text-sm text-[color:var(--foreground)] outline-none transition placeholder:text-[color:var(--muted-foreground)] focus:border-[color:var(--ring)] focus:bg-[color:var(--card)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";

export { Textarea };

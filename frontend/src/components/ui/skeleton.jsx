import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return <div className={cn("animate-pulse rounded-[1.35rem] bg-[color:var(--muted)]", className)} {...props} />;
}

export { Skeleton };

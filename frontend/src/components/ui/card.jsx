import { cn } from "@/lib/utils";

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-[1.8rem] border border-[color:var(--border)] bg-[color:var(--card)] text-[color:var(--card-foreground)] shadow-[0_20px_60px_rgba(15,20,30,0.1)] backdrop-blur-2xl",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2 p-6", className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return <h3 className={cn("font-display text-2xl leading-none tracking-[0.04em] text-[color:var(--foreground)]", className)} {...props} />;
}

function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm leading-7 text-[color:var(--muted-foreground)]", className)} {...props} />;
}

function CardContent({ className, ...props }) {
  return <div className={cn("px-6 pb-6", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return <div className={cn("flex items-center gap-3 px-6 pb-6", className)} {...props} />;
}

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };

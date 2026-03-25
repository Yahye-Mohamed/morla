"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      className={cn(
        "fixed inset-0 z-50 bg-[rgba(16,24,48,0.46)] backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(function DialogContent({ className, children, ...props }, ref) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-[min(92vw,960px)] -translate-x-1/2 -translate-y-1/2 gap-4 rounded-[2rem] border border-[color:var(--border)] bg-[color:var(--popover)] p-6 text-[color:var(--popover-foreground)] shadow-[0_30px_90px_rgba(16,24,48,0.22)] backdrop-blur-2xl outline-none sm:p-8",
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-5 top-5 rounded-full border border-[color:var(--border)] bg-[color:var(--card)] p-2 text-[color:var(--foreground)] transition hover:bg-[color:var(--popover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]">
          <X className="size-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

DialogContent.displayName = DialogPrimitive.Content.displayName;

function DialogHeader({ className, ...props }) {
  return <div className={cn("flex flex-col gap-2 text-left", className)} {...props} />;
}

function DialogFooter({ className, ...props }) {
  return <div className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)} {...props} />;
}

const DialogTitle = React.forwardRef(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      className={cn("font-display text-3xl leading-none tracking-[0.04em] text-[color:var(--foreground)]", className)}
      ref={ref}
      {...props}
    />
  );
});

DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef(function DialogDescription({ className, ...props }, ref) {
  return <DialogPrimitive.Description className={cn("text-sm leading-7 text-[color:var(--muted-foreground)]", className)} ref={ref} {...props} />;
});

DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};

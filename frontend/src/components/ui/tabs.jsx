"use client";

import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef(function TabsList({ className, ...props }, ref) {
  return (
    <TabsPrimitive.List
      className={cn("inline-flex h-12 items-center rounded-full border border-[color:var(--border)] bg-[color:var(--popover)] p-1 shadow-[0_16px_38px_rgba(15,20,30,0.08)]", className)}
      ref={ref}
      {...props}
    />
  );
});

TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-[color:var(--muted-foreground)] transition data-[state=active]:bg-[color:var(--primary)] data-[state=active]:text-[color:var(--primary-foreground)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});

TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef(function TabsContent({ className, ...props }, ref) {
  return <TabsPrimitive.Content className={cn("mt-4 outline-none", className)} ref={ref} {...props} />;
});

TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };

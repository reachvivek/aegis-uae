"use client";

import * as React from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { XIcon } from "@phosphor-icons/react";

interface StandardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses: Record<string, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
  full: "sm:max-w-5xl",
};

export default function StandardModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "lg",
}: StandardModalProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 isolate z-[9999] bg-black/40 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0"
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed top-1/2 left-1/2 z-[10000] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2",
            "rounded-xl bg-card text-card-foreground ring-1 ring-border/50 shadow-2xl",
            "max-h-[85vh] flex flex-col overflow-hidden",
            "data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95",
            "data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            "duration-150 outline-none",
            sizeClasses[size],
          )}
        >
          {/* Fixed header */}
          <div className="shrink-0 px-5 pt-4 pb-3 border-b border-border/50">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <DialogPrimitive.Title className="text-sm font-bold leading-snug">
                  {title}
                </DialogPrimitive.Title>
                {description && (
                  <DialogPrimitive.Description render={<div />} className="text-xs text-muted-foreground mt-1">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close
                render={
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="shrink-0 -mt-1 -mr-2"
                  />
                }
              >
                <XIcon className="w-4 h-4" />
                <span className="sr-only">Close</span>
              </DialogPrimitive.Close>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4">
            {children}
          </div>

          {/* Fixed footer */}
          {footer && (
            <div className="shrink-0 px-5 py-3 border-t border-border/50 bg-muted/30 flex items-center justify-end gap-2">
              {footer}
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

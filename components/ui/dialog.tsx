"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;

export function DialogContent({
  className,
  children,
  open,
  bottomSheet = true,
}: {
  className?: string;
  children: React.ReactNode;
  open: boolean;
  bottomSheet?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <DialogPrimitive.Portal forceMount>
          <DialogPrimitive.Overlay asChild forceMount>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          </DialogPrimitive.Overlay>
          <DialogPrimitive.Content asChild forceMount>
            <motion.div
              className={cn(
                "fixed z-50 glass card-shadow",
                bottomSheet
                  ? "inset-x-0 bottom-0 rounded-t-[var(--radius-modal)] max-h-[90vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
                  : "left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[var(--radius-modal)]",
                className
              )}
              initial={bottomSheet ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              animate={bottomSheet ? { y: 0 } : { opacity: 1, scale: 1 }}
              exit={bottomSheet ? { y: "100%" } : { opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
            >
              {bottomSheet && (
                <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-border" />
              )}
              {children}
              <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full p-2 hover:bg-black/5 dark:hover:bg-white/10">
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </motion.div>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      )}
    </AnimatePresence>
  );
}

export const DialogTitle = DialogPrimitive.Title;
export const DialogClose = DialogPrimitive.Close;

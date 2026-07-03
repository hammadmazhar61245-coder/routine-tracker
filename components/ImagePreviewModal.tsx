"use client";

import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";

export function ImagePreviewModal({
  src,
  onClose,
}: {
  src: string | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {src && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[95] bg-black/85 flex items-center justify-center p-6"
        >
          <motion.img
            src={src}
            alt="Task attachment"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="max-h-full max-w-full rounded-2xl object-contain"
          />
          <button
            onClick={onClose}
            className="absolute top-[calc(env(safe-area-inset-top)+16px)] right-5 rounded-full bg-white/10 p-2 text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

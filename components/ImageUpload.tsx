"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, X } from "lucide-react";
import { compressImage } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
}: {
  value?: string;
  onChange: (base64: string | undefined, type: string | undefined) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const { base64, type } = await compressImage(file);
      onChange(base64, type);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
        id="image-upload-input"
      />
      <AnimatePresence mode="wait">
        {value ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-fit"
          >
            <img
              src={value}
              alt="Task attachment"
              className="h-28 w-28 rounded-2xl object-cover border border-border"
            />
            <button
              type="button"
              onClick={() => onChange(undefined, undefined)}
              className="absolute -right-2 -top-2 rounded-full bg-danger text-white p-1.5 shadow-md"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="button"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex h-28 w-28 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-border text-fg-muted"
          >
            <Camera className="h-5 w-5" />
            <span className="text-xs">{loading ? "Adding…" : "Add photo"}</span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

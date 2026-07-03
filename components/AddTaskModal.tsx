"use client";

import { useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { motion } from "motion/react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/ImageUpload";
import { useTasks } from "@/hooks/useTasks";
import { useNotifications } from "@/hooks/useNotifications";
import { db, type Category, type Priority } from "@/lib/db";
import { cn, todayISO } from "@/lib/utils";
import { scheduleServerReminder } from "@/lib/push/client";

const CATEGORIES: { value: Category; label: string }[] = [
  { value: "work", label: "Work" },
  { value: "study", label: "Study" },
  { value: "fitness", label: "Fitness" },
  { value: "personal", label: "Personal" },
  { value: "other", label: "Other" },
];

const PRIORITIES: { value: Priority; label: string; emoji: string }[] = [
  { value: "low", label: "Low", emoji: "🟢" },
  { value: "medium", label: "Medium", emoji: "🟡" },
  { value: "high", label: "High", emoji: "🔴" },
];

export function AddTaskModal({
  open,
  onOpenChange,
  defaultDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultDate?: string;
}) {
  const { addTask } = useTasks();
  const { scheduleOne } = useNotifications();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState(defaultDate ?? todayISO());
  const [category, setCategory] = useState<Category>("work");
  const [priority, setPriority] = useState<Priority>("medium");
  const [image, setImage] = useState<{ base64?: string; type?: string }>({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; time?: string }>({});

  function reset() {
    setTitle("");
    setDescription("");
    setTime("");
    setDate(defaultDate ?? todayISO());
    setCategory("work");
    setPriority("medium");
    setImage({});
    setErrors({});
  }

  async function handleSave() {
    const newErrors: typeof errors = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (!time) newErrors.time = "Time is required";
    if (Object.keys(newErrors).length) {
      setErrors(newErrors);
      return;
    }
    setSaving(true);
    try {
      const id = await addTask({
        title: title.trim(),
        description: description.trim() || undefined,
        date,
        time,
        category,
        priority,
        imageBase64: image.base64,
        imageType: image.type,
      });
      const task = await db.tasks.get(id);
      if (task) {
        scheduleOne(task);
        scheduleServerReminder(task);
      }
      reset();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent open={open}>
        <div className="px-5 pb-6 pt-2">
          <DialogTitle className="text-xl font-bold tracking-tight mb-5">
            New task
          </DialogTitle>

          <div className="space-y-4">
            <div>
              <Input
                placeholder="What do you need to do?"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setErrors((er) => ({ ...er, title: undefined }));
                }}
                className={errors.title ? "ring-2 ring-danger" : ""}
              />
              {errors.title && <p className="text-xs text-danger mt-1">{errors.title}</p>}
            </div>

            <Textarea
              placeholder="Add a description (optional)"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-fg-muted mb-1 block">Date</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div>
                <label className="text-xs font-medium text-fg-muted mb-1 block">Time</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => {
                    setTime(e.target.value);
                    setErrors((er) => ({ ...er, time: undefined }));
                  }}
                  className={errors.time ? "ring-2 ring-danger" : ""}
                />
                {errors.time && <p className="text-xs text-danger mt-1">{errors.time}</p>}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-fg-muted mb-1 block">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-fg-muted mb-1.5 block">Priority</label>
              <div className="flex gap-2 rounded-xl bg-bg-elevated border border-border p-1">
                {PRIORITIES.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "flex-1 h-10 rounded-lg text-sm font-medium transition-colors relative",
                      priority === p.value ? "text-accent-fg" : "text-fg-muted"
                    )}
                  >
                    {priority === p.value && (
                      <motion.span
                        layoutId="priority-pill"
                        className="absolute inset-0 rounded-lg bg-accent"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">
                      {p.emoji} {p.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-fg-muted mb-1.5 block">Photo</label>
              <ImageUpload
                value={image.base64}
                onChange={(base64, type) => setImage({ base64, type })}
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <DialogPrimitive.Close asChild>
              <Button variant="outline" className="flex-1" onClick={reset}>
                Cancel
              </Button>
            </DialogPrimitive.Close>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save task"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

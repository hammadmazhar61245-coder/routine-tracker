import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isToday as _isToday, isSameDay } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function todayISO(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function formatFullDate(dateISO: string): string {
  return format(parseISO(dateISO), "EEEE, MMMM d, yyyy");
}

export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy");
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

export function isDateToday(dateISO: string): boolean {
  return _isToday(parseISO(dateISO));
}

export function isSameDayISO(a: string, b: string): boolean {
  return isSameDay(parseISO(a), parseISO(b));
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up?";
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 21) return "Good evening";
  return "Winding down?";
}

/** Combine a date (yyyy-MM-dd) and time (HH:mm) into a Date object. */
export function combineDateTime(dateISO: string, time: string): Date {
  const [h, m] = time.split(":").map(Number);
  const d = parseISO(dateISO);
  d.setHours(h, m, 0, 0);
  return d;
}

export function msUntil(dateISO: string, time: string): number {
  return combineDateTime(dateISO, time).getTime() - Date.now();
}

/** Compress + resize an image file to a max width, returning a base64 data URL. */
export function compressImage(
  file: File,
  maxWidth = 800,
  quality = 0.7
): Promise<{ base64: string; type: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        const type = "image/jpeg";
        const base64 = canvas.toDataURL(type, quality);
        resolve({ base64, type });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export const CATEGORY_LABELS: Record<string, string> = {
  work: "Work",
  study: "Study",
  fitness: "Fitness",
  personal: "Personal",
  other: "Other",
};

export const PRIORITY_LABELS: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

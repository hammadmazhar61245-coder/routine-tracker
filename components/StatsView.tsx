"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Flame, Settings as SettingsIcon, Download, Trash2, Bell, BellOff } from "lucide-react";
import { useLiveQuery } from "dexie-react-hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { BarChart } from "@/components/BarChart";
import { PieChart } from "@/components/PieChart";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useStats } from "@/hooks/useStats";
import { usePushSubscription } from "@/hooks/usePushSubscription";
import { useTasks } from "@/hooks/useTasks";
import { db, updateSettings, getSettings } from "@/lib/db";
import { formatMonthYear } from "@/lib/utils";

export function StatsView() {
  const stats = useStats();
  const { status, subscribe, unsubscribe } = usePushSubscription();
  const { clearAll, exportAll } = useTasks();
  const [showSettings, setShowSettings] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const settings = useLiveQuery(() => db.settings.toCollection().first(), []);

  useEffect(() => {
    // Ensure a settings row exists — this is a write, so it must run outside useLiveQuery.
    getSettings();
  }, []);

  async function handleExport() {
    const json = await exportAll();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `planflow-tasks-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="px-5 pt-[calc(env(safe-area-inset-top)+16px)] pb-28">
      <header className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight">Stats</h1>
        <button
          onClick={() => setShowSettings(true)}
          className="h-9 w-9 rounded-full flex items-center justify-center hover:bg-card"
          aria-label="Settings"
        >
          <SettingsIcon className="h-5 w-5" />
        </button>
      </header>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-warning mb-1">
              <Flame className="h-4 w-4" />
              <span className="text-xs font-medium text-fg-muted">Current streak</span>
            </div>
            <p className="text-2xl font-bold tabular-nums">
              {stats.streak} <span className="text-sm font-normal text-fg-muted">days</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <span className="text-xs font-medium text-fg-muted">Best day</span>
            <p className="text-2xl font-bold mt-1">{stats.bestDay?.label ?? "—"}</p>
            <p className="text-xs text-fg-muted">{stats.bestDay?.completed ?? 0} completed</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Weekly completion — {stats.weeklyCompletionRate}%</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={stats.last7} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card>
          <CardContent className="pt-4">
            <span className="text-xs font-medium text-fg-muted">Total created</span>
            <p className="text-2xl font-bold tabular-nums mt-1">{stats.totalCreated}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <span className="text-xs font-medium text-fg-muted">Total completed</span>
            <p className="text-2xl font-bold tabular-nums mt-1">{stats.totalCompleted}</p>
          </CardContent>
        </Card>
      </div>

      {stats.categoryBreakdown.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>By category</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={stats.categoryBreakdown} />
          </CardContent>
        </Card>
      )}

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm flex items-end"
            onClick={() => setShowSettings(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="glass card-shadow w-full rounded-t-[var(--radius-modal)] p-5 pb-[calc(env(safe-area-inset-bottom)+24px)] max-h-[85vh] overflow-y-auto"
            >
              <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-border" />
              <h2 className="text-lg font-bold tracking-tight mb-5">Settings</h2>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">Dark mode</span>
                  <ThemeToggle />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {status === "subscribed" ? (
                      <Bell className="h-4 w-4 text-accent" />
                    ) : (
                      <BellOff className="h-4 w-4 text-fg-muted" />
                    )}
                    <div>
                      <p className="font-medium text-sm">Push notifications</p>
                      <p className="text-xs text-fg-muted">
                        {status === "unsupported"
                          ? "Not supported here"
                          : status === "subscribed"
                          ? "Enabled — reminders arrive even when closed"
                          : status === "denied"
                          ? "Blocked — enable in device settings"
                          : status === "loading"
                          ? "Checking…"
                          : "Not enabled yet"}
                      </p>
                    </div>
                  </div>
                  {status === "unsubscribed" && (
                    <button onClick={subscribe} className="text-xs font-medium text-accent">
                      Enable
                    </button>
                  )}
                  {status === "subscribed" && (
                    <button onClick={unsubscribe} className="text-xs font-medium text-fg-muted">
                      Disable
                    </button>
                  )}
                </div>

                <p className="text-xs text-fg-muted bg-accent-soft rounded-xl p-3 leading-relaxed">
                  Reminders are sent as real push notifications from a server, so they
                  arrive at the scheduled time even if PlanFlow is fully closed —
                  the same mechanism iOS uses for other apps.
                </p>

                <div>
                  <label className="text-xs font-medium text-fg-muted mb-1.5 block">
                    Default reminder lead time
                  </label>
                  <div className="flex gap-2">
                    {[0, 5, 10, 15].map((m) => (
                      <button
                        key={m}
                        onClick={() => settings && updateSettings({ defaultReminderMinutes: m })}
                        className={`flex-1 h-9 rounded-lg text-sm font-medium border ${
                          settings?.defaultReminderMinutes === m
                            ? "bg-accent text-accent-fg border-accent"
                            : "border-border text-fg-muted"
                        }`}
                      >
                        {m === 0 ? "On time" : `${m}m`}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleExport}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl border border-border font-medium text-sm"
                >
                  <Download className="h-4 w-4" /> Export tasks as JSON
                </button>

                <button
                  onClick={() => setConfirmClear(true)}
                  className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-danger-soft text-danger font-medium text-sm"
                >
                  <Trash2 className="h-4 w-4" /> Clear all data
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmClear && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-6"
            onClick={() => setConfirmClear(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="glass card-shadow rounded-[var(--radius-modal)] p-6 w-full max-w-xs text-center"
            >
              <p className="font-medium mb-1">Clear all data?</p>
              <p className="text-sm text-fg-muted mb-5">
                All tasks and photos will be permanently deleted.
              </p>
              <div className="flex gap-2">
                <button
                  className="flex-1 h-11 rounded-xl border border-border font-medium"
                  onClick={() => setConfirmClear(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 h-11 rounded-xl bg-danger text-white font-medium"
                  onClick={async () => {
                    await clearAll();
                    setConfirmClear(false);
                    setShowSettings(false);
                  }}
                >
                  Clear
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

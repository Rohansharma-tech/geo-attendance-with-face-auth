// =============================================
// pages/CutoffSettingsPage.jsx — Admin Cutoff Settings
// =============================================

import { useEffect, useState } from "react";
import api from "../api/axios";
import PageWrapper from "../components/PageWrapper";

// ---- Helpers ----

function format12Hour(time24) {
  if (!time24) return "";
  const [hourStr, minuteStr] = time24.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
}

function StatusPill({ enabled, scheduled }) {
  if (enabled && scheduled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        Active — fires at {format12Hour(scheduled)}
      </span>
    );
  }
  if (enabled && !scheduled) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
        Enabled — restart server to activate
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Disabled
    </span>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-slate-100 last:border-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900 text-right">{value || "—"}</p>
    </div>
  );
}

// ---- Main Page ----

export default function CutoffSettingsPage() {
  // Current saved state from server
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [cutoffTime, setCutoffTime] = useState("");
  const [cutoffEnabled, setCutoffEnabled] = useState(true);

  // UI state
  const [saving, setSaving] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [toast, setToast] = useState(null); // { type: "success" | "error", message: string }

  // ---- Fetch current settings ----
  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get("/settings/cutoff");
        setSettings(res.data);
        if (res.data.cutoffTime) {
          setCutoffTime(res.data.cutoffTime);
        }
        setCutoffEnabled(res.data.cutoffEnabled ?? true);
      } catch (err) {
        showToast("error", "Failed to load cutoff settings.");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  // ---- Toast helper ----
  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }

  // ---- Save cutoff time ----
  async function handleSave(e) {
    e.preventDefault();
    if (!cutoffTime) return;

    setSaving(true);
    try {
      const res = await api.put("/settings/cutoff", {
        cutoffTime,
        cutoffEnabled,
      });
      setSettings((prev) => ({
        ...prev,
        ...res.data,
        scheduledCutoff: res.data.scheduledCutoff,
        updatedAt: new Date().toISOString(),
      }));
      showToast(
        "success",
        res.data.cutoffEnabled
          ? `Auto-absent activated — fires at ${format12Hour(cutoffTime)} daily.`
          : "Cutoff time saved but auto-absent is disabled."
      );
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to save cutoff settings.";
      showToast("error", msg);
    } finally {
      setSaving(false);
    }
  }

  // ---- Disable cutoff ----
  async function handleDisable() {
    if (!window.confirm("Disable auto-absent? Users will no longer be marked absent automatically.")) return;
    setDisabling(true);
    try {
      await api.delete("/settings/cutoff");
      setSettings((prev) => ({ ...prev, cutoffEnabled: false, scheduledCutoff: null }));
      setCutoffEnabled(false);
      showToast("success", "Auto-absent has been disabled.");
    } catch (err) {
      showToast("error", "Failed to disable cutoff.");
    } finally {
      setDisabling(false);
    }
  }

  return (
    <PageWrapper
      title="Attendance Settings"
      description="Configure the daily cutoff time after which users are automatically marked absent."
    >
      <div className="space-y-6 max-w-2xl">

        {/* ── Toast ── */}
        {toast && (
          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 text-sm font-medium ${
              toast.type === "success"
                ? "border-green-200 bg-green-50 text-green-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {toast.type === "success" ? (
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="mt-0.5 h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        )}

        {/* ── Current Status Card ── */}
        <section className="card">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="section-label">Auto-Absent Status</p>
              <h2 className="mt-3 text-xl font-semibold text-slate-900">Cutoff Configuration</h2>
            </div>
            {!loading && (
              <StatusPill
                enabled={settings?.cutoffEnabled}
                scheduled={settings?.scheduledCutoff}
              />
            )}
          </div>

          {loading ? (
            <div className="mt-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 w-full animate-pulse rounded bg-slate-100" />
              ))}
            </div>
          ) : (
            <div className="mt-6">
              <InfoRow
                label="Cutoff Time"
                value={settings?.cutoffTime ? format12Hour(settings.cutoffTime) : "Not configured"}
              />
              <InfoRow label="Timezone" value={settings?.cutoffTimeZone} />
              <InfoRow
                label="Status"
                value={settings?.cutoffEnabled ? "Enabled" : "Disabled"}
              />
              <InfoRow
                label="Last Updated"
                value={
                  settings?.updatedAt
                    ? new Date(settings.updatedAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })
                    : "Never"
                }
              />
            </div>
          )}
        </section>

        {/* ── How it works ── */}
        <section className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <p className="text-sm font-semibold text-blue-800">How Auto-Absent Works</p>
          <ul className="mt-3 space-y-2 text-sm text-blue-700">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-400">→</span>
              At the configured cutoff time each day, the system scans all user accounts.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-400">→</span>
              Users with no attendance record — or an incomplete one — are automatically marked <strong>Absent</strong>.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-400">→</span>
              Users already marked <strong>Present</strong> are never affected. Past records are never modified.
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-blue-400">→</span>
              These records are tagged <strong>Auto-Marked</strong> and are visible in the Attendance Records table.
            </li>
          </ul>
        </section>

        {/* ── Set Cutoff Form ── */}
        <section className="card">
          <p className="section-label">Configure Cutoff Time</p>
          <h2 className="mt-3 text-xl font-semibold text-slate-900">Set or Update Cutoff</h2>
          <p className="mt-2 text-sm text-slate-500">
            Changes take effect immediately — the scheduler restarts in-process.
          </p>

          <form onSubmit={handleSave} className="mt-6 space-y-5">
            {/* Time picker */}
            <div>
              <label htmlFor="cutoff-time" className="block text-sm font-medium text-slate-700 mb-1.5">
                Cutoff Time <span className="text-slate-400">(24-hour format)</span>
              </label>
              <input
                id="cutoff-time"
                type="time"
                className="input-field max-w-xs"
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                required
              />
              {cutoffTime && (
                <p className="mt-1.5 text-xs text-slate-500">
                  Displayed as: <span className="font-medium text-slate-700">{format12Hour(cutoffTime)}</span>
                </p>
              )}
            </div>

            {/* Enable toggle */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="cutoff-enabled-toggle"
                role="switch"
                aria-checked={cutoffEnabled}
                onClick={() => setCutoffEnabled((v) => !v)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  cutoffEnabled ? "bg-blue-600" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
                    cutoffEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm font-medium text-slate-700">
                {cutoffEnabled ? "Auto-absent enabled" : "Auto-absent disabled (save to apply)"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="save-cutoff-btn"
                type="submit"
                disabled={saving || !cutoffTime}
                className="btn-primary disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Cutoff Time"}
              </button>

              {settings?.cutoffEnabled && (
                <button
                  id="disable-cutoff-btn"
                  type="button"
                  disabled={disabling}
                  onClick={handleDisable}
                  className="btn-secondary text-red-600 hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                >
                  {disabling ? "Disabling…" : "Disable Auto-Absent"}
                </button>
              )}
            </div>
          </form>
        </section>

      </div>
    </PageWrapper>
  );
}

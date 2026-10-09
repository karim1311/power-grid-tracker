"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Outage {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  status: string;
  note: string | null;
}

export function CreateOutageForm() {
  const router = useRouter();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("/api/outages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startTime, endTime: endTime || null, note: note || null }),
      });

      const data: { error?: string } = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create outage");
        return;
      }

      setStartTime("");
      setEndTime("");
      setNote("");
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Unable to save the outage. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={loading} className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-6">
      <h2 className="text-lg font-semibold mb-4">Record an Outage</h2>
      {error && (
        <div id="create-outage-error" role="alert" aria-live="assertive" className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      {success && (
        <p role="status" aria-live="polite" className="mb-4 text-sm text-green-700 dark:text-green-400">
          Outage saved successfully.
        </p>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="outage-start-time" className="block text-sm font-medium mb-1">Start Time</label>
          <input
            id="outage-start-time"
            name="startTime"
            type="datetime-local"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          />
        </div>
        <div>
          <label htmlFor="outage-end-time" className="block text-sm font-medium mb-1">End Time (optional)</label>
          <input
            id="outage-end-time"
            name="endTime"
            type="datetime-local"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          />
        </div>
        <div>
          <label htmlFor="outage-note" className="block text-sm font-medium mb-1">Note</label>
          <textarea
            id="outage-note"
            name="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded transition-colors"
        >
          {loading ? "Saving..." : "Save Outage"}
        </button>
      </div>
    </form>
  );
}

export function OutageList({ outages }: { outages: Outage[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setError(null);
    setDeletingId(id);
    try {
      const res = await fetch(`/api/outages/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data: { error?: string } = await res.json();
        setError(data.error || "Failed to delete outage");
        return;
      }
      router.refresh();
    } catch {
      setError("Unable to delete the outage. Check your connection and try again.");
    } finally {
      setDeletingId(null);
    }
  }

  if (outages.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-8 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">No outages recorded yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <p role="alert" aria-live="assertive" className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      {outages.map((outage) => (
        <div
          key={outage.id}
          className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                    outage.status === "ONGOING"
                      ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                      : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  }`}
                >
                  {outage.status}
                </span>
                {outage.duration > 0 && (
                  <span className="text-xs text-zinc-500 dark:text-zinc-400">
                    {outage.duration}s
                  </span>
                )}
              </div>
              <p className="text-sm font-medium">
                {new Date(outage.startTime).toLocaleString()} —{" "}
                {outage.endTime ? new Date(outage.endTime).toLocaleString() : "ongoing"}
              </p>
              {outage.note && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{outage.note}</p>
              )}
            </div>
            <div className="flex gap-2">
              <a
                href={`/outages/${outage.id}/edit`}
                className="text-sm text-blue-600 hover:text-blue-700 px-3 py-1 rounded border border-zinc-200 dark:border-zinc-700"
              >
                Edit
              </a>
              <button
                type="button"
                onClick={() => handleDelete(outage.id)}
                disabled={deletingId === outage.id}
                aria-label={`${deletingId === outage.id ? "Deleting" : "Delete"} outage starting ${new Date(outage.startTime).toLocaleString()}`}
                className="text-sm text-red-600 hover:text-red-700 px-3 py-1 rounded border border-zinc-200 dark:border-zinc-700 disabled:opacity-50"
              >
                {deletingId === outage.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

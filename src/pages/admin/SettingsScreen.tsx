import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import PageShell from "../../components/PageShell";
import type { NavKey } from "../../components/Sidebar";
import { updateAdminPassword } from "../../lib/adminApi";

interface SettingsScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

export default function SettingsScreen({
  onNavigate,
  onLogout,
}: SettingsScreenProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  const passwordMutation = useMutation({
    mutationFn: () =>
      updateAdminPassword({
        currentPassword: current,
        newPassword: next,
      }),
  });

  const canSave = current.length > 0 && next.length >= 8 && next === confirm;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    passwordMutation.mutate();
  }

  return (
    <PageShell active="settings" onNavigate={onNavigate} onLogout={onLogout}>
      <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage your admin account preferences and security.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-5 max-w-2xl rounded-xl border border-neutral-200 bg-white p-5"
      >
        <h3 className="text-sm font-semibold text-neutral-800">
          Change Password
        </h3>

        <label className="mt-4 block text-sm font-medium text-neutral-700">
          Current Password
        </label>
        <input
          type="password"
          value={current}
          onChange={(event) => setCurrent(event.target.value)}
          placeholder="•••••••••••••"
          className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              New Password
            </label>
            <input
              type="password"
              value={next}
              onChange={(event) => setNext(event.target.value)}
              placeholder="Minimum 8 characters"
              className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              placeholder="Re-enter new password"
              className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />
          </div>
        </div>

        {passwordMutation.isSuccess && (
          <p className="mt-4 text-sm font-medium text-emerald-600">
            Password updated successfully.
          </p>
        )}

        {passwordMutation.isError && (
          <p className="mt-4 text-sm font-medium text-red-600">
            Unable to update password. Please try again.
          </p>
        )}

        <button
          type="submit"
          disabled={!canSave || passwordMutation.isPending}
          className="mt-5 rounded-lg bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
        >
          {passwordMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </PageShell>
  );
}

import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, AlertCircle, CheckCircle } from "lucide-react";
import PageShell from "../../components/PageShell";
import type { NavKey } from "../../components/Sidebar";
import { broadcastNotification } from "../../lib/adminApi";
import BroadcastComposer from "./BroadcastComposer";

interface BroadcastScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

export function LegacyBroadcastScreen({
  onNavigate,
  onLogout,
}: BroadcastScreenProps) {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [audience, setAudience] = useState<"all" | "admins" | "users">("all");
  const [error, setError] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const broadcastMutation = useMutation({
    mutationFn: () =>
      broadcastNotification({
        title: title.trim(),
        message: message.trim(),
        audience,
        accountStatus: "active",
        verification: "all",
        sendViaEmail: true,
        sendViaPush: true,
      }),
    onSuccess: (data) => {
      setSuccessId(data.id);
      setTitle("");
      setMessage("");
      setAudience("all");
      setError(null);

      // Clear success message after 5 seconds
      setTimeout(() => setSuccessId(null), 5000);
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send broadcast";
      setError(errorMessage);
    },
  });

  const isValid = title.trim().length > 0 && message.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) {
      setError("Please fill in all required fields");
      return;
    }
    broadcastMutation.mutate();
  }

  const audienceLabels: Record<"all" | "admins" | "users", string> = {
    all: "All Users & Admins",
    admins: "Admins Only",
    users: "Users Only",
  };

  return (
    <PageShell active="settings" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        <h1 className="text-xl font-bold text-neutral-900">
          Broadcast Message
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Send notifications to users and admins across the platform.
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Broadcast Form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-neutral-200 bg-white p-6"
        >
          <h3 className="text-sm font-semibold text-neutral-800">
            Send Broadcast
          </h3>

          {/* Error Alert */}
          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-red-50 p-3 border border-red-200">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {successId && (
            <div className="mt-4 flex items-start gap-3 rounded-lg bg-green-50 p-3 border border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-green-800">
                  Broadcast sent successfully!
                </p>
                <p className="text-xs text-green-700 mt-1">ID: {successId}</p>
              </div>
            </div>
          )}

          {/* Title Input */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              disabled={broadcastMutation.isPending}
              placeholder="Enter broadcast title"
              maxLength={100}
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-50 disabled:text-neutral-500"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {title.length}/100 characters
            </p>
          </div>

          {/* Message Textarea */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700">
              Message *
            </label>
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                setError(null);
              }}
              disabled={broadcastMutation.isPending}
              placeholder="Enter your broadcast message"
              maxLength={1000}
              rows={5}
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-50 disabled:text-neutral-500 resize-none"
            />
            <p className="mt-1 text-xs text-neutral-500">
              {message.length}/1000 characters
            </p>
          </div>

          {/* Audience Select */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-neutral-700">
              Audience
            </label>
            <select
              value={audience}
              onChange={(e) =>
                setAudience(e.target.value as "all" | "admins" | "users")
              }
              disabled={broadcastMutation.isPending}
              className="mt-2 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100 disabled:bg-neutral-50 disabled:text-neutral-500"
            >
              <option value="all">{audienceLabels.all}</option>
              <option value="admins">{audienceLabels.admins}</option>
              <option value="users">{audienceLabels.users}</option>
            </select>
            <p className="mt-1 text-xs text-neutral-500">
              Select who will receive this notification
            </p>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isValid || broadcastMutation.isPending}
            className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-700 disabled:bg-orange-400 disabled:cursor-not-allowed"
          >
            {broadcastMutation.isPending ? (
              <>
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                Sending...
              </>
            ) : (
              <>
                <Send size={16} />
                Send Broadcast
              </>
            )}
          </button>
        </form>

        {/* Info Panel */}
        <div className="space-y-4">
          {/* Tips Card */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-800">Tips</h3>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li className="flex gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Keep titles concise and descriptive</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>Use clear language in your message</span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>
                  Choose the right audience to avoid unnecessary notifications
                </span>
              </li>
              <li className="flex gap-2">
                <span className="text-orange-600 font-bold">•</span>
                <span>
                  Recipients will receive this notification in their app
                </span>
              </li>
            </ul>
          </div>

          {/* Audience Info Card */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6">
            <h3 className="text-sm font-semibold text-neutral-800">
              Audience Guide
            </h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div>
                <dt className="font-medium text-neutral-700">
                  All Users & Admins
                </dt>
                <dd className="mt-1 text-neutral-600">
                  Notification goes to every user and admin on the platform
                </dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-700">Admins Only</dt>
                <dd className="mt-1 text-neutral-600">
                  Notification is sent only to admin accounts
                </dd>
              </div>
              <div>
                <dt className="font-medium text-neutral-700">Users Only</dt>
                <dd className="mt-1 text-neutral-600">
                  Notification is sent only to regular user accounts
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

export default function BroadcastScreen(props: BroadcastScreenProps) {
  return <BroadcastComposer {...props} />;
}

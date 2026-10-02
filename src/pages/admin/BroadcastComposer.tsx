import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AlertCircle, BellRing, CheckCircle2, Mail, Send, Users } from "lucide-react";
import PageShell from "../../components/PageShell";
import type { NavKey } from "../../components/Sidebar";
import { broadcastNotification, previewBroadcastRecipients } from "../../lib/adminApi";
import type { BroadcastTarget } from "../../lib/adminApi";

interface BroadcastScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

type Channel = "email" | "push";
type Audience = BroadcastTarget["audience"];

export default function BroadcastComposer({ onNavigate, onLogout }: BroadcastScreenProps) {
  const [channel, setChannel] = useState<Channel>("push");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [audience, setAudience] = useState<Audience>("all");
  const [accountStatus, setAccountStatus] = useState<BroadcastTarget["accountStatus"]>("active");
  const [verification, setVerification] = useState<BroadcastTarget["verification"]>("all");
  const [recipientText, setRecipientText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  const recipientEmails = useMemo(
    () => [...new Set(recipientText.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean))],
    [recipientText],
  );
  const target: BroadcastTarget = { audience, accountStatus, verification, recipientEmails };
  const previewQuery = useQuery({
    queryKey: ["broadcast-recipient-preview", audience, accountStatus, verification, recipientEmails],
    queryFn: () => previewBroadcastRecipients(target),
    enabled: audience !== "specific" || recipientEmails.length > 0,
  });

  const broadcastMutation = useMutation({
    mutationFn: () => broadcastNotification({
      ...target,
      title: title.trim(),
      message: message.trim(),
      content: content.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      sendViaEmail: channel === "email",
      sendViaPush: channel === "push",
    }),
    onSuccess: (result) => {
      setResultMessage(`${result.message}. Email sent: ${result.details.emailSent}; push delivered: ${result.details.pushSent}${result.details.pushFailed ? `; push failed: ${result.details.pushFailed}` : ""}.`);
      setTitle("");
      setMessage("");
      setContent("");
      setImageUrl("");
      setError(null);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Broadcast could not be sent.");
    },
  });

  const hasValidRecipients = audience !== "specific" || (
    recipientEmails.length > 0 && recipientEmails.every((email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
  );
  const isValid = title.trim().length > 0 && message.trim().length > 0 && hasValidRecipients;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isValid) {
      setError(audience === "specific" ? "Enter valid recipient email addresses." : "Add a title and message before sending.");
      return;
    }
    const recipientCount = previewQuery.data?.recipientCount ?? 0;
    if (recipientCount === 0) {
      setError("No recipients match these filters.");
      return;
    }
    if (recipientCount > 500 && !window.confirm(`Send this ${channel} broadcast to ${recipientCount.toLocaleString()} recipients?`)) return;
    broadcastMutation.mutate();
  }

  return (
    <PageShell active="settings" onNavigate={onNavigate} onLogout={onLogout}>
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Campaigns</p>
        <h1 className="mt-1 text-xl font-bold text-neutral-900">Broadcast</h1>
        <p className="mt-1 text-sm text-neutral-500">Compose one message and select its delivery channel and audience.</p>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <form onSubmit={handleSubmit} className="rounded-xl border border-neutral-200 bg-white p-5">
          <div className="flex w-fit gap-1 rounded-lg bg-neutral-100 p-1" role="tablist" aria-label="Broadcast channel">
            <button type="button" role="tab" aria-selected={channel === "push"} onClick={() => setChannel("push")} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${channel === "push" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}>
              <BellRing size={15} /> Push notification
            </button>
            <button type="button" role="tab" aria-selected={channel === "email"} onClick={() => setChannel("email")} className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${channel === "email" ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-800"}`}>
              <Mail size={15} /> Email
            </button>
          </div>

          {error && <div role="alert" className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800"><AlertCircle size={17} className="mt-0.5 shrink-0" />{error}</div>}
          {resultMessage && <div role="status" className="mt-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800"><CheckCircle2 size={17} className="mt-0.5 shrink-0" />{resultMessage}</div>}

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-neutral-700">
              Audience
              <select value={audience} onChange={(event) => setAudience(event.target.value as Audience)} disabled={broadcastMutation.isPending} className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100">
                <option value="all">All accounts</option><option value="users">Customers</option><option value="admins">Admins</option><option value="specific">Specific email addresses</option>
              </select>
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Account status
              <select value={accountStatus} onChange={(event) => setAccountStatus(event.target.value as BroadcastTarget["accountStatus"])} disabled={broadcastMutation.isPending} className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100">
                <option value="active">Active accounts</option><option value="inactive">Inactive accounts</option><option value="all">Any status</option>
              </select>
            </label>
            <label className="text-sm font-medium text-neutral-700">
              Verification
              <select value={verification} onChange={(event) => setVerification(event.target.value as BroadcastTarget["verification"])} disabled={broadcastMutation.isPending} className="mt-1.5 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100">
                <option value="all">All verification states</option><option value="verified">Verified only</option><option value="unverified">Unverified only</option>
              </select>
            </label>
            <div className="flex items-end">
              <div className="flex w-full items-center gap-2 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-sm">
                <Users size={16} className="text-orange-600" />
                <span className="text-neutral-600">Recipients</span>
                <strong className="ml-auto text-neutral-900">{previewQuery.isLoading ? "…" : previewQuery.data?.recipientCount.toLocaleString() ?? "—"}</strong>
              </div>
            </div>
          </div>

          {audience === "specific" && <label className="mt-4 block text-sm font-medium text-neutral-700">
            Recipient emails
            <textarea value={recipientText} onChange={(event) => setRecipientText(event.target.value)} disabled={broadcastMutation.isPending} rows={3} placeholder="name@example.com, another@example.com" className="mt-1.5 w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
            <span className="mt-1 block text-xs font-normal text-neutral-500">Separate addresses with commas, spaces, or new lines.</span>
          </label>}

          <div className="mt-4 border-t border-neutral-100 pt-4">
            <label className="block text-sm font-medium text-neutral-700">
              {channel === "email" ? "Email subject" : "Notification title"}
              <input value={title} onChange={(event) => { setTitle(event.target.value); setError(null); }} disabled={broadcastMutation.isPending} maxLength={120} placeholder={channel === "email" ? "A concise subject line" : "Short notification title"} className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
              <span className="mt-1 block text-right text-xs font-normal text-neutral-400">{title.length}/120</span>
            </label>
            <label className="mt-3 block text-sm font-medium text-neutral-700">
              Message
              <textarea value={message} onChange={(event) => { setMessage(event.target.value); setError(null); }} disabled={broadcastMutation.isPending} maxLength={1000} rows={4} placeholder="Write the message recipients will receive." className="mt-1.5 w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
              <span className="mt-1 block text-right text-xs font-normal text-neutral-400">{message.length}/1000</span>
            </label>
            {channel === "email" && <>
              <label className="mt-3 block text-sm font-medium text-neutral-700">Additional email content <span className="font-normal text-neutral-400">(optional)</span>
                <textarea value={content} onChange={(event) => setContent(event.target.value)} disabled={broadcastMutation.isPending} rows={3} placeholder="Longer details for the email body" className="mt-1.5 w-full resize-y rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
              </label>
              <label className="mt-3 block text-sm font-medium text-neutral-700">Featured image URL <span className="font-normal text-neutral-400">(optional)</span>
                <input type="url" value={imageUrl} onChange={(event) => setImageUrl(event.target.value)} disabled={broadcastMutation.isPending} placeholder="https://…" className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2.5 text-sm font-normal outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
              </label>
            </>}
          </div>

          <button type="submit" disabled={!isValid || broadcastMutation.isPending || previewQuery.isLoading || previewQuery.data?.recipientCount === 0} className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-500">
            <Send size={16} />{broadcastMutation.isPending ? "Sending…" : `Send ${channel === "email" ? "email" : "push notification"}`}
          </button>
        </form>

        <aside className="space-y-4">
          <section className="rounded-xl border border-neutral-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-neutral-900">Campaign summary</h2>
            <dl className="mt-3 divide-y divide-neutral-100 text-sm">
              <div className="flex justify-between py-2"><dt className="text-neutral-500">Channel</dt><dd className="font-medium text-neutral-800">{channel === "email" ? "Email" : "Push notification"}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-neutral-500">Audience</dt><dd className="font-medium text-neutral-800">{audience === "all" ? "All accounts" : audience === "users" ? "Customers" : audience === "admins" ? "Admins" : "Specific emails"}</dd></div>
              <div className="flex justify-between py-2"><dt className="text-neutral-500">Estimated reach</dt><dd className="font-semibold text-neutral-900">{previewQuery.data?.recipientCount.toLocaleString() ?? "—"}</dd></div>
            </dl>
            {previewQuery.isError && <p className="mt-2 text-xs text-red-600">Could not calculate recipient count. Retry by changing a filter.</p>}
            {audience === "specific" && <p className="mt-2 text-xs text-neutral-500">Only active, non-deleted matching accounts receive this campaign.</p>}
          </section>
          <section className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <h2 className="text-sm font-semibold text-neutral-900">Delivery controls</h2>
            <ul className="mt-3 space-y-2 text-xs leading-5 text-neutral-600">
              <li>Email and push are sent as separate campaigns.</li>
              <li>Audience filters apply to both channels, including custom recipient lists.</li>
              <li>Large campaigns ask for confirmation before sending.</li>
              <li>Delivery totals are reported when the send completes.</li>
            </ul>
          </section>
        </aside>
      </div>
    </PageShell>
  );
}
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  RotateCw,
  Search,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import PageShell from "../../components/PageShell";
import type { NavKey } from "../../components/Sidebar";
import { StatCard, StatusBadge } from "../../components/StatCard";
import { fetchProviderReliabilityIndex } from "../../lib/adminApi";
import type { ProviderReliability } from "../../types";

interface ProvidersScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

type ProviderFilter = "All" | "Online" | "Degraded" | "Offline";

function providerStatus(provider: ProviderReliability) {
  if (!provider.provider_online) return "Offline";
  if (provider.success_percentage < 95 || provider.failure_percentage > 5) return "Degraded";
  return "Active";
}

function verticalLabel(vertical: string) {
  return vertical.toLowerCase().replace(/^\w/, (letter) => letter.toUpperCase());
}

function percentage(value: number) {
  return `${Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 1 })}%`;
}

function exportProviders(providers: ProviderReliability[]) {
  const rows = [
    ["Vertical", "Provider", "Success %", "Pending %", "Failure %", "Online"],
    ...providers.map((provider) => [
      provider.vertical,
      provider.disco_code,
      provider.success_percentage,
      provider.pending_percentage,
      provider.failure_percentage,
      provider.provider_online ? "Yes" : "No",
    ]),
  ];
  const csv = rows
    .map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "provider-reliability.csv";
  link.click();
  URL.revokeObjectURL(url);
}

export default function ProviderReliabilityDashboard({ onNavigate, onLogout }: ProvidersScreenProps) {
  const [query, setQuery] = useState("");
  const [vertical, setVertical] = useState("All");
  const [statusFilter, setStatusFilter] = useState<ProviderFilter>("All");
  const providersQuery = useQuery({
    queryKey: ["provider-reliability-index"],
    queryFn: fetchProviderReliabilityIndex,
    refetchInterval: 60_000,
  });
  const providers = providersQuery.data ?? [];

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return providers.filter((provider) => {
      const matchesQuery =
        !normalizedQuery ||
        provider.disco_code.toLowerCase().includes(normalizedQuery) ||
        provider.vertical.toLowerCase().includes(normalizedQuery);
      const matchesVertical = vertical === "All" || provider.vertical === vertical;
      const status = providerStatus(provider);
      const matchesStatus = statusFilter === "All" ||
        (statusFilter === "Online" ? provider.provider_online : status === statusFilter);
      return matchesQuery && matchesVertical && matchesStatus;
    });
  }, [providers, query, statusFilter, vertical]);

  const onlineCount = providers.filter((provider) => provider.provider_online).length;
  const degradedCount = providers.filter((provider) => providerStatus(provider) === "Degraded").length;
  const offlineCount = providers.filter((provider) => !provider.provider_online).length;
  const lastUpdated = providersQuery.dataUpdatedAt
    ? new Date(providersQuery.dataUpdatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Not yet";

  return (
    <PageShell active="providers" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-600">Service health</p>
          <h1 className="mt-1 text-xl font-bold text-neutral-900">Provider reliability</h1>
          <p className="mt-1 text-sm text-neutral-500">Live transaction success and provider availability by service.</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>Updated {lastUpdated}</span>
          <button type="button" onClick={() => void providersQuery.refetch()} disabled={providersQuery.isFetching} aria-label="Refresh provider reliability" className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 disabled:opacity-50">
            <RotateCw size={15} className={providersQuery.isFetching ? "animate-spin" : ""} />
          </button>
          <button type="button" onClick={() => exportProviders(filtered)} disabled={!filtered.length} className="inline-flex h-9 items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 font-medium text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">
            <Download size={15} /> Export
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Providers monitored" value={String(providers.length)} icon={<ShieldCheck size={16} className="text-orange-600" />} />
        <StatCard label="Online" value={String(onlineCount)} icon={<CheckCircle2 size={16} className="text-emerald-600" />} iconBg="bg-emerald-50" />
        <StatCard label="Needs attention" value={String(degradedCount + offlineCount)} icon={<AlertTriangle size={16} className="text-amber-600" />} iconBg="bg-amber-50" />
      </div>

      <section className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-neutral-100 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-xs">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search provider or vertical" className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select value={vertical} onChange={(event) => setVertical(event.target.value)} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
              <option>All</option>
              {[...new Set(providers.map((provider) => provider.vertical))].sort().map((item) => <option key={item} value={item}>{verticalLabel(item)}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ProviderFilter)} className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-700">
              <option>All</option><option>Online</option><option>Degraded</option><option>Offline</option>
            </select>
          </div>
        </div>

        {providersQuery.isError ? (
          <div className="p-10 text-center">
            <WifiOff className="mx-auto text-red-500" size={22} />
            <p className="mt-2 text-sm font-semibold text-neutral-800">Reliability data is unavailable</p>
            <p className="mt-1 text-xs text-neutral-500">Check the admin session or try again.</p>
            <button type="button" onClick={() => void providersQuery.refetch()} className="mt-3 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white hover:bg-orange-700">Retry</button>
          </div>
        ) : providersQuery.isPending ? (
          <div className="p-10 text-center text-sm text-neutral-400">Loading provider reliability…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead><tr className="border-b border-neutral-100 bg-neutral-50 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-4 py-3">Provider</th><th className="px-4 py-3">Success</th><th className="px-4 py-3">Pending</th><th className="px-4 py-3">Failed</th><th className="px-4 py-3">Availability</th>
              </tr></thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map((provider) => {
                  const status = providerStatus(provider);
                  return <tr key={`${provider.vertical}-${provider.disco_code}`} className="text-neutral-700">
                    <td className="px-4 py-3"><p className="font-semibold text-neutral-900">{provider.disco_code}</p><p className="mt-0.5 text-xs text-neutral-500">{verticalLabel(provider.vertical)}</p></td>
                    <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.max(0, Math.min(100, provider.success_percentage))}%` }} /></div><span className="font-semibold text-neutral-800">{percentage(provider.success_percentage)}</span></div></td>
                    <td className="px-4 py-3 text-neutral-600">{percentage(provider.pending_percentage)}</td><td className="px-4 py-3 text-neutral-600">{percentage(provider.failure_percentage)}</td><td className="px-4 py-3"><StatusBadge status={status} /></td>
                  </tr>;
                })}
                {!filtered.length && <tr><td colSpan={5} className="px-4 py-10 text-center text-sm text-neutral-400">No providers match these filters.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </PageShell>
  );
}
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Download,
  RotateCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
} from "lucide-react";
import PageShell from "../../components/PageShell";
import type { NavKey } from "../../components/Sidebar";
import { StatCard, StatusBadge } from "../../components/StatCard";
import {
  createProvider,
  fetchAdminProviders,
  syncProvider,
  toggleProviderStatus,
} from "../../lib/adminApi";
import type { Provider } from "../../types";
import ProviderReliabilityDashboard from "./ProviderReliabilityDashboard";

interface ProvidersScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

function uptimeBarColor(status: string) {
  if (status === "Active") return "bg-emerald-500";
  if (status === "Degraded") return "bg-amber-500";
  return "bg-red-400";
}

export function LegacyProvidersScreen({
  onNavigate,
  onLogout,
}: ProvidersScreenProps) {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Degraded" | "Offline"
  >("All");
  const [form, setForm] = useState({
    name: "",
    fullName: "",
    region: "",
    totalMeters: "0",
    status: "Active" as Provider["status"],
  });

  const providersQuery = useQuery({
    queryKey: ["admin-providers"],
    queryFn: fetchAdminProviders,
  });

  const providers = providersQuery.data ?? [];

  const filtered = useMemo(() => {
    return providers.filter((p) => {
      const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || p.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, providers]);

  const createMutation = useMutation({
    mutationFn: () =>
      createProvider({
        name: form.name,
        fullName: form.fullName,
        region: form.region,
        totalMeters: Number(form.totalMeters),
        uptime: 99,
        status: form.status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] });
      setForm({
        name: "",
        fullName: "",
        region: "",
        totalMeters: "0",
        status: "Active",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({
      providerId,
      status,
    }: {
      providerId: string;
      status: Provider["status"];
    }) => toggleProviderStatus(providerId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] }),
  });

  const syncMutation = useMutation({
    mutationFn: (providerId: string) => syncProvider(providerId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin-providers"] }),
  });

  return (
    <PageShell active="providers" onNavigate={onNavigate} onLogout={onLogout}>
      <h1 className="text-xl font-bold text-neutral-900">Providers</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage and monitor electricity distribution providers integrated on the
        platform.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Total Providers"
          value={String(providers.length)}
          icon={<ShieldCheck size={16} className="text-orange-600" />}
        />
        <StatCard
          label="Active Providers"
          value={String(
            providers.filter((provider) => provider.status === "Active").length,
          )}
          icon={<CheckCircle2 size={16} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Degraded Providers"
          value={String(
            providers.filter((provider) => provider.status === "Degraded")
              .length,
          )}
          icon={<AlertTriangle size={16} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-4">
        <h3 className="text-sm font-semibold text-neutral-800">Add provider</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-5">
          <input
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({ ...current, name: event.target.value }))
            }
            placeholder="Provider code"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
          <input
            value={form.fullName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                fullName: event.target.value,
              }))
            }
            placeholder="Full name"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
          <input
            value={form.region}
            onChange={(event) =>
              setForm((current) => ({ ...current, region: event.target.value }))
            }
            placeholder="Region"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
          <input
            type="number"
            value={form.totalMeters}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                totalMeters: event.target.value,
              }))
            }
            placeholder="Total meters"
            className="rounded-lg border border-neutral-200 px-3 py-2 text-sm outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
          />
          <button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={
              createMutation.isPending ||
              !form.name ||
              !form.fullName ||
              !form.region
            }
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
          >
            <Plus size={15} />
            {createMutation.isPending ? "Saving..." : "Create"}
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search providers"
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              queryClient.invalidateQueries({ queryKey: ["admin-providers"] })
            }
            className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50"
          >
            <RotateCw size={15} />
            Sync All
          </button>
          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as typeof statusFilter)
            }
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600"
          >
            <option value="All">Status: All</option>
            <option value="Active">Active</option>
            <option value="Degraded">Degraded</option>
            <option value="Offline">Offline</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-xs font-medium uppercase tracking-wide text-neutral-400">
              <th className="px-4 py-3">Provider Name</th>
              <th className="px-4 py-3">Region</th>
              <th className="px-4 py-3">Total Meters</th>
              <th className="px-4 py-3">Uptime</th>
              <th className="px-4 py-3">Last Sync</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {providersQuery.isPending ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-neutral-400"
                >
                  Loading providers...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((p) => (
                <tr key={p.id} className="text-neutral-700">
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">{p.name}</p>
                    <p className="text-xs text-neutral-400">{p.fullName}</p>
                  </td>
                  <td className="px-4 py-3">{p.region}</td>
                  <td className="px-4 py-3">
                    {p.totalMeters.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-neutral-100">
                        <div
                          className={`h-full rounded-full ${uptimeBarColor(p.status)}`}
                          style={{ width: `${p.uptime}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">
                        {p.uptime}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{p.lastSync}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() =>
                          statusMutation.mutate({
                            providerId: p.id,
                            status:
                              p.status === "Active" ? "Degraded" : "Active",
                          })
                        }
                        className="rounded-md bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-600 hover:bg-orange-100"
                      >
                        {p.status === "Active" ? "Degrade" : "Activate"}
                      </button>
                      <button
                        onClick={() => syncMutation.mutate(p.id)}
                        className="rounded-md border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                      >
                        Sync
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-neutral-400"
                >
                  No providers match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </PageShell>
  );
}

export default function ProvidersScreen(props: ProvidersScreenProps) {
  return <ProviderReliabilityDashboard {...props} />;
}

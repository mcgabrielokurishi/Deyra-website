import { useMemo, useState } from "react";
import {
  Search,
  Download,
  Receipt,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../../components/PageShell";
import type { NavKey } from "../../components/Sidebar";
import { StatCard, StatusBadge } from "../../components/StatCard";
import { fetchAdminTransactions } from "../../lib/adminApi";

interface TransactionsScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

const PAGE_SIZE = 7;

export default function TransactionsScreen({
  onNavigate,
  onLogout,
}: TransactionsScreenProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Success" | "Failed" | "Pending"
  >("All");
  const [page, setPage] = useState(1);

  const transactionsQuery = useQuery({
    queryKey: ["admin-transactions"],
    queryFn: () => fetchAdminTransactions(),
  });

  const transactions = transactionsQuery.data ?? [];

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const safeName = String(t?.name ?? "");
      const safeStatus = String(t?.status ?? "Pending");
      const matchesQuery = safeName.toLowerCase().includes(query.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || safeStatus === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, transactions]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const typeStyles: Record<string, string> = {
    "Top-Up": "bg-orange-50 text-orange-600",
    Purchase: "bg-sky-50 text-sky-600",
    Transfer: "bg-violet-50 text-violet-600",
    Refund: "bg-sky-50 text-sky-600",
  };

  return (
    <PageShell
      active="transactions"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <h1 className="text-xl font-bold text-neutral-900">Transactions</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage and monitor all financial transactions on this platform.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Transactions"
          value={String(transactions.length)}
          icon={<Receipt size={16} className="text-orange-600" />}
        />
        <StatCard
          label="Successful Transactions"
          value={String(
            transactions.filter((t) => t.status === "Success").length,
          )}
          icon={<CheckCircle2 size={16} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
        />
        <StatCard
          label="Failed Transactions"
          value={String(
            transactions.filter((t) => t.status === "Failed").length,
          )}
          icon={<XCircle size={16} className="text-red-500" />}
          iconBg="bg-red-50"
        />
        <StatCard
          label="Pending Transactions"
          value={String(
            transactions.filter((t) => t.status === "Pending").length,
          )}
          icon={<Clock size={16} className="text-amber-600" />}
          iconBg="bg-amber-50"
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search users by name or email"
            className="w-full rounded-lg border border-neutral-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as typeof statusFilter);
              setPage(1);
            }}
            className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm text-neutral-600"
          >
            <option value="All">Status: All</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-xs font-medium uppercase tracking-wide text-neutral-400">
              <th className="px-4 py-3">Transaction ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Provider</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date &amp; Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {transactionsQuery.isPending ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-neutral-400"
                >
                  Loading transactions...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-sm text-neutral-400"
                >
                  No transactions match your search.
                </td>
              </tr>
            ) : (
              filtered
                .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                .map((t) => (
                  <tr key={t.id} className="text-neutral-700">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {t.transactionId}
                    </td>
                    <td className="px-4 py-3">{t.name}</td>
                    <td className="px-4 py-3 font-medium">
                      ₦{t.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${typeStyles[t.type]}`}
                      >
                        {t.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{t.provider}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {t.date}
                      <br />
                      <span className="text-xs">{t.time}</span>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>

        <div className="flex items-center justify-between border-t border-neutral-100 px-4 py-3 text-xs text-neutral-500">
          <span>
            Showing {filtered.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1} to{" "}
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}{" "}
            transactions
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="rounded-md px-2 py-1 hover:bg-neutral-50 disabled:opacity-40"
            >
              Previous
            </button>
            {Array.from(
              { length: Math.min(totalPages, 5) },
              (_, i) => i + 1,
            ).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`h-7 w-7 rounded-md ${
                  page === n
                    ? "bg-orange-600 text-white"
                    : "hover:bg-neutral-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="rounded-md px-2 py-1 hover:bg-neutral-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

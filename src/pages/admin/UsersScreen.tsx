import { useMemo, useState } from "react";
import { Eye, Ban, Search, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import PageShell from "../../components/PageShell";
import type { NavKey } from "../../components/Sidebar";
import { StatCard, StatusBadge } from "../../components/StatCard";
import { fetchAdminUsers } from "../../lib/adminApi";
import type { PlatformUser } from "../../types";

interface UsersScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
  onViewUser: (user: PlatformUser) => void;
}

const PAGE_SIZE = 7;

export default function UsersScreen({
  onNavigate,
  onLogout,
  onViewUser,
}: UsersScreenProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");
  const [page, setPage] = useState(1);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  const users = usersQuery.data ?? [];

  const filtered = useMemo(() => {
    return users.filter((u) => {
      const matchesQuery =
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.email.toLowerCase().includes(query.toLowerCase());
      const matchesStatus = statusFilter === "All" || u.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [query, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  return (
    <PageShell active="users" onNavigate={onNavigate} onLogout={onLogout}>
      <h1 className="text-xl font-bold text-neutral-900">Users</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Manage and monitor Deyra platform users and their meter
        associations.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Users" value={String(users.length)} />
        <StatCard
          label="Active Users"
          value={String(
            users.filter((user) => user.status === "Active").length,
          )}
        />
        <StatCard
          label="Inactive Users"
          value={String(
            users.filter((user) => user.status === "Inactive").length,
          )}
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
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <button className="flex items-center gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-50">
            <Download size={15} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-neutral-200 bg-white">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-xs font-medium uppercase tracking-wide text-neutral-400">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Meter Count</th>
              <th className="px-4 py-3">Wallet Balance</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Date Joined</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {usersQuery.isPending ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-neutral-400"
                >
                  Loading users...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-10 text-center text-sm text-neutral-400"
                >
                  No users match your search.
                </td>
              </tr>
            ) : (
              filtered
                .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
                .map((u) => (
                  <tr key={u.id} className="text-neutral-700">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {u.name}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{u.email}</td>
                    <td className="px-4 py-3">{u.phone}</td>
                    <td className="px-4 py-3">
                      {String(u.meterCount).padStart(2, "0")}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      ₦{u.walletBalance.toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {u.dateJoined}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => onViewUser(u)}
                          className="flex items-center gap-1 text-xs font-medium text-neutral-600 hover:text-neutral-900"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button className="flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600">
                          <Ban size={14} /> Suspend
                        </button>
                      </div>
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
            users
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

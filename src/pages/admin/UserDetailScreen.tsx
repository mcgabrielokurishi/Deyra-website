import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import {
  ChevronLeft,
  Ban,
  Download,
  Lock,
  Unlock,
  Wallet as WalletIcon,
  ShieldCheck,
} from "lucide-react";
import PageShell from "../../components/PageShell";
import type { NavKey } from "../../components/Sidebar";
import { StatusBadge } from "../../components/StatCard";
import {
  mockLinkedMeters,
  mockTransactions,
  mockUsers,
} from "../../data/mockData";
import {
  adjustWalletBalance,
  deleteAdminUser,
  fetchAdminUserById,
  toggleUserActive,
  toggleUserLock,
  toggleWalletLock,
  updateUserRole,
} from "../../lib/adminApi";
import type { PlatformUser } from "../../types";

interface UserDetailScreenProps {
  user?: PlatformUser;
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
  onBack: () => void;
}

export default function UserDetailScreen({
  user,
  onNavigate,
  onLogout,
  onBack,
}: UserDetailScreenProps) {
  const params = useParams();
  const queryClient = useQueryClient();
  const userId = params.id ?? user?.id;

  const userQuery = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () =>
      userId ? fetchAdminUserById(userId) : Promise.resolve(user),
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  const resolvedUser = useMemo(() => {
    return (
      userQuery.data ?? user ?? mockUsers.find((entry) => entry.id === userId)
    );
  }, [user, userId, userQuery.data]);

  const [roleDraft, setRoleDraft] = useState<NonNullable<PlatformUser["role"]>>(
    resolvedUser?.role ?? "Customer",
  );
  const [walletAmount, setWalletAmount] = useState("0");
  const [walletReason, setWalletReason] = useState("Manual adjustment");

  useEffect(() => {
    if (resolvedUser?.role) setRoleDraft(resolvedUser.role);
  }, [resolvedUser?.role]);

  const updateRoleMutation = useMutation({
    mutationFn: (nextRole: string) =>
      updateUserRole(String(userId ?? resolvedUser?.id), { role: nextRole }),
    onSuccess: (updatedUser) => {
      if (!updatedUser) return;
      queryClient.setQueryData(["admin-user", updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const lockMutation = useMutation({
    mutationFn: (nextLocked: boolean) =>
      toggleUserLock(String(userId ?? resolvedUser?.id), nextLocked),
    onSuccess: (updatedUser) => {
      if (!updatedUser) return;
      queryClient.setQueryData(["admin-user", updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const activeMutation = useMutation({
    mutationFn: (nextActive: boolean) =>
      toggleUserActive(String(userId ?? resolvedUser?.id), nextActive),
    onSuccess: (updatedUser) => {
      if (!updatedUser) return;
      queryClient.setQueryData(["admin-user", updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const walletLockMutation = useMutation({
    mutationFn: (nextLocked: boolean) =>
      toggleWalletLock(String(userId ?? resolvedUser?.id), nextLocked),
    onSuccess: (updatedUser) => {
      if (!updatedUser) return;
      queryClient.setQueryData(["admin-user", updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const walletAdjustMutation = useMutation({
    mutationFn: () =>
      adjustWalletBalance(String(userId ?? resolvedUser?.id), {
        amount: Number(walletAmount),
        reason: walletReason,
      }),
    onSuccess: (updatedUser) => {
      if (!updatedUser) return;
      queryClient.setQueryData(["admin-user", updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      setWalletAmount("0");
      setWalletReason("Manual adjustment");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteAdminUser(String(userId ?? resolvedUser?.id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      onBack();
    },
  });

  if (!resolvedUser) {
    return (
      <PageShell active="users" onNavigate={onNavigate} onLogout={onLogout}>
        <p className="text-sm text-neutral-500">User not found.</p>
      </PageShell>
    );
  }

  const isLocked =
    resolvedUser.status === "Inactive" || Boolean(resolvedUser.walletLocked);
  const isActive = resolvedUser.isActive ?? resolvedUser.status === "Active";

  return (
    <PageShell active="users" onNavigate={onNavigate} onLogout={onLogout}>
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm font-medium text-neutral-500 hover:text-neutral-800"
      >
        <ChevronLeft size={16} /> Back to Users
      </button>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">
            {resolvedUser.name}
          </h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-neutral-500">
            <StatusBadge status={resolvedUser.status} />
            <span>· {resolvedUser.dateJoined}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => lockMutation.mutate(!isLocked)}
            className="flex items-center gap-2 self-start rounded-lg bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
          >
            {isLocked ? <Unlock size={15} /> : <Lock size={15} />}
            {isLocked ? "Unlock User" : "Lock User"}
          </button>
          <button
            onClick={() => activeMutation.mutate(!isActive)}
            className="flex items-center gap-2 self-start rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            <ShieldCheck size={15} />
            {isActive ? "Deactivate" : "Activate"}
          </button>
          <button
            onClick={() => deleteMutation.mutate()}
            className="flex items-center gap-2 self-start rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
          >
            <Ban size={15} />
            {deleteMutation.isPending ? "Deleting..." : "Delete User"}
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-neutral-800">
              Personal Info
            </h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-neutral-400">Full Name</dt>
                <dd className="font-medium text-neutral-800">
                  {resolvedUser.name}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-neutral-400">Email</dt>
                <dd className="font-medium text-neutral-800">
                  {resolvedUser.email}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-neutral-400">Phone Number</dt>
                <dd className="font-medium text-neutral-800">
                  {resolvedUser.phone}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-neutral-400">Date Joined</dt>
                <dd className="font-medium text-neutral-800">
                  {resolvedUser.dateJoined}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-neutral-800">Wallet</h3>
            <p className="mt-2 text-2xl font-bold text-orange-600">
              ₦{resolvedUser.walletBalance.toLocaleString()}
            </p>
            <div className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-neutral-400">Wallet Lock</dt>
                <button
                  onClick={() =>
                    walletLockMutation.mutate(
                      !Boolean(resolvedUser.walletLocked),
                    )
                  }
                  className="rounded-md border border-neutral-200 px-2 py-1 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  {resolvedUser.walletLocked ? "Unlock" : "Lock"}
                </button>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-neutral-400">Role</dt>
                <span className="font-medium text-neutral-800">
                  {resolvedUser.role ?? "Customer"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-neutral-800">
              Admin Actions
            </h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block text-sm text-neutral-700">
                Role
                <select
                  value={roleDraft}
                  onChange={(event) =>
                    setRoleDraft(
                      event.target.value as NonNullable<PlatformUser["role"]>,
                    )
                  }
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  <option value="Customer">Customer</option>
                  <option value="Support">Support</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>

              <div className="flex items-end">
                <button
                  onClick={() => updateRoleMutation.mutate(roleDraft)}
                  className="w-full rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                  disabled={
                    updateRoleMutation.isPending ||
                    roleDraft === (resolvedUser.role ?? "Customer")
                  }
                >
                  {updateRoleMutation.isPending ? "Saving..." : "Update Role"}
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-[140px_1fr_160px]">
              <label className="block text-sm text-neutral-700">
                Amount
                <input
                  type="number"
                  value={walletAmount}
                  onChange={(event) => setWalletAmount(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <label className="block text-sm text-neutral-700">
                Reason
                <input
                  value={walletReason}
                  onChange={(event) => setWalletReason(event.target.value)}
                  className="mt-1.5 w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm text-neutral-700 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>

              <div className="flex items-end">
                <button
                  onClick={() => walletAdjustMutation.mutate()}
                  className="w-full rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:bg-neutral-200 disabled:text-neutral-400"
                  disabled={walletAdjustMutation.isPending}
                >
                  <span className="inline-flex items-center gap-2">
                    <WalletIcon size={14} />
                    {walletAdjustMutation.isPending
                      ? "Adjusting..."
                      : "Adjust Wallet"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <h3 className="text-sm font-semibold text-neutral-800">
              Linked Meters
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    <th className="py-2">Name</th>
                    <th className="py-2">Meter Number</th>
                    <th className="py-2">Provider</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Last Recharge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {mockLinkedMeters.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2.5 font-medium text-neutral-800">
                        {m.name}
                      </td>
                      <td className="py-2.5 text-neutral-500">
                        {m.meterNumber}
                      </td>
                      <td className="py-2.5">{m.provider}</td>
                      <td className="py-2.5">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="py-2.5 text-neutral-500">
                        {m.lastRecharge}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-neutral-200 bg-white p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-sm font-semibold text-neutral-800">
                All Transactions
              </h3>
              <div className="flex items-center gap-2">
                <input
                  placeholder="Search transactions"
                  className="w-52 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs placeholder:text-neutral-400"
                />
                <select className="rounded-lg border border-neutral-200 px-2 py-1.5 text-xs text-neutral-500">
                  <option>Status: All</option>
                </select>
                <button className="flex items-center gap-1 rounded-lg border border-neutral-200 px-2 py-1.5 text-xs font-medium text-neutral-600">
                  <Download size={13} /> Export CSV
                </button>
              </div>
            </div>

            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                    <th className="py-2">Transaction ID</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Type</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Date &amp; Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {mockTransactions.slice(0, 5).map((t) => (
                    <tr key={t.id}>
                      <td className="py-2.5 font-medium text-neutral-800">
                        {t.transactionId}
                      </td>
                      <td className="py-2.5">₦{t.amount.toLocaleString()}</td>
                      <td className="py-2.5 text-neutral-500">{t.type}</td>
                      <td className="py-2.5">
                        <StatusBadge status={t.status} />
                      </td>
                      <td className="py-2.5 text-neutral-500">
                        {t.date}, {t.time}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </PageShell>
  );
}

// React import not required with the new JSX transform
import {
  Users,
  Radio,
  Wallet,
  RefreshCw,
  Clock,
  XCircle,
  Zap,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../../components/PageShell';
import type { NavKey } from '../../components/Sidebar';
import { StatCard, StatusBadge } from '../../components/StatCard';
import { fetchAdminDashboard, fetchAdminOverview } from '../../lib/adminApi';

interface DashboardScreenProps {
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
}

function formatNaira(n: number) {
  return `₦${n.toLocaleString()}`;
}

export default function DashboardScreen({
  onNavigate,
  onLogout,
}: DashboardScreenProps) {
  const dashboardQuery = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
  });

  const overviewQuery = useQuery({
    queryKey: ['admin-overview'],
    queryFn: fetchAdminOverview,
  });

  const rechargeVolume = dashboardQuery.data?.rechargeVolume ?? {
    success: 0,
    pending: 0,
    failed: 0,
  };

  const totalRecharge =
    rechargeVolume.success + rechargeVolume.pending + rechargeVolume.failed;

  const successPct =
    totalRecharge === 0 ? 0 : (rechargeVolume.success / totalRecharge) * 100;
  const pendingPct =
    totalRecharge === 0 ? 0 : (rechargeVolume.pending / totalRecharge) * 100;
  const failedPct =
    totalRecharge === 0 ? 0 : (rechargeVolume.failed / totalRecharge) * 100;

  const donutBg = `conic-gradient(#16a34a 0% ${successPct}%, #f59e0b ${successPct}% ${
    successPct + pendingPct
  }%, #ef4444 ${successPct + pendingPct}% ${
    successPct + pendingPct + failedPct
  }%)`;

  const overviewItems = overviewQuery.data ?? [];
  const recentTransactions = dashboardQuery.data?.recentTransactions ?? [];

  return (
    <PageShell active="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {overviewItems.map((item) => (
          <StatCard
            key={item.title}
            label={item.title}
            value={item.value}
            icon={
              item.title.includes('Users') ? (
                <Users size={16} className="text-orange-600" />
              ) : item.title.includes('Meters') ? (
                <Radio size={16} className="text-orange-600" />
              ) : item.title.includes('Wallet') ? (
                <Wallet size={16} className="text-orange-600" />
              ) : item.title.includes('Recharges') ? (
                <RefreshCw size={16} className="text-orange-600" />
              ) : item.title.includes('Pending') ? (
                <Clock size={16} className="text-orange-600" />
              ) : (
                <XCircle size={16} className="text-orange-600" />
              )
            }
            trend={{ value: item.change, positive: item.positive }}
          />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">
              Recharge Volume This Month
            </h3>
            <select className="rounded-md border border-neutral-200 px-2 py-1 text-xs text-neutral-500">
              <option>Last 30 Days</option>
              <option>Last 7 Days</option>
              <option>Last 90 Days</option>
            </select>
          </div>

          <div className="mt-6 flex items-center gap-6">
            <div
              className="relative flex h-36 w-36 shrink-0 items-center justify-center rounded-full"
              style={{ background: donutBg }}
            >
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white text-center">
                <span className="text-lg font-bold text-neutral-900">
                  {totalRecharge.toLocaleString()}
                </span>
                <span className="text-[11px] text-neutral-400">
                  Recharges this month
                </span>
              </div>
            </div>

            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Success{' '}
                <span className="ml-auto font-medium">
                  {rechargeVolume.success.toLocaleString()}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                Pending{' '}
                <span className="ml-auto font-medium">
                  {rechargeVolume.pending.toLocaleString()}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                Failed{' '}
                <span className="ml-auto font-medium">
                  {rechargeVolume.failed.toLocaleString()}
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-neutral-800">
              Recent Transactions
            </h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs font-medium text-orange-600 hover:underline"
            >
              View All Transactions →
            </button>
          </div>

          <ul className="mt-4 divide-y divide-neutral-100">
            {dashboardQuery.isPending ? (
              <li className="py-3 text-sm text-neutral-400">
                Loading recent activity...
              </li>
            ) : (
              recentTransactions.slice(0, 5).map((t: any) => (
                <li key={t.id} className="flex items-center gap-3 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-50 text-xs font-semibold text-orange-600">
                    {String(t.name ?? 'U')
                      .split(' ')
                      .map((p: string) => p[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-neutral-800">
                      {t.name}
                    </p>
                    <p className="text-xs text-neutral-400">
                      {t.timeAgo ?? t.time ?? 'Now'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-neutral-800">
                      {formatNaira(Number(t.amount ?? 0))}
                    </p>
                    <StatusBadge status={t.status} />
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-5">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
          <Zap size={16} className="text-orange-500" />
          System Health
          <span className="ml-auto text-xs font-normal text-neutral-400">
            Last updated: 1 min ago
          </span>
        </h3>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {dashboardQuery.data && (
            <>
              <div className="rounded-lg border border-neutral-100 p-3">
                <p className="text-xs font-medium text-neutral-500">
                  EKEDC API
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-600">
                    98.2%
                  </span>
                  <StatusBadge status="Active" />
                </div>
              </div>
              <div className="rounded-lg border border-neutral-100 p-3">
                <p className="text-xs font-medium text-neutral-500">
                  IKEDC API
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-600">
                    72.4%
                  </span>
                  <StatusBadge status="Degraded" />
                </div>
              </div>
              <div className="rounded-lg border border-neutral-100 p-3">
                <p className="text-xs font-medium text-neutral-500">AEDC API</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-red-500">
                    44.4%
                  </span>
                  <StatusBadge status="Offline" />
                </div>
              </div>
              <div className="rounded-lg border border-neutral-100 p-3">
                <p className="text-xs font-medium text-neutral-500">PHED API</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-emerald-600">
                    99.8%
                  </span>
                  <StatusBadge status="Active" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </PageShell>
  );
}

import React from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: React.ReactNode;
  iconBg?: string;
  trend?: { value: string; positive: boolean };
}

export function StatCard({ label, value, icon, iconBg = "bg-orange-50", trend }: StatCardProps) {
  return (
    <div className="flex-1 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between">
        {icon ? (
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
            {icon}
          </div>
        ) : (
          <span />
        )}
        {trend && (
          <span
            className={`text-xs font-medium ${
              trend.positive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {trend.positive ? "↗ " : "↘ "}
            {trend.value}
          </span>
        )}
      </div>
      <p className="mt-3 text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-neutral-900">{value}</p>
    </div>
  );
}

interface StatusBadgeProps {
  status: string;
}

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-emerald-50 text-emerald-600",
  Success: "bg-emerald-50 text-emerald-600",
  Approved: "bg-emerald-50 text-emerald-600",
  Inactive: "bg-red-50 text-red-500",
  Failed: "bg-red-50 text-red-500",
  Offline: "bg-red-50 text-red-500",
  Faulty: "bg-red-50 text-red-500",
  Pending: "bg-amber-50 text-amber-600",
  Degraded: "bg-amber-50 text-amber-600",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? "bg-neutral-100 text-neutral-600";
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

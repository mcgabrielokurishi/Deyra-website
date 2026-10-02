import React from "react";
import Sidebar from "./Sidebar";
import type { NavKey } from "./Sidebar";
import TopBar from "./TopBar";

interface PageShellProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
  searchPlaceholder?: string;
  children: React.ReactNode;
}

export default function PageShell({
  active,
  onNavigate,
  onLogout,
  searchPlaceholder,
  children,
}: PageShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-neutral-50 text-neutral-900">
      <Sidebar active={active} onNavigate={onNavigate} onLogout={onLogout} />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar placeholder={searchPlaceholder} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

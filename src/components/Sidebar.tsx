import React from 'react';
import {
  LayoutGrid,
  Users,
  ArrowLeftRight,
  Radio,
  UsersRound,
  Settings,
  LogOut,
  Megaphone,
  FileText,
  LifeBuoy,
} from 'lucide-react';

export type NavKey =
  | 'dashboard'
  | 'users'
  | 'transactions'
  | 'providers'
  | 'communities'
  | 'information'
  | 'tickets'
  | 'broadcast'
  | 'settings';

interface NavItem {
  key: NavKey;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: <LayoutGrid size={18} /> },
  { key: 'users', label: 'Users', icon: <Users size={18} /> },
  {
    key: 'transactions',
    label: 'Transactions',
    icon: <ArrowLeftRight size={18} />,
  },
  { key: 'providers', label: 'Providers', icon: <Radio size={18} /> },
  { key: 'communities', label: 'Communities', icon: <UsersRound size={18} /> },
  { key: 'information', label: 'Information', icon: <FileText size={18} /> },
  { key: 'tickets', label: 'Tickets', icon: <LifeBuoy size={18} /> },
  { key: 'broadcast', label: 'Broadcast', icon: <Megaphone size={18} /> },
];

interface SidebarProps {
  active: NavKey;
  onNavigate: (key: NavKey) => void;
  onLogout?: () => void;
  adminName?: string;
  adminRole?: string;
}

export default function Sidebar({
  active,
  onNavigate,
  onLogout,
  adminName = 'Admin User',
  adminRole = 'Super Admin',
}: SidebarProps) {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-neutral-200 bg-white px-4 py-5">
      <div className="mb-8 flex items-center gap-1 px-2">
        <span className="text-lg font-extrabold tracking-tight text-orange-600">
          DEYRA
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = item.key === active;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
              }`}
            >
              <span
                className={isActive ? 'text-orange-600' : 'text-neutral-400'}
              >
                {item.icon}
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-neutral-200 pt-3">
        <button
          onClick={() => onNavigate('settings')}
          className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
            active === 'settings'
              ? 'bg-orange-50 text-orange-600'
              : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800'
          }`}
        >
          <Settings
            size={18}
            className={
              active === 'settings' ? 'text-orange-600' : 'text-neutral-400'
            }
          />
          Settings
        </button>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut size={18} />
          Logout
        </button>

        <div className="mt-3 flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="h-8 w-8 shrink-0 rounded-full bg-neutral-200" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-800">
              {adminName}
            </p>
            <p className="truncate text-xs text-neutral-400">{adminRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

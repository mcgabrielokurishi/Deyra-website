import { Search, Bell } from "lucide-react";

interface TopBarProps {
  adminName?: string;
  adminRole?: string;
  placeholder?: string;
}

export default function TopBar({
  adminName = "Admin User",
  adminRole = "Super Admin",
  placeholder = "Search transactions, meters, users...",
}: TopBarProps) {
  return (
    <div className="flex items-center justify-between border-b border-neutral-200 bg-white px-6 py-3">
      <div className="relative w-80 max-w-full">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400"
        />
        <input
          type="text"
          placeholder={placeholder}
          className="w-full rounded-lg border border-neutral-200 bg-neutral-50 py-2 pl-9 pr-3 text-sm text-neutral-700 placeholder:text-neutral-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-full p-2 text-neutral-500 hover:bg-neutral-50"
        >
          <Bell size={18} />
          <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-orange-500" />
        </button>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-sm font-semibold leading-tight text-neutral-800">
              {adminName}
            </p>
            <p className="text-xs leading-tight text-neutral-400">
              {adminRole}
            </p>
          </div>
          <div className="h-9 w-9 rounded-full bg-neutral-200" />
        </div>
      </div>
    </div>
  );
}

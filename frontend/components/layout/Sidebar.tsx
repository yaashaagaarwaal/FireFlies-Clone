"use client";

import { BarChart3, ChevronDown, ListChecks, Menu, Settings, Users, Video, X, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { LucideIcon } from "lucide-react";

import { useToast } from "@/components/ui/ToastProvider";

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

function NavItem({ icon: Icon, label, href, active, onClick }: NavItemProps) {
  const className = `control-focus flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
    active
      ? "bg-indigo-50 font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
      : "font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
  }`;

  if (href) {
    return (
      <Link href={href} className={className} onClick={onClick}>
        <Icon size={17} strokeWidth={active ? 2.25 : 2} />
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`${className} text-left`}>
      <Icon size={17} />
      {label}
    </button>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { showToast } = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Open menu"
        className="control-focus fixed left-3 top-3 z-30 rounded-lg border border-gray-200 bg-white p-2 text-gray-600 shadow-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 md:hidden"
      >
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={closeMobile}
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-[1px] md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-60 shrink-0 flex-col border-r border-gray-200 bg-white transition-transform duration-200 dark:border-gray-800 dark:bg-gray-900 md:static md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-1 px-4 py-4">
          <button
            type="button"
            onClick={() => showToast("Account switching is coming soon", "info")}
            className="control-focus flex flex-1 items-center gap-2 rounded-lg text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8B7355] text-sm font-semibold text-white">
              Y
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Yash</span>
            <ChevronDown size={15} className="ml-auto shrink-0 text-gray-400 dark:text-gray-500" />
          </button>
          <button
            type="button"
            onClick={closeMobile}
            aria-label="Close menu"
            className="control-focus shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 dark:text-gray-500 dark:hover:bg-gray-800 md:hidden"
          >
            <X size={16} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 px-3 pt-2">
          <NavItem
            icon={Video}
            label="Meetings"
            href="/dashboard"
            active={pathname === "/dashboard"}
            onClick={closeMobile}
          />
          <NavItem
            icon={ListChecks}
            label="Tasks"
            href="/tasks"
            active={pathname === "/tasks"}
            onClick={closeMobile}
          />
          <NavItem
            icon={BarChart3}
            label="Analytics"
            onClick={() => showToast("Analytics is coming soon", "info")}
          />
          <NavItem
            icon={Users}
            label="Team"
            onClick={() => showToast("Team workspaces are coming soon", "info")}
          />
        </nav>

        <div className="flex flex-col gap-1 border-t border-gray-100 px-3 py-3 dark:border-gray-800">
          <button
            type="button"
            onClick={() => showToast("Upgrade plans are coming soon", "info")}
            className="control-focus flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Zap size={16} className="text-emerald-500" />
            Upgrade
            <span className="ml-auto rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
              40% OFF
            </span>
          </button>
          <NavItem
            icon={Settings}
            label="Settings"
            href="/settings"
            active={pathname === "/settings"}
            onClick={closeMobile}
          />
        </div>
      </aside>
    </>
  );
}

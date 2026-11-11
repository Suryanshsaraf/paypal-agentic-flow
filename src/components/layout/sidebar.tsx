"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  Activity,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  Zap,
} from "lucide-react";

/* ── Sidebar Context ── */
const SidebarContext = createContext<{
  collapsed: boolean;
  toggle: () => void;
}>({ collapsed: false, toggle: () => {} });

export function useSidebar() {
  return useContext(SidebarContext);
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const toggle = useCallback(() => setCollapsed((c) => !c), []);
  return (
    <SidebarContext.Provider value={{ collapsed, toggle }}>
      {children}
    </SidebarContext.Provider>
  );
}

/* ── Navigation Items ── */
const navItems = [
  { href: "/", label: "Overview", icon: LayoutDashboard },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/activity", label: "Activity", icon: Activity },
  { href: "/assistant", label: "Assistant", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
];

/* ── Sidebar Component ── */
export function Sidebar() {
  const { collapsed, toggle } = useSidebar();
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen flex flex-col border-r border-border bg-bg-secondary transition-all duration-200 ease-out ${
        collapsed ? "w-sidebar-collapsed" : "w-sidebar"
      }`}
    >
      {/* ── Logo ── */}
      <div className="flex items-center h-header px-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-8 w-8 shrink-0 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm shadow-glow">
            $
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-sm font-semibold text-text-primary tracking-tight truncate">
                Get Paid
              </span>
              <span className="block text-timestamp text-text-muted truncate">
                Autonomous AR
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
        {/* Quick Command Trigger */}
        <button
          onClick={() => {
            window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
          }}
          className={`w-full group flex items-center gap-3 rounded-md px-3 py-2 text-body text-text-muted hover:bg-bg-interactive hover:text-text-primary transition-colors mb-2 ${
            collapsed ? "justify-center px-0" : ""
          }`}
          title={collapsed ? "Search (⌘K)" : undefined}
        >
          <span className="text-[12px] font-mono px-1.5 py-0.5 rounded bg-bg-interactive border border-border">
            ⌘K
          </span>
          {!collapsed && (
            <span className="text-meta text-text-muted flex-1 text-left">
              Quick actions
            </span>
          )}
        </button>

        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-body transition-colors ${
                isActive
                  ? "bg-accent-muted text-accent-hover font-medium"
                  : "text-text-secondary hover:bg-bg-interactive hover:text-text-primary"
              } ${collapsed ? "justify-center px-0" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`w-[18px] h-[18px] shrink-0 ${
                  isActive ? "text-accent" : "text-text-muted group-hover:text-text-secondary"
                }`}
              />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* ── Agent Status ── */}
      <div className={`px-3 py-3 border-t border-border ${collapsed ? "px-2" : ""}`}>
        <div
          className={`flex items-center gap-2 rounded-md px-2.5 py-2 bg-bg-interactive ${
            collapsed ? "justify-center px-0" : ""
          }`}
        >
          <div className="relative shrink-0">
            <Zap className="w-4 h-4 text-accent" />
            <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-success agent-pulse" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-timestamp font-medium text-text-primary truncate">
                Agent Active
              </span>
              <span className="block text-timestamp text-text-muted truncate">
                Watching invoices
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── User Profile & Collapse ── */}
      <div className="p-2 border-t border-border">
        <div
          className={`flex items-center justify-between p-1.5 rounded-md hover:bg-bg-interactive transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-accent to-purple-500 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
              AM
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <span className="block text-meta font-medium text-text-primary truncate">
                  Alex Morgan
                </span>
                <span className="block text-timestamp text-text-muted truncate">
                  Freelance Pro
                </span>
              </div>
            )}
          </div>
          {!collapsed && (
            <button
              onClick={toggle}
              className="p-1 hover:bg-bg-elevated rounded text-text-muted hover:text-text-primary transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <button
            onClick={toggle}
            className="w-full mt-1 flex items-center justify-center h-7 rounded hover:bg-bg-interactive text-text-muted hover:text-text-primary transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
}

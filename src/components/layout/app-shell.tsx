"use client";

import React from "react";
import { Sidebar, SidebarProvider, useSidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { CommandPalette } from "./command-palette";

function ShellInner({ children }: { children: React.ReactNode }) {
  const { collapsed } = useSidebar();

  return (
    <div className="min-h-screen bg-bg-primary">
      <CommandPalette />
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <main
        className={`transition-all duration-200 ease-out pb-16 md:pb-0 ${
          collapsed ? "md:ml-sidebar-collapsed" : "md:ml-sidebar"
        }`}
      >
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden">
        <MobileNav />
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ShellInner>{children}</ShellInner>
    </SidebarProvider>
  );
}

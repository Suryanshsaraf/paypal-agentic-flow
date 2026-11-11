"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  FileText,
  Users,
  Activity,
  MessageSquare,
  Settings,
  Plus,
  Zap,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

interface ActionItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "Navigation" | "Actions" | "Quick Queries";
  onSelect: () => void;
}

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
    setQuery("");
    setSelectedIndex(0);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        toggle();
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, toggle]);

  const items: ActionItem[] = [
    {
      id: "nav-overview",
      title: "Overview Dashboard",
      subtitle: "View key metrics and active accounts",
      icon: LayoutDashboard,
      category: "Navigation",
      onSelect: () => {
        router.push("/");
        setIsOpen(false);
      },
    },
    {
      id: "nav-invoices",
      title: "All Invoices",
      subtitle: "Filter, search, and manage receivables",
      icon: FileText,
      category: "Navigation",
      onSelect: () => {
        router.push("/invoices");
        setIsOpen(false);
      },
    },
    {
      id: "nav-clients",
      title: "Client Directory",
      subtitle: "View client billing histories",
      icon: Users,
      category: "Navigation",
      onSelect: () => {
        router.push("/clients");
        setIsOpen(false);
      },
    },
    {
      id: "nav-activity",
      title: "Agent Activity Ledger",
      subtitle: "Inspect autonomous decisions & timeline",
      icon: Activity,
      category: "Navigation",
      onSelect: () => {
        router.push("/activity");
        setIsOpen(false);
      },
    },
    {
      id: "nav-assistant",
      title: "AI Financial Assistant",
      subtitle: "Natural language financial inquiries",
      icon: MessageSquare,
      category: "Navigation",
      onSelect: () => {
        router.push("/assistant");
        setIsOpen(false);
      },
    },
    {
      id: "nav-settings",
      title: "Settings & System Diagnostics",
      subtitle: "PayPal sandbox config and reset controls",
      icon: Settings,
      category: "Navigation",
      onSelect: () => {
        router.push("/settings");
        setIsOpen(false);
      },
    },
    {
      id: "act-new-invoice",
      title: "Create New Invoice",
      subtitle: "Scope inbound messages into a PayPal invoice",
      icon: Plus,
      category: "Actions",
      onSelect: () => {
        router.push("/invoices");
        setIsOpen(false);
      },
    },
    {
      id: "q-who-owes",
      title: "Ask: 'Who still owes me?'",
      subtitle: "Instant deterministic debtor calculation",
      icon: Zap,
      category: "Quick Queries",
      onSelect: () => {
        router.push("/assistant");
        setIsOpen(false);
      },
    },
    {
      id: "act-reset-demo",
      title: "Reset Demo Database",
      subtitle: "Restore pristine seeded scenario",
      icon: RotateCcw,
      category: "Actions",
      onSelect: async () => {
        if (confirm("Reset database to initial demo state?")) {
          await fetch("/api/demo/reset", { method: "POST" });
          window.location.reload();
        }
      },
    },
  ];

  const filteredItems = items.filter((item) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(q)) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: ActionItem) => {
    item.onSelect();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => setIsOpen(false)}
    >
      <div
        className="relative w-full max-w-xl rounded-panel border border-border bg-bg-elevated shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-secondary/60">
          <Search className="w-5 h-5 text-text-muted shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, search or ask something..."
            className="w-full bg-transparent text-body text-text-primary placeholder:text-text-muted focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[11px] font-mono text-text-muted bg-bg-interactive border border-border rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-border/40">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-meta text-text-muted">
              No matching commands or actions found.
            </div>
          ) : (
            <div className="space-y-1">
              {filteredItems.map((item, index) => {
                const Icon = item.icon;
                const isSelected = index === selectedIndex;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-control text-left transition-colors ${
                      isSelected
                        ? "bg-accent-muted text-accent-hover"
                        : "hover:bg-bg-interactive text-text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`h-7 w-7 rounded-control flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-accent/20 text-accent"
                            : "bg-bg-interactive text-text-muted"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-meta font-medium truncate">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="block text-timestamp text-text-muted truncate">
                            {item.subtitle}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-text-muted font-mono uppercase px-1.5 py-0.5 rounded bg-bg-interactive border border-border/50 shrink-0 ml-2">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border bg-bg-secondary/40 flex items-center justify-between text-timestamp text-text-muted">
          <span>Navigate with ⌘K</span>
          <span>Get Paid • Autonomous AR</span>
        </div>
      </div>
    </div>
  );
}

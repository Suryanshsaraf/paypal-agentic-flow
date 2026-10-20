"use client";

import React, { useMemo, useState, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, GridReadyEvent } from "ag-grid-community";
import { Bounty, BountyStatus } from "@/lib/types";
import { Search, ExternalLink, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

interface BountyGridProps {
  bounties: Bounty[];
  onSelectBounty: (bounty: Bounty) => void;
  onOpenFundModal: () => void;
}

export const BountyGrid: React.FC<BountyGridProps> = ({
  bounties,
  onSelectBounty,
  onOpenFundModal,
}) => {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilterText, setQuickFilterText] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");

  const filteredBounties = useMemo(() => {
    if (selectedStatus === "ALL") return bounties;
    return bounties.filter((b) => b.status === selectedStatus);
  }, [bounties, selectedStatus]);

  const onGridReady = useCallback((params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  }, []);

  const columnDefs = useMemo<ColDef[]>(
    () => [
      {
        headerName: "Issue",
        field: "issueNumber",
        width: 100,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center h-full">
              <span className="font-mono text-xs font-semibold text-blue-400">
                #{params.value}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Repository",
        field: "repo",
        width: 170,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center h-full">
              <span className="font-mono text-xs text-slate-300 truncate bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/50">
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Issue Title",
        field: "title",
        flex: 2,
        minWidth: 260,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center h-full">
              <span className="font-medium text-slate-100 truncate hover:text-blue-300 transition cursor-pointer" title={params.value}>
                {params.value}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Bounty",
        field: "amount",
        width: 110,
        cellRenderer: (params: any) => {
          return (
            <div className="flex items-center h-full font-mono font-bold text-emerald-400">
              ${Number(params.value).toFixed(2)}
            </div>
          );
        },
      },
      {
        headerName: "Status",
        field: "status",
        width: 160,
        cellRenderer: (params: any) => {
          const status = params.value as BountyStatus;
          let badgeClass = "bg-slate-800 text-slate-300 border-slate-700";
          let label: string = status;

          if (status === "FUNDED") {
            badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            label = "ESCROW FUNDED";
          } else if (status === "MERGED_AND_PAID") {
            badgeClass = "bg-purple-500/10 text-purple-400 border-purple-500/30";
            label = "PAID VIA PAYPAL";
          } else if (status === "FLAGGED_SECURITY_RISK") {
            badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/30";
            label = "BACKDOOR BLOCKED";
          } else if (status === "IN_REVIEW") {
            badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/30";
            label = "AUDITING PR";
          }

          return (
            <div className="flex items-center h-full">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeClass}`}>
                {label}
              </span>
            </div>
          );
        },
      },
      {
        headerName: "Difficulty",
        field: "difficulty",
        width: 120,
        cellRenderer: (params: any) => {
          const diff = params.value;
          const color =
            diff === "Critical"
              ? "text-rose-400"
              : diff === "Advanced"
              ? "text-amber-400"
              : diff === "Intermediate"
              ? "text-blue-400"
              : "text-emerald-400";
          return (
            <div className="flex items-center h-full">
              <span className={`text-xs font-semibold ${color}`}>{diff}</span>
            </div>
          );
        },
      },
      {
        headerName: "Action",
        width: 140,
        cellRenderer: (params: any) => {
          const bounty = params.data as Bounty;
          return (
            <div className="flex items-center h-full">
              <button
                onClick={() => onSelectBounty(bounty)}
                className="text-xs font-medium px-2.5 py-1 rounded bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 transition flex items-center space-x-1"
              >
                <span>Audit & PRs</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          );
        },
      },
    ],
    [onSelectBounty]
  );

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl mb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Active Bug Bounties</h2>
            <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
              AG Grid Powered
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time open-source bug escrow backed by PayPal Orders & Instant Payouts.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Quick Filter */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search repo, CVE, or tags..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* New Bounty Button */}
          <button
            onClick={onOpenFundModal}
            className="whitespace-nowrap px-3.5 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-lg transition shadow-sm shadow-blue-500/30 flex items-center space-x-1.5"
          >
            <span>+ Fund Issue</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 mb-4 overflow-x-auto pb-1 text-xs">
        {["ALL", "FUNDED", "MERGED_AND_PAID", "FLAGGED_SECURITY_RISK"].map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            className={`px-3 py-1 rounded-lg font-medium transition ${
              selectedStatus === status
                ? "bg-blue-600 text-white shadow-sm shadow-blue-500/20"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            {status === "ALL"
              ? "All Bounties"
              : status === "FUNDED"
              ? "Escrow Funded"
              : status === "MERGED_AND_PAID"
              ? "Paid with PayPal"
              : "Threats Blocked"}
          </button>
        ))}
      </div>

      {/* AG Grid Container */}
      <div className="ag-theme-quartz-dark w-full h-[360px] rounded-xl overflow-hidden">
        <AgGridReact
          ref={gridRef}
          rowData={filteredBounties}
          columnDefs={columnDefs}
          quickFilterText={quickFilterText}
          onGridReady={onGridReady}
          rowHeight={52}
          headerHeight={44}
          animateRows={true}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
          }}
          pagination={true}
          paginationPageSize={10}
        />
      </div>
    </div>
  );
};

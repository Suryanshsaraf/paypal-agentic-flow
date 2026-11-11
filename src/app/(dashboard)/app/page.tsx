"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Invoice, EventLog } from "@/lib/types";
import { SynexMasterExperience } from "@/components/synex/synex-master-experience";

export default function OverviewPage() {
  const [stats, setStats] = useState<any>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [events, setEvents] = useState<EventLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, invoicesRes, eventsRes] = await Promise.all([
        fetch("/api/stats"),
        fetch("/api/invoices"),
        fetch("/api/events?limit=10"),
      ]);
      const [statsData, invoicesData, eventsData] = await Promise.all([
        statsRes.json(),
        invoicesRes.json(),
        eventsRes.json(),
      ]);

      if (statsData.ok) setStats(statsData.stats);
      if (invoicesData.ok) setInvoices(invoicesData.invoices || []);
      if (eventsData.ok) setEvents(eventsData.events || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <SynexMasterExperience
      invoices={invoices}
      events={events}
      stats={stats}
      onRefresh={fetchData}
    />
  );
}

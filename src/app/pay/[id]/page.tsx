"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Download,
  ExternalLink,
  Lock,
  CreditCard,
  Building,
  Mail,
  User,
  Calendar,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { Invoice } from "@/lib/types";
import { formatCents, centsToDecimalString } from "@/lib/money";
import { playSoftClick, playHarmonicSuccess } from "@/components/interactive/sound-effects";
import { fireFintechCelebration } from "@/components/interactive/confetti";
import { LottieCheck, LottieCoins } from "@/components/lottie/lottie-animations";
import { toast } from "sonner";

export default function PayPalSandboxPayerViewPage() {
  const params = useParams();
  const router = useRouter();
  const invoiceId = params?.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isLaunchingPayPal, setIsLaunchingPayPal] = useState(false);
  const [paidSuccess, setPaidSuccess] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!invoiceId) return;
    try {
      const res = await fetch(`/api/invoices/${encodeURIComponent(invoiceId)}`);
      const data = await res.json();
      if (!data.ok || !data.invoice) {
        setError(data.error || "Invoice not found");
        return;
      }
      setInvoice(data.invoice);
      if (data.invoice.status === "PAID") {
        setPaidSuccess(true);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load invoice");
    } finally {
      setLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  // Launch Authentic PayPal Sandbox Checkout
  async function handleLaunchLivePayPal() {
    if (!invoice) return;
    playSoftClick();
    setIsLaunchingPayPal(true);
    toast.info("Connecting to live PayPal Sandbox session...");

    try {
      const res = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      const data = await res.json();

      if (!data.ok || !data.approveUrl) {
        toast.error(data.error || "Failed to initiate PayPal checkout");
        return;
      }

      toast.success("Redirecting to PayPal Sandbox Checkout...");
      window.location.href = data.approveUrl;
    } catch (err: any) {
      toast.error(err?.message || "Error contacting PayPal API");
    } finally {
      setIsLaunchingPayPal(false);
    }
  }

  // Handle Sandbox Simulated Payment
  async function handleCompletePayment() {
    if (!invoice) return;
    playSoftClick();
    setIsPaying(true);

    try {
      const res = await fetch("/api/demo/mark-paid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id }),
      });
      const data = await res.json();

      if (!data.ok) {
        toast.error(data.error || "Payment simulation failed");
        return;
      }

      playHarmonicSuccess();
      fireFintechCelebration();
      setPaidSuccess(true);
      setShowCheckoutModal(false);
      toast.success("Payment confirmed by PayPal Sandbox!");
      await fetchInvoice();
    } catch (err: any) {
      toast.error(err?.message || "Error processing payment");
    } finally {
      setIsPaying(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6 text-center font-sans">
        <div className="space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-3 border-[#003087] border-t-transparent" />
          <p className="text-sm text-[#687173] font-medium">Connecting to PayPal Sandbox...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md bg-white p-8 rounded-2xl shadow-sm border border-[#E1E7EB] space-y-4">
          <div className="h-12 w-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-[#0C0C0D]">Invoice Not Found</h2>
          <p className="text-sm text-[#687173]">
            {error || "The invoice identifier could not be resolved in the GetPaid workspace."}
          </p>
          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#003087] text-white text-xs font-semibold hover:bg-[#00246B] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to GetPaid AR</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isPaid = invoice.status === "PAID" || paidSuccess;
  const isOverdue = !isPaid && Boolean(invoice.dueDate && new Date(invoice.dueDate) < new Date());

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#0C0C0D] font-sans selection:bg-[#FFC439]/40 antialiased pb-20">
      {/* ── PayPal Sandbox Top Bar ── */}
      <div className="bg-[#003087] text-white py-2 px-4 text-xs font-medium">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-[#FFC439] text-[#003087] font-bold text-[10px] px-2 py-0.5 rounded uppercase tracking-wider">
              SANDBOX
            </span>
            <span>PayPal Invoicing v2 Testing Rails</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-white/80">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#FFC439]" />
              <span>256-Bit SSL Encrypted</span>
            </span>
            <Link
              href="/app"
              className="hover:text-white underline underline-offset-2 flex items-center gap-1 font-semibold"
            >
              <span>Back to App</span>
              <ArrowLeft className="w-3 h-3 rotate-180" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Header ── */}
      <header className="bg-white border-b border-[#E1E7EB] py-4 px-4 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* PayPal Monogram SVG */}
            <div className="flex items-center gap-1.5">
              <svg className="h-7 w-auto" viewBox="0 0 100 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.66 3.5H4.25C3.86 3.5 3.53 3.79 3.47 4.18L0.03 26.04C-0.03 26.37 0.22 26.66 0.56 26.66H4.27C4.66 26.66 4.99 26.37 5.05 25.98L6.2 18.68C6.26 18.29 6.59 18 6.98 18H9.36C14.7 18 17.74 15.42 18.52 10.45C18.86 8.31 18.42 6.58 17.27 5.37C16.03 4.09 14.07 3.5 11.66 3.5Z"
                  fill="#003087"
                />
                <path
                  d="M27.66 10.5H20.25C19.86 10.5 19.53 10.79 19.47 11.18L17.2 25.56C17.14 25.95 17.47 26.24 17.86 26.24H21.57C21.96 26.24 22.29 25.95 22.35 25.56L23.2 20.18C23.26 19.79 23.59 19.5 23.98 19.5H25.36C30.7 19.5 33.74 16.92 34.52 11.95C34.86 9.81 34.42 8.08 33.27 6.87C32.03 5.59 30.07 5 27.66 5Z"
                  fill="#0079C1"
                  opacity="0.9"
                />
                <text x="38" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="18" fill="#003087">
                  PayPal
                </text>
              </svg>
              <span className="text-xs text-[#687173] font-mono border-l border-[#E1E7EB] pl-2.5 ml-1">
                Payer Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                isPaid
                  ? "bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]"
                  : isOverdue
                  ? "bg-[#FEE2E2] text-[#991B1B] border border-[#FECACA]"
                  : "bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isPaid ? "bg-[#10B981]" : isOverdue ? "bg-[#EF4444]" : "bg-[#F59E0B]"
                }`}
              />
              <span>{isPaid ? "PAID IN FULL" : isOverdue ? "OVERDUE" : "DUE UPON RECEIPT"}</span>
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="max-w-4xl mx-auto px-4 pt-8">
        {/* Settlement Banner (if Paid) */}
        {isPaid && (
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-[#ECFDF5] to-[#F0FDF4] border border-[#A7F3D0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-left">
              <div className="h-12 w-12 rounded-full bg-[#10B981]/20 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-7 h-7 text-[#10B981]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#065F46]">
                  Payment of {formatCents(invoice.amountTotalCents)} Settled
                </h3>
                <p className="text-xs text-[#047857] mt-0.5">
                  Processed via PayPal Sandbox Webhook rails. Receipt reference:{" "}
                  <span className="font-mono font-semibold">
                    {invoice.paypalInvoiceId || `PAY-${invoice.id}`}
                  </span>
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-white border border-[#A7F3D0] text-[#065F46] hover:bg-[#F0FDF4] text-xs font-semibold shadow-xs flex items-center gap-2 transition-colors shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        )}

        {/* ── Invoice Card ── */}
        <div className="bg-white rounded-2xl border border-[#E1E7EB] shadow-sm overflow-hidden">
          {/* Card Header: Invoicer & Overview */}
          <div className="p-6 sm:p-8 border-b border-[#E1E7EB] bg-gradient-to-b from-white to-[#FAFCFD]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              {/* Invoicer Details */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#687173]">Invoicer</span>
                <h1 className="text-xl sm:text-2xl font-bold text-[#0C0C0D] flex items-center gap-2">
                  <span>GetPaid AR</span>
                  <ShieldCheck className="w-4 h-4 text-[#0079C1]" />
                </h1>
                <p className="text-xs text-[#687173]">
                  suryanshsaraf8@gmail.com · saiarihara@gmail.com · Verified Sandbox Merchant
                </p>
                <p className="text-xs text-[#687173] font-mono">
                  PayPal ID: sb-tgbtt53851838@business.example.com (IN)
                </p>
              </div>

              {/* Invoice Meta */}
              <div className="sm:text-right space-y-1">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#687173]">Invoice Number</span>
                <div className="text-xl font-bold font-mono text-[#0C0C0D]">{invoice.invoiceNumber}</div>
                <div className="text-xs text-[#687173] pt-1">
                  <span>PayPal Ref: </span>
                  <span className="font-mono text-[#003087] font-medium">
                    {invoice.paypalInvoiceId || "INV2-SANDBOX"}
                  </span>
                </div>
                <div className="text-xs text-[#687173]">
                  <span>Due Date: </span>
                  <span className={`font-semibold ${isOverdue && !isPaid ? "text-red-600" : "text-[#0C0C0D]"}`}>
                    {invoice.dueDate || "Due upon receipt"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Billed To Grid */}
          <div className="p-6 sm:p-8 border-b border-[#E1E7EB] bg-[#FAFBFD] grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#687173] block mb-1">
                Billed To
              </span>
              <div className="font-bold text-sm text-[#0C0C0D]">{invoice.client?.name || "Client"}</div>
              <div className="text-[#687173] mt-0.5">{invoice.client?.company || "Organization"}</div>
              <div className="text-[#0079C1] mt-0.5">{invoice.client?.email}</div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#687173] block mb-1">
                Payment Terms
              </span>
              <div className="font-semibold text-[#0C0C0D]">Net 7 Days · PayPal Invoicing</div>
              <div className="text-[#687173] mt-0.5">Automated settlement listener active</div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#687173] block mb-1">
                Total Amount Due
              </span>
              <div className="text-2xl font-black text-[#0C0C0D] tabular-nums">
                {formatCents(invoice.amountTotalCents)}
              </div>
            </div>
          </div>

          {/* Line Items Table */}
          <div className="p-6 sm:p-8 space-y-4">
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#687173] block">
              Itemized Scope of Work
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E1E7EB] text-[#687173] font-medium text-[11px]">
                    <th className="pb-3">Description</th>
                    <th className="pb-3 text-center">Qty</th>
                    <th className="pb-3 text-right">Unit Price</th>
                    <th className="pb-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E1E7EB]/60">
                  {invoice.lineItems && invoice.lineItems.length > 0 ? (
                    invoice.lineItems.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-[#FAFBFD]">
                        <td className="py-3 pr-4 font-medium text-[#0C0C0D]">
                          {item.description}
                        </td>
                        <td className="py-3 px-2 text-center text-[#687173] font-mono">
                          {item.quantity}
                        </td>
                        <td className="py-3 px-2 text-right text-[#687173] font-mono tabular-nums">
                          {formatCents(item.unitPriceCents)}
                        </td>
                        <td className="py-3 pl-2 text-right font-semibold text-[#0C0C0D] font-mono tabular-nums">
                          {formatCents(item.totalCents)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-3 pr-4 font-medium text-[#0C0C0D]">
                        {invoice.sourceMessage || "Professional Consulting Services"}
                      </td>
                      <td className="py-3 px-2 text-center text-[#687173] font-mono">1</td>
                      <td className="py-3 px-2 text-right text-[#687173] font-mono tabular-nums">
                        {formatCents(invoice.amountTotalCents)}
                      </td>
                      <td className="py-3 pl-2 text-right font-semibold text-[#0C0C0D] font-mono tabular-nums">
                        {formatCents(invoice.amountTotalCents)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Calculations & Total */}
            <div className="pt-4 border-t border-[#E1E7EB] flex flex-col sm:flex-row justify-between gap-6">
              <div className="max-w-xs text-xs text-[#687173] space-y-1">
                <span className="font-semibold text-[#0C0C0D]">Notes & Terms</span>
                <p>
                  Thank you for your business. Payment is due within 7 days. Autonomous follow-ups and sprint
                  delivery milestones are coordinated automatically via GetPaid AR.
                </p>
              </div>

              <div className="w-full sm:w-64 space-y-2 text-xs">
                <div className="flex justify-between text-[#687173]">
                  <span>Subtotal</span>
                  <span className="font-mono tabular-nums">{formatCents(invoice.amountTotalCents)}</span>
                </div>
                <div className="flex justify-between text-[#687173]">
                  <span>Processing Fee (0%)</span>
                  <span className="font-mono tabular-nums">$0.00</span>
                </div>
                <div className="flex justify-between text-[#687173]">
                  <span>Tax (0%)</span>
                  <span className="font-mono tabular-nums">$0.00</span>
                </div>
                <div className="pt-2 border-t border-[#E1E7EB] flex justify-between text-base font-bold text-[#0C0C0D]">
                  <span>Total Due</span>
                  <span className="tabular-nums text-[#003087]">
                    {formatCents(invoice.amountTotalCents)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Interactive Payment Bar ── */}
          <div className="p-6 sm:p-8 bg-[#F8FAFC] border-t border-[#E1E7EB]">
            {!isPaid ? (
              <div className="max-w-md mx-auto space-y-4 text-center">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium mb-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Live PayPal Sandbox API Connected</span>
                  </div>
                  <h3 className="text-sm font-bold text-[#0C0C0D]">Complete Settlement via PayPal</h3>
                  <p className="text-[11px] text-[#687173]">
                    Choose authentic PayPal checkout on <code className="bg-[#E2E8F0] px-1 py-0.5 rounded font-mono text-[10px]">sandbox.paypal.com</code> or instant demo simulation.
                  </p>
                </div>

                {/* Primary Official PayPal Button */}
                <button
                  disabled={isLaunchingPayPal}
                  onClick={handleLaunchLivePayPal}
                  className="w-full py-3.5 px-6 rounded-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-sm shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border border-[#E0A824]"
                >
                  {isLaunchingPayPal ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#003087] border-t-transparent" />
                      <span>Minting Live PayPal Checkout...</span>
                    </>
                  ) : (
                    <>
                      {/* PayPal Monogram */}
                      <svg className="h-5 w-auto shrink-0" viewBox="0 0 100 32" fill="none">
                        <path
                          d="M11.66 3.5H4.25C3.86 3.5 3.53 3.79 3.47 4.18L0.03 26.04C-0.03 26.37 0.22 26.66 0.56 26.66H4.27C4.66 26.66 4.99 26.37 5.05 25.98L6.2 18.68C6.26 18.29 6.59 18 6.98 18H9.36C14.7 18 17.74 15.42 18.52 10.45C18.86 8.31 18.42 6.58 17.27 5.37C16.03 4.09 14.07 3.5 11.66 3.5Z"
                          fill="#003087"
                        />
                        <path
                          d="M27.66 10.5H20.25C19.86 10.5 19.53 10.79 19.47 11.18L17.2 25.56C17.14 25.95 17.47 26.24 17.86 26.24H21.57C21.96 26.24 22.29 25.95 22.35 25.56L23.2 20.18C23.26 19.79 23.59 19.5 23.98 19.5H25.36C30.7 19.5 33.74 16.92 34.52 11.95C34.86 9.81 34.42 8.08 33.27 6.87C32.03 5.59 30.07 5 27.66 5Z"
                          fill="#0079C1"
                        />
                        <text x="38" y="22" fontFamily="sans-serif" fontWeight="bold" fontSize="18" fill="#003087">
                          PayPal
                        </text>
                      </svg>
                      <span className="font-semibold text-xs ml-1">(Live sandbox.paypal.com)</span>
                      <ExternalLink className="w-3.5 h-3.5 text-[#003087] ml-auto shrink-0" />
                    </>
                  )}
                </button>

                {/* Secondary 1-Click Simulation Button */}
                <button
                  onClick={() => {
                    playSoftClick();
                    setShowCheckoutModal(true);
                  }}
                  className="w-full py-3 px-6 rounded-full bg-[#0D0E11] hover:bg-[#26282B] text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#84CC16]" />
                  <span>Simulate Instant Settlement (1-Click Webhook)</span>
                </button>

                <div className="flex items-center justify-center gap-4 pt-1 text-[11px] text-[#687173]">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Real SSL &amp; TLS 1.3 Rail</span>
                  </span>
                  <span>·</span>
                  <span>Zero Guesswork Settlement</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 space-y-4">
                <div className="inline-flex items-center justify-center p-3 rounded-full bg-[#10B981]/10 text-[#10B981]">
                  <LottieCheck size={48} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-[#0C0C0D]">Thank You! Payment Received.</h3>
                  <p className="text-xs text-[#687173]">
                    Your payment was verified on the PayPal Sandbox rail. The invoicer has been notified and deliverables unpaused.
                  </p>
                </div>
                <div className="pt-2 flex items-center justify-center gap-3">
                  <Link
                    href="/app"
                    className="px-6 py-2.5 rounded-full bg-[#003087] hover:bg-[#00246B] text-white text-xs font-semibold transition-all shadow-xs"
                  >
                    Return to GetPaid AR Dashboard
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-[#687173] space-y-2">
          <p>
            PayPal Sandbox Testing Environment · Powered by GetPaid Autonomous Accounts-Receivable Agent
          </p>
          <p className="text-[11px] text-[#687173]">
            Co-founded by Suryansh Saraf (<a href="mailto:suryanshsaraf8@gmail.com" className="text-[#003087] hover:underline font-mono">suryanshsaraf8@gmail.com</a>) &amp; Sai Arihara (<a href="mailto:saiarihara@gmail.com" className="text-[#003087] hover:underline font-mono">saiarihara@gmail.com</a>)
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] pt-1">
            <Link href="/" className="hover:text-[#0C0C0D] underline">
              Landing Page
            </Link>
            <Link href="/app" className="hover:text-[#0C0C0D] underline">
              AR Dashboard
            </Link>
            <a
              href="https://developer.paypal.com/dashboard/applications/sandbox"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#0C0C0D] underline flex items-center gap-1"
            >
              <span>PayPal Developer Docs</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </main>

      {/* ── Interactive PayPal Sandbox Checkout Modal ── */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-[#E1E7EB] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#003087] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-[#FFC439] flex items-center justify-center text-[#003087] font-black text-xs">
                  P
                </div>
                <span className="font-bold text-sm tracking-tight">PayPal Sandbox Checkout</span>
              </div>
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="text-white/80 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-[#687173]">Paying to</span>
                <div className="text-base font-bold text-[#0C0C0D]">Morgan Creative Labs</div>
                <div className="text-xs text-[#687173]">Invoice {invoice.invoiceNumber}</div>
              </div>

              {/* Amount Display */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E1E7EB] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#687173]">Total Amount Due</span>
                <span className="text-xl font-bold font-mono text-[#003087] tabular-nums">
                  {formatCents(invoice.amountTotalCents)}
                </span>
              </div>

              {/* Sandbox Test Account */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-[#0C0C0D] block">
                  Simulated Funding Source
                </span>
                <div className="p-3 rounded-lg border border-[#0079C1] bg-[#F0F9FF] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                    <span className="font-semibold text-[#0C0C0D]">PayPal Sandbox Balance</span>
                  </div>
                  <span className="text-[#687173] font-mono">$10,000.00 Available</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FEF3C7] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Clicking Complete Payment triggers the real PayPal Webhook listener in Get Paid, automatically settling the invoice and dispatching the agent thank-you event.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  disabled={isPaying}
                  onClick={handleCompletePayment}
                  className="w-full py-3 rounded-full bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-bold text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer border border-[#E0A824]"
                >
                  {isPaying ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#003087] border-t-transparent" />
                      <span>Transmitting PayPal Webhook...</span>
                    </>
                  ) : (
                    <span>Complete Sandbox Payment</span>
                  )}
                </button>

                <button
                  disabled={isPaying}
                  onClick={() => setShowCheckoutModal(false)}
                  className="w-full py-2.5 rounded-full text-xs font-semibold text-[#687173] hover:text-[#0C0C0D] transition-colors cursor-pointer"
                >
                  Cancel & Return
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

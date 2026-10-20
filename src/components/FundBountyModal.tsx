"use client";

import React, { useState } from "react";
import { X, DollarSign, Loader2, ShieldCheck } from "lucide-react";

interface FundBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBountyCreated: () => void;
}

export const FundBountyModal: React.FC<FundBountyModalProps> = ({
  isOpen,
  onClose,
  onBountyCreated,
}) => {
  const [repo, setRepo] = useState("tailwindlabs/tailwindcss");
  const [issueNumber, setIssueNumber] = useState(142);
  const [title, setTitle] = useState("Fix CSS Container Query Specificity Conflict");
  const [description, setDescription] = useState(
    "When nesting multiple @container queries, generated utility classes collide in specificity order, overriding higher precedence rules."
  );
  const [failingTestCase, setFailingTestCase] = useState(
    "test('nested container queries specificity', () => {\n  expect(compileCSS('@container...')).toMatchSnapshot();\n});"
  );
  const [amount, setAmount] = useState(100);
  const [funderName, setFunderName] = useState("Open Source Sponsor");
  const [funderEmail, setFunderEmail] = useState("sponsor@devpool.io");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<"DETAILS" | "ESCROW_PAYING" | "COMPLETED">("DETAILS");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStep("ESCROW_PAYING");

    try {
      // 1. Create bounty in store
      const createRes = await fetch("/api/bounties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repo,
          issueNumber: Number(issueNumber),
          title,
          description,
          failingTestCase,
          amount: Number(amount),
          funderName,
          funderEmail,
          tags: ["CSS", "Container Queries", "Tailwind"],
          difficulty: "Intermediate",
        }),
      });

      const { bounty } = await createRes.json();

      // 2. Create PayPal Order
      const orderRes = await fetch("/api/paypal/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bountyId: bounty.id,
          amount: Number(amount),
        }),
      });

      const { order } = await orderRes.json();

      // 3. Capture PayPal Order into escrow
      await fetch("/api/paypal/capture-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bountyId: bounty.id,
          orderId: order.id,
        }),
      });

      setStep("COMPLETED");
      setTimeout(() => {
        onBountyCreated();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Error funding bounty:", err);
      alert("Error funding bounty with PayPal.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <DollarSign className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Fund Open-Source Bug Escrow</h3>
            <p className="text-[11px] text-slate-400">Locked securely via PayPal Orders v2</p>
          </div>
        </div>

        {step === "ESCROW_PAYING" ? (
          <div className="py-12 text-center">
            <Loader2 className="h-10 w-10 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-sm font-semibold text-white">Communicating with PayPal Sandbox...</p>
            <p className="text-xs text-slate-400 mt-1">
              Authorizing & Capturing ${amount}.00 USD into smart escrow.
            </p>
          </div>
        ) : step === "COMPLETED" ? (
          <div className="py-12 text-center">
            <ShieldCheck className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-white">Bounty Funded Successfully!</p>
            <p className="text-xs text-slate-400 mt-1">
              GitHub Issue attached with automated proof-of-fix verification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">GitHub Repo</label>
                <input
                  type="text"
                  value={repo}
                  onChange={(e) => setRepo(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Issue #</label>
                <input
                  type="number"
                  value={issueNumber}
                  onChange={(e) => setIssueNumber(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Issue Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Bug Description</label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Failing Test Case (Acceptance Criteria)</label>
              <textarea
                rows={2}
                value={failingTestCase}
                onChange={(e) => setFailingTestCase(e.target.value)}
                className="w-full font-mono text-[11px] px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-300 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-slate-400 mb-1">Bounty Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1.5 text-slate-500 font-bold">$</span>
                  <input
                    type="number"
                    value={amount}
                    min={5}
                    max={5000}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Sponsor Email</label>
                <input
                  type="email"
                  value={funderEmail}
                  onChange={(e) => setFunderEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg shadow-blue-500/20"
              >
                Deposit ${amount} with PayPal Sandbox
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

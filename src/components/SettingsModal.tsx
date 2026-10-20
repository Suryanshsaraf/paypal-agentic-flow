"use client";

import React, { useState } from "react";
import { X, Key, ShieldCheck, ExternalLink } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [clientId, setClientId] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("GITBOUNTY_PAYPAL_CLIENT_ID") || ""
      : ""
  );
  const [clientSecret, setClientSecret] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("GITBOUNTY_PAYPAL_SECRET") || ""
      : ""
  );
  const [geminiKey, setGeminiKey] = useState(
    typeof window !== "undefined"
      ? localStorage.getItem("GITBOUNTY_GEMINI_KEY") || ""
      : ""
  );
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("GITBOUNTY_PAYPAL_CLIENT_ID", clientId);
      localStorage.setItem("GITBOUNTY_PAYPAL_SECRET", clientSecret);
      localStorage.setItem("GITBOUNTY_GEMINI_KEY", geminiKey);
    }
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center space-x-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Key className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Live API Credentials</h3>
            <p className="text-[11px] text-slate-400">Optional: Test with your own live sandbox keys</p>
          </div>
        </div>

        <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl mb-4 text-[11px] text-blue-300 leading-relaxed">
          <strong>Note for Hackathon Judges:</strong> The app runs out-of-the-box in automated PayPal Sandbox simulation mode. You can enter your own PayPal Developer Sandbox credentials below to test live sandbox API calls.
        </div>

        <form onSubmit={handleSave} className="space-y-3 text-xs">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-400">PayPal Sandbox Client ID</label>
              <a
                href="https://developer.paypal.com/dashboard/applications/sandbox"
                target="_blank"
                rel="noreferrer"
                className="text-blue-400 hover:underline flex items-center space-x-0.5 text-[10px]"
              >
                <span>Get Sandbox Keys</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <input
              type="text"
              placeholder="sb-xxxx or Client ID"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full font-mono px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-slate-400 mb-1">PayPal Sandbox Secret</label>
            <input
              type="password"
              placeholder="Client Secret"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              className="w-full font-mono px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-slate-400">Google Gemini API Key</label>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-purple-400 hover:underline flex items-center space-x-0.5 text-[10px]"
              >
                <span>Get Gemini Key</span>
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
            <input
              type="password"
              placeholder="AIzaSy..."
              value={geminiKey}
              onChange={(e) => setGeminiKey(e.target.value)}
              className="w-full font-mono px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="pt-4 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white transition"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition shadow-lg shadow-blue-500/20"
            >
              {saved ? "Saved!" : "Save Keys"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

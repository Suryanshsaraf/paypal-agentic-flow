import React from "react";
import { ScrollStory } from "@/components/landing/scroll-story";
import { SmoothScrollProvider } from "@/components/landing/smooth-scroll-provider";

export const metadata = {
  title: "Get Paid — Autonomous Accounts-Receivable Agent for Freelancers",
  description:
    "Paste any client message. The autonomous agent scopes line items, sends a PayPal invoice, and chases overdue payments while you sleep.",
};

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <ScrollStory />
    </SmoothScrollProvider>
  );
}

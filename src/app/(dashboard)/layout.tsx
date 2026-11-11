import { SynexWindowFrame } from "@/components/synex/synex-window-frame";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SynexWindowFrame>{children}</SynexWindowFrame>;
}

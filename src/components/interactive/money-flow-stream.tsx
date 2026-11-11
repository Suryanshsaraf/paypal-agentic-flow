"use client";

import React, { useEffect, useRef } from "react";
import { Invoice } from "@/lib/types";
import { formatCents } from "@/lib/money";

interface MoneyFlowStreamProps {
  invoices: Invoice[];
  className?: string;
}

interface Particle {
  t: number; // 0 to 1 along bezier curve
  speed: number;
  curveIndex: number;
  color: string;
  size: number;
}

export function MoneyFlowStream({ invoices, className = "" }: MoneyFlowStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    const height = (canvas.height = 140);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
    };
    window.addEventListener("resize", handleResize);

    // 3 Anchor Nodes: Left (Clients), Center (PayPal / Agent Rail), Right (Settled Bank)
    const clientNode = { x: 70, y: height * 0.5 };
    const agentNode = { x: width * 0.5, y: height * 0.5 };
    const bankNode = { x: width - 70, y: height * 0.5 };

    // Particles moving along two curve segments:
    // 0: Client -> Agent
    // 1: Agent -> Bank
    const particles: Particle[] = [];
    for (let i = 0; i < 24; i++) {
      particles.push({
        t: Math.random(),
        speed: 0.004 + Math.random() * 0.006,
        curveIndex: Math.random() > 0.4 ? 0 : 1,
        color: Math.random() > 0.5 ? "#6366F1" : "#38BDF8",
        size: Math.random() * 2 + 1.5,
      });
    }

    // Helper: evaluate quadratic bezier point
    const getBezierPoint = (p0: { x: number; y: number }, p1: { x: number; y: number }, p2: { x: number; y: number }, t: number) => {
      const invT = 1 - t;
      return {
        x: invT * invT * p0.x + 2 * invT * t * p1.x + t * t * p2.x,
        y: invT * invT * p0.y + 2 * invT * t * p1.y + t * t * p2.y,
      };
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Recompute node positions on dynamic width
      clientNode.x = 70;
      agentNode.x = width * 0.5;
      bankNode.x = width - 70;

      // Draw Guide Beziers with glowing gradient
      // Curve 1: Client -> Agent
      const ctrl1 = { x: (clientNode.x + agentNode.x) / 2, y: clientNode.y - 28 };
      ctx.beginPath();
      ctx.moveTo(clientNode.x, clientNode.y);
      ctx.quadraticCurveTo(ctrl1.x, ctrl1.y, agentNode.x, agentNode.y);
      ctx.strokeStyle = "rgba(99, 102, 241, 0.2)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Curve 2: Agent -> Bank
      const ctrl2 = { x: (agentNode.x + bankNode.x) / 2, y: agentNode.y + 28 };
      ctx.beginPath();
      ctx.moveTo(agentNode.x, agentNode.y);
      ctx.quadraticCurveTo(ctrl2.x, ctrl2.y, bankNode.x, bankNode.y);
      ctx.strokeStyle = "rgba(16, 185, 129, 0.25)";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Update and Draw Flowing Particles
      for (const p of particles) {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.curveIndex = Math.random() > 0.35 ? 0 : 1;
        }

        const curve = p.curveIndex === 0
          ? getBezierPoint(clientNode, ctrl1, agentNode, p.t)
          : getBezierPoint(agentNode, ctrl2, bankNode, p.t);

        ctx.fillStyle = p.curveIndex === 0 ? p.color : "#10B981";
        ctx.shadowColor = p.curveIndex === 0 ? "#6366F1" : "#10B981";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(curve.x, curve.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Draw Node 1: Clients
      ctx.fillStyle = "#111827";
      ctx.strokeStyle = "#38BDF8";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(clientNode.x, clientNode.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#F8FAFC";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("CLIENTS", clientNode.x, clientNode.y + 30);

      // Draw Node 2: Autonomous Agent & PayPal Rail
      ctx.fillStyle = "#172033";
      ctx.strokeStyle = "#6366F1";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(agentNode.x, agentNode.y, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#818CF8";
      ctx.font = "bold 11px sans-serif";
      ctx.fillText("AI AGENT", agentNode.x, agentNode.y + 4);
      ctx.fillStyle = "#94A3B8";
      ctx.font = "9px sans-serif";
      ctx.fillText("PAYPAL RAIL", agentNode.x, agentNode.y + 36);

      // Draw Node 3: Bank
      ctx.fillStyle = "#111827";
      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(bankNode.x, bankNode.y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#10B981";
      ctx.font = "10px sans-serif";
      ctx.fillText("SETTLED", bankNode.x, bankNode.y + 30);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [invoices]);

  return (
    <div className={`relative w-full overflow-hidden rounded-panel bg-bg-secondary/40 border border-border/60 p-3 ${className}`}>
      <div className="flex items-center justify-between mb-1 px-3">
        <span className="text-[11px] font-mono uppercase tracking-wider text-text-muted flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-accent agent-pulse" />
          Live Autonomous Rail Stream
        </span>
        <span className="text-[10px] text-text-muted">
          Real-time webhook telemetry
        </span>
      </div>
      <canvas ref={canvasRef} className="w-full h-[140px]" />
    </div>
  );
}

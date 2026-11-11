"use client";

import React from "react";
import { Lottie } from "lottie-react";

// 1. Sleek Checkmark Success Lottie Data
const checkmarkLottie = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "Success Check",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Checkmark",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [0, 0, 100] },
            { t: 25, s: [120, 120, 100] },
            { t: 40, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: "gr",
          it: [
            {
              ty: "sh",
              ks: {
                a: 0,
                k: {
                  i: [[0, 0], [0, 0], [0, 0]],
                  o: [[0, 0], [0, 0], [0, 0]],
                  v: [[-14, 0], [-4, 10], [14, -10]],
                  c: false,
                },
              },
            },
            {
              ty: "st",
              c: { a: 0, k: [0.06, 0.72, 0.5, 1] }, // #10B981
              o: { a: 0, k: 100 },
              w: { a: 0, k: 5 },
              lc: 2,
              lj: 2,
            },
          ],
        },
      ],
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Circle",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [0, 0, 100] },
            { t: 30, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [70, 70] },
        },
        {
          ty: "st",
          c: { a: 0, k: [0.06, 0.72, 0.5, 1] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 3 },
        },
      ],
    },
  ],
};

// 2. Pulse Radar Lottie Data (Agent Scanning)
const radarLottie = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 120,
  w: 100,
  h: 100,
  nm: "Radar Pulse",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Ring Pulse",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [100] },
            { t: 100, s: [0] },
          ],
        },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [20, 20, 100] },
            { t: 100, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [60, 60] },
        },
        {
          ty: "st",
          c: { a: 0, k: [0.39, 0.4, 0.95, 1] }, // #6366F1
          o: { a: 0, k: 100 },
          w: { a: 0, k: 2 },
        },
      ],
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Core Dot",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [14, 14] },
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.52, 0.8, 0.09, 1] }, // #84CC16 Lime
          o: { a: 0, k: 100 },
        },
      ],
    },
  ],
};

export function LottieCheck({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center ${className}`}>
      <Lottie src={checkmarkLottie} autoplay loop={false} />
    </div>
  );
}

export function LottieAgentRadar({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center ${className}`}>
      <Lottie src={radarLottie} autoplay loop={true} />
    </div>
  );
}

// 3. Floating Coins / Settlement Lottie Data
const coinsLottie = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 120,
  w: 100,
  h: 100,
  nm: "Coin Float",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Coin 1",
      sr: 1,
      ks: {
        o: {
          a: 1,
          k: [
            { t: 0, s: [60] },
            { t: 60, s: [100] },
            { t: 120, s: [60] },
          ],
        },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [50, 52, 0] },
            { t: 60, s: [50, 44, 0] },
            { t: 120, s: [50, 52, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [38, 38] },
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.96, 0.62, 0.04, 1] }, // #F59E0B Amber Gold
          o: { a: 0, k: 100 },
        },
        {
          ty: "st",
          c: { a: 0, k: [1, 1, 1, 0.4] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 2 },
        },
      ],
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Coin Inner Rim",
      sr: 1,
      ks: {
        o: { a: 0, k: 80 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [50, 52, 0] },
            { t: 60, s: [50, 44, 0] },
            { t: 120, s: [50, 52, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: "el",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [26, 26] },
        },
        {
          ty: "st",
          c: { a: 0, k: [1, 1, 1, 0.6] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 1.5 },
        },
      ],
    },
  ],
};

export function LottieCoins({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center ${className}`}>
      <Lottie src={coinsLottie} autoplay loop={true} />
    </div>
  );
}

// 4. Autonomous Robot Agent (Matching LottieFiles Md. Fazle Hasan reference)
const botLottie = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 120,
  w: 100,
  h: 100,
  nm: "Autonomous Bot",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Bot Floating Body",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: {
          a: 1,
          k: [
            { t: 0, s: [50, 50, 0] },
            { t: 60, s: [50, 44, 0] },
            { t: 120, s: [50, 50, 0] },
          ],
        },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        // Antenna
        {
          ty: "el",
          p: { a: 0, k: [0, -28] },
          s: { a: 0, k: [8, 8] },
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.52, 0.8, 0.09, 1] }, // #84CC16 Lime
          o: { a: 0, k: 100 },
        },
        // Head / Body Outer Ring
        {
          ty: "rc",
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [46, 38] },
          r: { a: 0, k: 12 },
        },
        {
          ty: "st",
          c: { a: 0, k: [1, 1, 1, 0.9] },
          o: { a: 0, k: 100 },
          w: { a: 0, k: 3 },
        },
        // Eye Left
        {
          ty: "el",
          p: { a: 0, k: [-10, -2] },
          s: { a: 0, k: [7, 7] },
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.22, 0.74, 0.97, 1] }, // Cyan eye #38BDF8
          o: { a: 0, k: 100 },
        },
        // Eye Right
        {
          ty: "el",
          p: { a: 0, k: [10, -2] },
          s: { a: 0, k: [7, 7] },
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.22, 0.74, 0.97, 1] },
          o: { a: 0, k: 100 },
        },
        // Glowing Power Button on chest
        {
          ty: "el",
          p: { a: 0, k: [0, 8] },
          s: { a: 0, k: [6, 6] },
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.52, 0.8, 0.09, 1] },
          o: { a: 0, k: 100 },
        },
      ],
    },
  ],
};

export function LottieAutonomousBot({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center ${className}`}>
      <Lottie src={botLottie} autoplay loop={true} />
    </div>
  );
}

// 5. Financial Growth Chart (Matching LottieFiles Zakaria Harry Utomo reference)
const growthLottie = {
  v: "5.5.7",
  fr: 60,
  ip: 0,
  op: 120,
  w: 100,
  h: 100,
  nm: "Growth Chart",
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: "Bar 1",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [32, 65, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 20, 100] },
            { t: 40, s: [100, 60, 100] },
            { t: 120, s: [100, 60, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: "rc",
          p: { a: 0, k: [0, -10] },
          s: { a: 0, k: [12, 24] },
          r: { a: 0, k: 4 },
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.96, 0.62, 0.04, 1] }, // Amber
          o: { a: 0, k: 100 },
        },
      ],
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: "Bar 2",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 65, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 20, 100] },
            { t: 50, s: [100, 80, 100] },
            { t: 120, s: [100, 80, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: "rc",
          p: { a: 0, k: [0, -16] },
          s: { a: 0, k: [12, 36] },
          r: { a: 0, k: 4 },
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.23, 0.51, 0.96, 1] }, // Blue
          o: { a: 0, k: 100 },
        },
      ],
    },
    {
      ddd: 0,
      ind: 3,
      ty: 4,
      nm: "Bar 3",
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [68, 65, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: {
          a: 1,
          k: [
            { t: 0, s: [100, 20, 100] },
            { t: 60, s: [100, 100, 100] },
            { t: 120, s: [100, 100, 100] },
          ],
        },
      },
      shapes: [
        {
          ty: "rc",
          p: { a: 0, k: [0, -24] },
          s: { a: 0, k: [12, 50] },
          r: { a: 0, k: 4 },
        },
        {
          ty: "fl",
          c: { a: 0, k: [0.52, 0.8, 0.09, 1] }, // Lime
          o: { a: 0, k: 100 },
        },
      ],
    },
  ],
};

export function LottieGrowthChart({ size = 48, className = "" }: { size?: number; className?: string }) {
  return (
    <div style={{ width: size, height: size }} className={`inline-flex items-center justify-center ${className}`}>
      <Lottie src={growthLottie} autoplay loop={true} />
    </div>
  );
}

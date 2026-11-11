/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          elevated: "var(--bg-elevated)",
          interactive: "var(--bg-interactive)",
        },
        border: {
          DEFAULT: "var(--border-default)",
          subtle: "var(--border-subtle)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
        },
        accent: {
          DEFAULT: "var(--accent-primary)",
          hover: "var(--accent-primary-hover)",
          muted: "var(--accent-primary-muted)",
        },
        success: {
          DEFAULT: "var(--color-success)",
          muted: "var(--color-success-muted)",
        },
        warning: {
          DEFAULT: "var(--color-warning)",
          muted: "var(--color-warning-muted)",
        },
        danger: {
          DEFAULT: "var(--color-danger)",
          muted: "var(--color-danger-muted)",
        },
        info: {
          DEFAULT: "var(--color-info)",
          muted: "var(--color-info-muted)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "page-title": ["1.75rem", { lineHeight: "2.25rem", fontWeight: "700", letterSpacing: "-0.025em" }],
        "section": ["1rem", { lineHeight: "1.5rem", fontWeight: "600", letterSpacing: "-0.01em" }],
        "figure": ["1.5rem", { lineHeight: "2rem", fontWeight: "700", letterSpacing: "-0.02em" }],
        "figure-lg": ["2rem", { lineHeight: "2.5rem", fontWeight: "700", letterSpacing: "-0.025em" }],
        "body": ["0.875rem", { lineHeight: "1.375rem" }],
        "meta": ["0.75rem", { lineHeight: "1rem" }],
        "timestamp": ["0.6875rem", { lineHeight: "0.875rem" }],
      },
      borderRadius: {
        control: "var(--radius-sm)",
        panel: "var(--radius-lg)",
        pill: "var(--radius-pill)",
      },
      spacing: {
        sidebar: "var(--sidebar-width)",
        "sidebar-collapsed": "var(--sidebar-collapsed-width)",
        header: "var(--header-height)",
      },
      boxShadow: {
        glow: "0 0 20px rgba(99, 102, 241, 0.15)",
        "glow-success": "0 0 20px rgba(16, 185, 129, 0.15)",
        elevated: "0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)",
      },
      animation: {
        "agent-pulse": "agent-pulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

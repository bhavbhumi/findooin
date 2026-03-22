import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ["Montserrat", "sans-serif"],
        body: ["DM Sans", "sans-serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        issuer: {
          DEFAULT: "hsl(var(--issuer))",
          foreground: "hsl(var(--issuer-foreground))",
        },
        intermediary: {
          DEFAULT: "hsl(var(--intermediary))",
          foreground: "hsl(var(--intermediary-foreground))",
        },
        investor: {
          DEFAULT: "hsl(var(--investor))",
          foreground: "hsl(var(--investor-foreground))",
        },
        enabler: {
          DEFAULT: "hsl(var(--enabler))",
          foreground: "hsl(var(--enabler-foreground))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          foreground: "hsl(var(--gold-foreground))",
        },
        "status-success": {
          DEFAULT: "hsl(var(--status-success))",
          foreground: "hsl(var(--status-success-foreground))",
        },
        "status-warning": {
          DEFAULT: "hsl(var(--status-warning))",
          foreground: "hsl(var(--status-warning-foreground))",
        },
        "status-info": {
          DEFAULT: "hsl(var(--status-info))",
          foreground: "hsl(var(--status-info-foreground))",
        },
        "status-highlight": {
          DEFAULT: "hsl(var(--status-highlight))",
          foreground: "hsl(var(--status-highlight-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "confetti1": {
          "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.7" },
          "50%": { transform: "translateY(-6px) scale(1.3)", opacity: "1" },
        },
        "confetti2": {
          "0%, 100%": { transform: "translateY(0) translateX(0) scale(1)", opacity: "0.5" },
          "50%": { transform: "translateY(-4px) translateX(2px) scale(1.2)", opacity: "0.9" },
        },
        "confetti3": {
          "0%, 100%": { transform: "translateY(0) scale(1)", opacity: "0.4" },
          "50%": { transform: "translateY(-5px) translateX(-1px) scale(1.4)", opacity: "0.8" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;

import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.25rem",
        lg: "2rem",
        xl: "2.5rem"
      }
    },
    extend: {
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        ring: "hsl(var(--ring))",
        success: "hsl(var(--success))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        ink: {
          DEFAULT: "#08262a",
          950: "#04191c",
          900: "#08262a",
          800: "#103b41"
        },
        surf: {
          DEFAULT: "#f4fbfb",
          100: "#f4fbfb",
          200: "#dff5f5"
        },
        glow: {
          DEFAULT: "#18b6c4",
          400: "#3ad7df",
          500: "#18b6c4",
          600: "#1093a5"
        }
      },
      borderRadius: {
        xl: "1.5rem",
        "2xl": "1.75rem",
        "3xl": "2rem"
      },
      boxShadow: {
        soft: "0 20px 60px rgba(7, 21, 25, 0.12)",
        lift: "0 30px 70px rgba(16, 147, 165, 0.18)",
        glass: "0 24px 90px rgba(2, 14, 18, 0.24)",
        glow: "0 0 20px rgba(255, 102, 0, 0.5)"
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(58,215,223,0.25), transparent 30%), linear-gradient(135deg, rgba(5,26,30,0.96), rgba(4,18,22,0.88))",
        aurora:
          "radial-gradient(circle at 20% 20%, rgba(58,215,223,0.18), transparent 28%), radial-gradient(circle at 80% 10%, rgba(30,153,196,0.16), transparent 24%), radial-gradient(circle at 60% 80%, rgba(80,230,255,0.08), transparent 30%)"
      },
      fontFamily: {
        sans: ["'Plus Jakarta Sans'", "ui-sans-serif", "system-ui", "sans-serif"],
        editorial: ["'Playfair Display'", "serif"],
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'DM Sans'", "sans-serif"],
        ui: ["'Inter'", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(24, 182, 196, 0.35)" },
          "50%": { boxShadow: "0 0 0 12px rgba(24, 182, 196, 0)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 2.4s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

export default config;

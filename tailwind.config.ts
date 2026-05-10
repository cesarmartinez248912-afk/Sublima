import type { Config } from "tailwindcss";

// ─── Paleta Sublimax Navojoa ───────────────────────────────────────────────
// Extraída del logo: fondo carbón oscuro + manos dorado, azul, verde, rojo
// Primary   = carbón oscuro  #1E1E1E  (fondo del logo, botones principales)
// Accent    = dorado         #F0A500  (mano amarilla, highlights)
// Secondary = azul cielo     #4A9BD5  (mano azul)
// Tertiary  = verde menta    #8DD44E  (mano verde)
// Error     = rojo           #D42020  (mano roja)

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Primary: carbón oscuro (fondo del logo) ─────────────────────
        primary:                    "#1E1E1E",
        "on-primary":               "#FFFFFF",
        "primary-container":        "#F0A500",   // dorado – botones/accents
        "on-primary-container":     "#1E1E1E",
        "primary-fixed":            "#FFF0C0",
        "primary-fixed-dim":        "#FFD166",
        "on-primary-fixed":         "#3D2800",
        "on-primary-fixed-variant": "#6B4400",
        "inverse-primary":          "#FFD166",
        "surface-tint":             "#F0A500",

        // ── Secondary: azul cielo (mano azul) ───────────────────────────
        secondary:                    "#4A9BD5",
        "on-secondary":               "#FFFFFF",
        "secondary-container":        "#C8E4F6",
        "on-secondary-container":     "#1A3A5C",
        "secondary-fixed":            "#E8F4FF",
        "secondary-fixed-dim":        "#94C8EF",
        "on-secondary-fixed":         "#001E33",
        "on-secondary-fixed-variant": "#1A5078",

        // ── Tertiary: verde menta (mano verde) ──────────────────────────
        tertiary:                    "#8DD44E",
        "on-tertiary":               "#FFFFFF",
        "tertiary-container":        "#D4F4B0",
        "on-tertiary-container":     "#1A3A00",
        "tertiary-fixed":            "#E8FAD8",
        "tertiary-fixed-dim":        "#B0E878",
        "on-tertiary-fixed":         "#0A1E00",
        "on-tertiary-fixed-variant": "#2A5200",

        // ── Error: rojo (mano roja) ──────────────────────────────────────
        error:                 "#D42020",
        "on-error":            "#FFFFFF",
        "error-container":     "#FFD7D7",
        "on-error-container":  "#680000",

        // ── Superficies: cálido neutro/blanco ───────────────────────────
        background:                   "#FAFAFA",
        "on-background":              "#1E1E1E",
        surface:                      "#FFFFFF",
        "on-surface":                 "#1E1E1E",
        "surface-variant":            "#F0EDE8",
        "on-surface-variant":         "#444444",
        "surface-bright":             "#FFFFFF",
        "surface-dim":                "#E8E4E0",
        "surface-container-lowest":   "#FFFFFF",
        "surface-container-low":      "#F7F4F0",
        "surface-container":          "#F0EDE8",
        "surface-container-high":     "#E8E4DF",
        "surface-container-highest":  "#E0DDD8",

        // ── Contornos y superficies inversas ────────────────────────────
        outline:             "#888888",
        "outline-variant":   "#CCCCCC",
        "inverse-surface":   "#1E1E1E",
        "inverse-on-surface":"#FAFAFA",
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        "margin-mobile":   "16px",
        unit:              "8px",
        "container-max":   "1280px",
        "section-padding": "80px",
        gutter:            "24px",
      },
      fontFamily: {
        "headline-lg":        ["Montserrat", "sans-serif"],
        "label-sm":           ["Inter", "sans-serif"],
        "body-md":            ["Inter", "sans-serif"],
        "headline-md":        ["Montserrat", "sans-serif"],
        "body-lg":            ["Inter", "sans-serif"],
        "display-lg":         ["Montserrat", "sans-serif"],
        "headline-lg-mobile": ["Montserrat", "sans-serif"],
      },
      fontSize: {
        "headline-lg": ["32px", { lineHeight: "1.2", fontWeight: "600" }],
        "label-sm": [
          "12px",
          { lineHeight: "1", letterSpacing: "0.05em", fontWeight: "600" },
        ],
        "body-md":  ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "headline-md": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "body-lg":  ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "display-lg": [
          "48px",
          { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-lg-mobile": ["28px", { lineHeight: "1.2", fontWeight: "600" }],
      },
      maxWidth: {
        "container-max": "1280px",
      },
      animation: {
        "fade-in":    "fadeIn 0.5s ease-in-out",
        "slide-up":   "slideUp 0.5s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"IBM Plex Sans JP"', '"IBM Plex Sans"', 'system-ui', '-apple-system', '"Hiragino Kaku Gothic ProN"', '"Yu Gothic"', 'Meiryo', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', '"SF Mono"', 'Menlo', 'Consolas', 'monospace'],
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
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg:   "10px",
        md:   "7px",
        sm:   "5px",
        xs:   "3px",
        pill: "999px",
      },
      boxShadow: {
        sm:      "0 1px 2px rgba(21,23,26,0.05)",
        DEFAULT: "0 2px 4px rgba(21,23,26,0.06), 0 1px 2px rgba(21,23,26,0.04)",
        md:      "0 6px 16px rgba(21,23,26,0.08), 0 2px 4px rgba(21,23,26,0.04)",
        lg:      "0 16px 40px rgba(21,23,26,0.12), 0 4px 10px rgba(21,23,26,0.06)",
      },
    },
  },
  plugins: [],
}

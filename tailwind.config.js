/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
      colors: {
        // Ocean Palette Colors
        ocean: {
          'deep-blue': 'var(--ocean-deep-blue)',
          'surface-blue': 'var(--ocean-surface-blue)', 
          'light-blue': 'var(--ocean-light-blue)',
          'foam': 'var(--ocean-foam)',
          'mist': 'var(--ocean-mist)',
        },
        // Chart Colors
        chart: {
          1: 'var(--chart-1)',
          2: 'var(--chart-2)',
          3: 'var(--chart-3)',
          4: 'var(--chart-4)',
          5: 'var(--chart-5)',
        },
        // Mood Colors
        mood: {
          focused: 'var(--mood-focused)',
          calm: 'var(--mood-calm)',
          confident: 'var(--mood-confident)',
          inspired: 'var(--mood-inspired)',
          determined: 'var(--mood-determined)',
        },
        // Life Goal Category Colors
        category: {
          creativity: 'var(--category-creativity)',
          mind: 'var(--category-mind)',
          career: 'var(--category-career)',
          finance: 'var(--category-finance)',
          health: 'var(--category-health)',
          relationships: 'var(--category-relationships)',
          spirit: 'var(--category-spirit)',
          community: 'var(--category-community)',
          travel: 'var(--category-travel)',
          giving: 'var(--category-giving)',
          other: 'var(--category-other)',
        },
        // Semantic Colors
        success: 'var(--success)',
        warning: 'var(--warning)',
        error: 'var(--error)',
        info: 'var(--info)',
        
        // UI Component Colors
        border: "var(--border)",
        input: "var(--input)", 
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

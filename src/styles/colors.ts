// Ocean Palette Color System for Personal OS
// Based on professional blue spectrum for trust and productivity

export const oceanPalette = {
  // Primary Color - Deep Ocean Blue
  primary: 'oklch(0.42 0.12 245)',
  primaryHover: 'oklch(0.38 0.14 245)',
  primaryLight: 'oklch(0.48 0.10 245)',
  
  // Chart Colors - Water & Ocean Tones
  chart: {
    deepBlue: 'oklch(0.58 0.14 240)',      // Chart 1 - Depth, focus
    aquaBlue: 'oklch(0.68 0.12 200)',      // Chart 2 - Clarity, communication  
    oceanBlue: 'oklch(0.62 0.10 220)',     // Chart 3 - Wisdom, balance
    skyBlue: 'oklch(0.72 0.10 190)',       // Chart 4 - Openness, peace
    navyBlue: 'oklch(0.55 0.12 260)',      // Chart 5 - Authority, reliability
  },
  
  // Mood Colors for check-ins and progress
  mood: {
    excellent: 'oklch(0.75 0.12 210)',     // Bright sky blue
    good: 'oklch(0.68 0.10 220)',          // Clear blue
    neutral: 'oklch(0.65 0.05 230)',       // Soft blue-gray
    challenging: 'oklch(0.58 0.08 240)',   // Calm deep blue
    struggling: 'oklch(0.50 0.10 250)',    // Deep ocean blue
  },
  
  // Status Colors (blue-tinted alternatives)
  status: {
    success: 'oklch(0.70 0.12 160)',       // Blue-green for success
    warning: 'oklch(0.75 0.15 80)',        // Blue-yellow for warnings
    error: 'oklch(0.60 0.15 20)',          // Blue-red for errors
    info: 'oklch(0.68 0.12 200)',          // Aqua blue for info
  },
  
  // Neutral Colors (blue-tinted grays)
  neutral: {
    50: 'oklch(0.98 0.01 220)',
    100: 'oklch(0.95 0.01 220)',
    200: 'oklch(0.90 0.02 220)',
    300: 'oklch(0.83 0.02 220)',
    400: 'oklch(0.68 0.03 220)',
    500: 'oklch(0.55 0.04 220)',
    600: 'oklch(0.45 0.05 220)',
    700: 'oklch(0.35 0.06 220)',
    800: 'oklch(0.25 0.06 220)',
    900: 'oklch(0.15 0.06 220)',
  },
  
  // Background Colors
  background: {
    primary: 'oklch(0.99 0.005 220)',      // Very light blue-white
    secondary: 'oklch(0.97 0.01 220)',     // Soft blue-white
    accent: 'oklch(0.95 0.02 220)',        // Light blue-gray
    card: 'oklch(0.98 0.008 220)',         // Card backgrounds
  },
  
  // Text Colors
  text: {
    primary: 'oklch(0.20 0.05 220)',       // Dark blue-gray
    secondary: 'oklch(0.45 0.04 220)',     // Medium blue-gray
    muted: 'oklch(0.60 0.03 220)',         // Light blue-gray
    inverse: 'oklch(0.95 0.01 220)',       // Light text on dark
  },
  
  // Border Colors
  border: {
    light: 'oklch(0.90 0.02 220)',
    medium: 'oklch(0.80 0.03 220)',
    strong: 'oklch(0.70 0.04 220)',
  },
  
  // Interactive States
  interactive: {
    hover: 'oklch(0.92 0.02 220)',
    active: 'oklch(0.88 0.03 220)',
    focus: 'oklch(0.68 0.12 200)',         // Aqua blue for focus
    disabled: 'oklch(0.85 0.02 220)',
  },
  
  // Life Goal Category Colors - Diverse but harmonious palette
  categories: {
    creativityPassion: 'oklch(0.65 0.18 25)',    // Warm coral - creative energy
    mind: 'oklch(0.55 0.15 280)',                // Deep purple - intellectual depth
    career: 'oklch(0.42 0.12 245)',              // Professional navy - trust & reliability
    finance: 'oklch(0.70 0.15 70)',              // Rich gold - prosperity & value
    health: 'oklch(0.65 0.16 140)',              // Vibrant green - vitality & growth
    relationships: 'oklch(0.65 0.15 350)',       // Warm pink - love & connection
    spirit: 'oklch(0.70 0.12 300)',              // Serene lavender - peace & wisdom
    community: 'oklch(0.68 0.16 45)',            // Warm orange - social warmth
    travel: 'oklch(0.65 0.14 180)',              // Bright teal - adventure & exploration
    givingBack: 'oklch(0.55 0.14 160)',          // Forest green - sustainability & care
    other: 'oklch(0.73 0.11 245)',               // Light ocean blue - versatility
  }
};

// CSS Custom Properties for easy usage
export const oceanPaletteCSS = `
:root {
  /* Primary Colors */
  --color-primary: ${oceanPalette.primary};
  --color-primary-hover: ${oceanPalette.primaryHover};
  --color-primary-light: ${oceanPalette.primaryLight};
  
  /* Chart Colors */
  --color-chart-1: ${oceanPalette.chart.deepBlue};
  --color-chart-2: ${oceanPalette.chart.aquaBlue};
  --color-chart-3: ${oceanPalette.chart.oceanBlue};
  --color-chart-4: ${oceanPalette.chart.skyBlue};
  --color-chart-5: ${oceanPalette.chart.navyBlue};
  
  /* Mood Colors */
  --color-mood-excellent: ${oceanPalette.mood.excellent};
  --color-mood-good: ${oceanPalette.mood.good};
  --color-mood-neutral: ${oceanPalette.mood.neutral};
  --color-mood-challenging: ${oceanPalette.mood.challenging};
  --color-mood-struggling: ${oceanPalette.mood.struggling};
  
  /* Status Colors */
  --color-success: ${oceanPalette.status.success};
  --color-warning: ${oceanPalette.status.warning};
  --color-error: ${oceanPalette.status.error};
  --color-info: ${oceanPalette.status.info};
  
  /* Background Colors */
  --color-bg-primary: ${oceanPalette.background.primary};
  --color-bg-secondary: ${oceanPalette.background.secondary};
  --color-bg-accent: ${oceanPalette.background.accent};
  --color-bg-card: ${oceanPalette.background.card};
  
  /* Text Colors */
  --color-text-primary: ${oceanPalette.text.primary};
  --color-text-secondary: ${oceanPalette.text.secondary};
  --color-text-muted: ${oceanPalette.text.muted};
  --color-text-inverse: ${oceanPalette.text.inverse};
  
  /* Border Colors */
  --color-border-light: ${oceanPalette.border.light};
  --color-border-medium: ${oceanPalette.border.medium};
  --color-border-strong: ${oceanPalette.border.strong};
  
  /* Interactive Colors */
  --color-hover: ${oceanPalette.interactive.hover};
  --color-active: ${oceanPalette.interactive.active};
  --color-focus: ${oceanPalette.interactive.focus};
  --color-disabled: ${oceanPalette.interactive.disabled};
}
`;

// Utility function to get mood color by name
export const getMoodColor = (mood: 'excellent' | 'good' | 'neutral' | 'challenging' | 'struggling'): string => {
  return oceanPalette.mood[mood];
};

// Utility function to get chart color by index
export const getChartColor = (index: number): string => {
  const colors = Object.values(oceanPalette.chart);
  return colors[index % colors.length];
};

// Utility function to get status color
export const getStatusColor = (status: 'success' | 'warning' | 'error' | 'info'): string => {
  return oceanPalette.status[status];
};

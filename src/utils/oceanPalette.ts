/**
 * Ocean Palette Utilities
 * Helper functions for using the Ocean Palette color system
 */

// Ocean Palette Color Constants
export const oceanColors = {
  // Primary Ocean Colors
  deepBlue: 'var(--ocean-deep-blue)',
  surfaceBlue: 'var(--ocean-surface-blue)', 
  lightBlue: 'var(--ocean-light-blue)',
  foam: 'var(--ocean-foam)',
  mist: 'var(--ocean-mist)',
  
  // Chart Colors
  chart1: 'var(--chart-1)',
  chart2: 'var(--chart-2)',
  chart3: 'var(--chart-3)',
  chart4: 'var(--chart-4)',
  chart5: 'var(--chart-5)',
  
  // Mood Colors
  focused: 'var(--mood-focused)',
  calm: 'var(--mood-calm)',
  confident: 'var(--mood-confident)',
  inspired: 'var(--mood-inspired)',
  determined: 'var(--mood-determined)',
  
  // Semantic Colors
  success: 'var(--success)',
  warning: 'var(--warning)',
  error: 'var(--error)',
  info: 'var(--info)',
} as const;

// Mood Color Mapping based on Color Psychology
export const getMoodColor = (mood: string): string => {
  const moodMap: Record<string, string> = {
    'focused': oceanColors.focused,
    'concentrated': oceanColors.focused,
    'determined': oceanColors.determined,
    'ambitious': oceanColors.determined,
    'calm': oceanColors.calm,
    'peaceful': oceanColors.calm,
    'confident': oceanColors.confident,
    'strong': oceanColors.confident,
    'inspired': oceanColors.inspired,
    'creative': oceanColors.inspired,
    'motivated': oceanColors.deepBlue,
    'productive': oceanColors.surfaceBlue,
  };
  
  return moodMap[mood.toLowerCase()] || oceanColors.deepBlue;
};

// Status Color Mapping
export const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    'completed': oceanColors.success,
    'in-progress': oceanColors.info,
    'not-started': oceanColors.mist,
    'on-hold': oceanColors.warning,
    'blocked': oceanColors.error,
    'cancelled': oceanColors.error,
  };
  
  return statusMap[status.toLowerCase()] || oceanColors.deepBlue;
};

// Priority Color Mapping
export const getPriorityColor = (priority: string): string => {
  const priorityMap: Record<string, string> = {
    'high': oceanColors.confident,
    'medium': oceanColors.surfaceBlue,
    'low': oceanColors.lightBlue,
  };
  
  return priorityMap[priority.toLowerCase()] || oceanColors.surfaceBlue;
};

// Category Color Mapping for Life Goals
export const getCategoryColor = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'Creativity & Passion': oceanColors.inspired,
    'Mind': oceanColors.chart2,
    'Career': oceanColors.deepBlue,
    'Finance': oceanColors.warning,
    'Health': oceanColors.success,
    'Relationships': oceanColors.confident,
    'Spirit': oceanColors.calm,
    'Community': oceanColors.chart4,
    'Travel': oceanColors.chart3,
    'Giving Back': oceanColors.determined,
    'Other': oceanColors.surfaceBlue,
  };
  
  return categoryMap[category] || oceanColors.deepBlue;
};

// Chart Color Picker for Data Visualization
export const getChartColor = (index: number): string => {
  const chartColors = [
    oceanColors.chart1,
    oceanColors.chart2,
    oceanColors.chart3,
    oceanColors.chart4,
    oceanColors.chart5,
  ];
  
  return chartColors[index % chartColors.length];
};

// Generate Ocean Palette Gradient
export const getOceanGradient = (direction = '135deg'): string => {
  return `linear-gradient(${direction}, ${oceanColors.lightBlue} 0%, ${oceanColors.deepBlue} 100%)`;
};

// Professional Blue Variations for Different UI States
export const getUIStateColor = (state: 'hover' | 'active' | 'disabled' | 'focus'): string => {
  const stateMap: Record<string, string> = {
    'hover': oceanColors.lightBlue,
    'active': oceanColors.deepBlue,
    'disabled': oceanColors.mist,
    'focus': oceanColors.surfaceBlue,
  };
  
  return stateMap[state] || oceanColors.deepBlue;
};

// Alpha variants for transparency
export const getOceanColorWithAlpha = (color: keyof typeof oceanColors, alpha: number): string => {
  // For CSS custom properties, we'll need to use color-mix for alpha
  return `color-mix(in srgb, ${oceanColors[color]} ${Math.round(alpha * 100)}%, transparent)`;
};

/**
 * Usage Examples:
 * 
 * // In a React component:
 * style={{ backgroundColor: oceanColors.deepBlue }}
 * style={{ color: getMoodColor('focused') }}
 * style={{ borderColor: getStatusColor('in-progress') }}
 * 
 * // In CSS:
 * .ocean-card { 
 *   background: var(--ocean-deep-blue);
 *   border: 1px solid var(--ocean-foam);
 * }
 * 
 * // For gradients:
 * style={{ background: getOceanGradient() }}
 */

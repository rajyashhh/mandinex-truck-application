// Theme configuration for Mandinext Truck Tracking App
// Based on agritech branding with green accent and professional blue tones

export const COLORS = {
    // Primary brand colors from logo
    primary: '#214A50',      // Dark teal from logo gradient
    accent: '#8EF55A',       // Bright green from logo gradient
    secondary: '#2D6A4F',    // Complementary green
    
    // Background colors
    background: '#F8FAFC',   // Light gray-blue
    card: '#FFFFFF',         // Pure white for cards
    surface: '#F1F5F9',      // Slightly tinted background
    
    // Text colors
    text: '#1E293B',         // Dark slate for primary text
    textLight: '#64748B',    // Medium slate for secondary text
    textMuted: '#94A3B8',    // Light slate for muted text
    white: '#FFFFFF',
    
    // Input and form colors
    inputBackground: '#F8FAFC',
    inputBorder: '#E2E8F0',
    inputBorderActive: '#8EF55A',
    
    // Status colors
    success: '#10B981',      // Green for success states
    warning: '#F59E0B',      // Amber for warnings
    error: '#EF4444',        // Red for errors
    info: '#3B82F6',         // Blue for info
    
    // Interactive colors
    disabled: '#E2E8F0',     // Light gray for disabled states
    shadow: '#000000',       // Black for shadows
    
    // Gradients (for styled-components or manual gradient creation)
    gradientPrimary: ['#214A50', '#2D6A4F'],
    gradientAccent: ['#8EF55A', '#65D13D'],
    gradientBackground: ['#F8FAFC', '#EDF2F7'],
  };
  
  export const SIZES = {
    // Padding and margins
    base: 8,
    padding: 20,
    margin: 16,
    
    // Border radius
    radius: 12,
    radiusSmall: 8,
    radiusLarge: 20,
    
    // Font sizes
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    h6: 16,
    body: 16,
    caption: 14,
    small: 12,
    
    // Component sizes
    buttonHeight: 48,
    inputHeight: 48,
    iconSize: 24,
    avatarSize: 40,
    
    // Screen dimensions helpers
    width: '100%' as const,
    height: '100%' as const,
  };
  
  export const FONTS = {
    // Font families - adjust based on your font choices
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    
    // Font weights
    weight: {
      light: '300' as const,
      regular: '400' as const,
      medium: '500' as const,
      semiBold: '600' as const,
      bold: '700' as const,
      extraBold: '800' as const,
    },
    
    // Line heights
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
      loose: 1.8,
    },
  };
  
  export const SHADOWS = {
    small: {
      shadowColor: COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    card: {
      shadowColor: COLORS.shadow,
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
  };
  
  export const SPACING = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  };
  
  // Animation timings
  export const ANIMATIONS = {
    fast: 200,
    normal: 300,
    slow: 500,
    verySlow: 1000,
  };
  
  // Breakpoints for responsive design
  export const BREAKPOINTS = {
    phone: 0,
    tablet: 768,
    desktop: 1024,
  };
  
  // Truck and agritech specific theme additions
  export const AGRI_THEME = {
    colors: {
      // Earth tones for agriculture
      soil: '#8B4513',
      wheat: '#F5DEB3',
      corn: '#FFD700',
      tomato: '#FF6347',
      leaf: '#32CD32',
      sky: '#87CEEB',
      
      // Truck related colors
      asphalt: '#36454F',
      tire: '#1C1C1C',
      chrome: '#C0C0C0',
      warning: '#FF8C00',  // Safety orange
    },
    
    // Component specific styling
    components: {
      truck: {
        shadowColor: COLORS.shadow,
        shadowOpacity: 0.3,
        elevation: 6,
      },
      field: {
        backgroundColor: COLORS.accent,
        opacity: 0.1,
      },
      road: {
        backgroundColor: COLORS.primary,
        opacity: 0.8,
      },
    },
  };
  
  // Export default theme object
  export const THEME = {
    colors: COLORS,
    sizes: SIZES,
    fonts: FONTS,
    shadows: SHADOWS,
    spacing: SPACING,
    animations: ANIMATIONS,
    breakpoints: BREAKPOINTS,
    agri: AGRI_THEME,
  };
  
  // Export as default for easier importing
  export default {
    COLORS,
    SIZES,
    FONTS,
    SHADOWS,
    SPACING,
    ANIMATIONS,
    BREAKPOINTS,
    AGRI_THEME,
    THEME,
  };
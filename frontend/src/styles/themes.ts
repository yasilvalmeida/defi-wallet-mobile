export interface Theme {
  colors: {
    // Background Colors
    background: string;
    surface: string;
    surfaceVariant: string;
    
    // Text Colors
    text: string;
    textSecondary: string;
    textTertiary: string;
    
    // Accent Colors
    primary: string;
    primaryVariant: string;
    secondary: string;
    
    // Status Colors
    success: string;
    warning: string;
    error: string;
    info: string;
    
    // Border & Divider Colors
    border: string;
    divider: string;
    
    // Tab Bar
    tabBarBackground: string;
    tabBarBorder: string;
    tabBarActive: string;
    tabBarInactive: string;
    
    // Modal
    modalOverlay: string;
    modalBackground: string;
    
    // Input
    inputBackground: string;
    inputBorder: string;
    inputPlaceholder: string;
    
    // Button
    buttonDisabled: string;
    buttonSecondary: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  typography: {
    sizes: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
    };
    weights: {
      normal: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
    };
  };
}

export const darkTheme: Theme = {
  colors: {
    // Background Colors
    background: '#000000',
    surface: '#1A1A1A',
    surfaceVariant: '#2A2A2A',
    
    // Text Colors
    text: '#FFFFFF',
    textSecondary: '#999999',
    textTertiary: '#666666',
    
    // Accent Colors
    primary: '#6366f1',
    primaryVariant: '#4c4f69',
    secondary: '#10b981',
    
    // Status Colors
    success: '#00D632',
    warning: '#FFA500',
    error: '#FF3838',
    info: '#3B82F6',
    
    // Border & Divider Colors
    border: '#2A2A2A',
    divider: '#333333',
    
    // Tab Bar
    tabBarBackground: '#1A1A1A',
    tabBarBorder: '#333333',
    tabBarActive: '#6366f1',
    tabBarInactive: '#666666',
    
    // Modal
    modalOverlay: 'rgba(0,0,0,0.8)',
    modalBackground: '#1A1A1A',
    
    // Input
    inputBackground: '#333333',
    inputBorder: '#444444',
    inputPlaceholder: '#666666',
    
    // Button
    buttonDisabled: '#333333',
    buttonSecondary: '#2A2A2A',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 24,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

export const lightTheme: Theme = {
  colors: {
    // Background Colors
    background: '#FFFFFF',
    surface: '#F8F9FA',
    surfaceVariant: '#E9ECEF',
    
    // Text Colors
    text: '#1A1A1A',
    textSecondary: '#6C757D',
    textTertiary: '#ADB5BD',
    
    // Accent Colors
    primary: '#6366f1',
    primaryVariant: '#818cf8',
    secondary: '#10b981',
    
    // Status Colors
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    
    // Border & Divider Colors
    border: '#E5E7EB',
    divider: '#D1D5DB',
    
    // Tab Bar
    tabBarBackground: '#FFFFFF',
    tabBarBorder: '#E5E7EB',
    tabBarActive: '#6366f1',
    tabBarInactive: '#9CA3AF',
    
    // Modal
    modalOverlay: 'rgba(0,0,0,0.5)',
    modalBackground: '#FFFFFF',
    
    // Input
    inputBackground: '#F9FAFB',
    inputBorder: '#D1D5DB',
    inputPlaceholder: '#9CA3AF',
    
    // Button
    buttonDisabled: '#F3F4F6',
    buttonSecondary: '#F8F9FA',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    xl: 16,
  },
  typography: {
    sizes: {
      xs: 10,
      sm: 12,
      md: 14,
      lg: 16,
      xl: 18,
      xxl: 24,
    },
    weights: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
  },
};

export const getTheme = (themeType: 'light' | 'dark' | 'system'): Theme => {
  // For now, system defaults to dark. In a real implementation,
  // this would check the device's system preference
  if (themeType === 'light') {
    return lightTheme;
  }
  return darkTheme; // Default to dark for 'dark' and 'system'
};

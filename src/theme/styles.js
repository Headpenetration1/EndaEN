import { StyleSheet, Platform } from 'react-native';
import colors from './colors';

// CSS for web animations - inject this into the page
export const webAnimationCSS = `
  /* Import Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Nunito:wght@600;700;800&display=swap');
  
  * {
    font-family: 'DM Sans', system-ui, -apple-system, sans-serif;
  }
  
  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.5; transform: scale(1.3); }
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  
  @keyframes slideUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(16, 185, 129, 0.5); }
    50% { box-shadow: 0 0 15px rgba(16, 185, 129, 0.8); }
  }
  
  /* Card hover effects */
  [data-testid] {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  
  .hover-lift {
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .hover-lift:hover {
    transform: translateY(-4px) !important;
    box-shadow: 0 20px 40px rgba(0,0,0,0.12), 0 8px 16px rgba(0,0,0,0.08) !important;
  }
  
  .hover-scale {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  }
  .hover-scale:hover {
    transform: scale(1.03) !important;
  }
  
  .hover-glow:hover {
    box-shadow: 0 0 25px rgba(91, 127, 250, 0.35) !important;
  }
  
  .pulse-dot {
    animation: pulse 2s infinite ease-in-out;
  }
  
  .glow-active {
    animation: glow 2s infinite ease-in-out;
  }
  
  .fade-in {
    animation: fadeIn 0.35s ease forwards;
  }
  
  .slide-up {
    animation: slideUp 0.45s ease forwards;
  }
  
  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 8px;
  }
  
  .btn-press {
    transition: transform 0.1s ease !important;
  }
  .btn-press:active {
    transform: scale(0.96) !important;
  }
  
  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
  
  /* Better focus styles */
  input:focus, button:focus, textarea:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(91, 127, 250, 0.25);
  }
  
  /* Selection color */
  ::selection {
    background-color: rgba(91, 127, 250, 0.2);
  }
`;

export const typography = {
  fontFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: 'DM Sans, system-ui, sans-serif',
  }),
  displayFamily: Platform.select({
    ios: 'System',
    android: 'Roboto',
    web: 'Nunito, system-ui, sans-serif',
  }),
};

export const shadows = {
  soft: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.07,
      shadowRadius: 15,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
    },
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 6,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    },
  }),
};

export const commonStyles = StyleSheet.create({
  // Cards
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },
  cardHover: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[100],
    ...shadows.card,
  },

  // Buttons
  btnPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.primary[400],
  },
  btnPrimaryText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  btnSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  btnSecondaryText: {
    color: colors.neutral[700],
    fontSize: 16,
    fontWeight: '500',
  },
  btnSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.success[500],
  },
  btnSuccessText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  btnDanger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: colors.red[500],
  },
  btnDangerText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  btnSmall: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnLarge: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },

  // Inputs
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    fontSize: 16,
    color: colors.neutral[800],
  },

  // Badges
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeSuccess: {
    backgroundColor: colors.success[100],
  },
  badgeSuccessText: {
    color: colors.success[700],
    fontSize: 14,
    fontWeight: '500',
  },
  badgeNeutral: {
    backgroundColor: colors.neutral[100],
  },
  badgeNeutralText: {
    color: colors.neutral[600],
    fontSize: 14,
    fontWeight: '500',
  },

  // Avatar
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
    backgroundColor: colors.primary[100],
  },
  avatarText: {
    color: colors.primary[700],
    fontWeight: '600',
  },
  avatarSm: {
    width: 32,
    height: 32,
  },
  avatarMd: {
    width: 40,
    height: 40,
  },
  avatarLg: {
    width: 56,
    height: 56,
  },
});

export default { colors, typography, shadows, commonStyles };

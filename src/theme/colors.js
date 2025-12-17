// Henteklar fargepalett - Profesjonell og harmonisk
export const colors = {
  // Primær blå - varmere og mer innbydende
  primary: {
    50: '#EEF4FF',
    100: '#E0EAFF',
    200: '#C7D9FF',
    300: '#A4C1FF',
    400: '#7B9FFF',
    500: '#5B7FFA',
    600: '#4361EE',
    700: '#3651DB',
    800: '#2D43B0',
    900: '#2A3B8B',
  },
  // Accent - korall/laks for varme
  accent: {
    50: '#FFF5F3',
    100: '#FFE8E4',
    200: '#FFD5CC',
    300: '#FFB4A6',
    400: '#FF8A75',
    500: '#F56E53',
    600: '#E85A4F',
    700: '#C44536',
    800: '#A33B2E',
    900: '#87342A',
  },
  // Success - frisk grønn
  success: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },
  // Nøytral - varmere grå med bedre dark mode
  neutral: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
    950: '#0F0E0D', // Ekstra mørk for dark mode bakgrunn
  },
  // Advarsel - varm gul/orange
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  // Rød - feilmeldinger
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  // Lilla - for variasjon
  purple: {
    50: '#FAF5FF',
    100: '#F3E8FF',
    200: '#E9D5FF',
    300: '#D8B4FE',
    400: '#C084FC',
    500: '#A855F7',
    600: '#9333EA',
    700: '#7E22CE',
    800: '#6B21A8',
    900: '#581C87',
  },
  // Amber (beholdt for kompatibilitet)
  amber: {
    100: '#FEF3C7',
    500: '#F59E0B',
    700: '#B45309',
  },
  white: '#FFFFFF',
  black: '#000000',
  
  // ===== DARK MODE FARGER - Attraktiv og harmonisk =====
  dark: {
    // Bakgrunner - dype, elegante mørkeblå-grå toner
    bg: {
      primary: '#0D1117',      // Hovedbakgrunn - dyp nattblå
      secondary: '#161B22',    // Sekundær bakgrunn - litt lysere
      tertiary: '#1C2128',     // Tertiær - kort bakgrunn
      elevated: '#21262D',     // Hevet elementer - modaler etc
      hover: '#262C36',        // Hover-tilstand
    },
    // Overflater/kort
    surface: {
      default: '#161B22',      // Standard kort
      raised: '#1C2128',       // Hevet kort
      overlay: '#21262D',      // Overlay/modal
    },
    // Kantlinjer
    border: {
      subtle: '#21262D',       // Subtil kant
      default: '#30363D',      // Standard kant
      emphasis: '#484F58',     // Fremhevet kant
    },
    // Tekst
    text: {
      primary: '#E6EDF3',      // Primær tekst - varm hvit
      secondary: '#8B949E',    // Sekundær tekst
      muted: '#6E7681',        // Dempet tekst
      placeholder: '#484F58',  // Placeholder
    },
    // Primærfarge i dark mode - lysere blå
    primary: {
      default: '#58A6FF',      // Primær blå
      hover: '#79B8FF',        // Hover
      muted: '#1F3A5F',        // Dempet bakgrunn
      subtle: '#162338',       // Subtil bakgrunn
    },
    // Suksess i dark mode
    success: {
      default: '#3FB950',      // Suksess grønn
      muted: '#1C4428',        // Dempet bakgrunn
    },
    // Advarsel i dark mode
    warning: {
      default: '#D29922',      // Advarsel gul
      muted: '#3D2F00',        // Dempet bakgrunn
    },
    // Feil i dark mode
    danger: {
      default: '#F85149',      // Feil rød
      muted: '#4A1D1D',        // Dempet bakgrunn
    },
  },
  
  // Semantiske farger
  background: {
    light: '#FAFAF9',
    dark: '#0D1117',
  },
  surface: {
    light: '#FFFFFF',
    dark: '#161B22',
  },
  text: {
    primary: {
      light: '#1C1917',
      dark: '#E6EDF3',
    },
    secondary: {
      light: '#57534E',
      dark: '#8B949E',
    },
  },
};

export default colors;


import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  TouchableOpacity,
  Pressable,
  Animated,
  Platform,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path, G, Defs, LinearGradient as SvgGradient, Stop, Ellipse } from 'react-native-svg';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme';

// SVG Flag components
const FlagNO = ({ size = 20 }) => (
  <Svg width={size} height={size * 0.72} viewBox="0 0 22 16">
    <Path d="M0 0h22v16H0z" fill="#BA0C2F" />
    <Path d="M6 0h4v16H6z" fill="#fff" />
    <Path d="M0 6h22v4H0z" fill="#fff" />
    <Path d="M7 0h2v16H7z" fill="#00205B" />
    <Path d="M0 7h22v2H0z" fill="#00205B" />
  </Svg>
);

const FlagGB = ({ size = 20 }) => (
  <Svg width={size} height={size * 0.6} viewBox="0 0 60 36">
    <Path d="M0 0h60v36H0z" fill="#00247D" />
    <Path d="M0 0l60 36M60 0L0 36" stroke="#fff" strokeWidth="6" />
    <Path d="M0 0l60 36M60 0L0 36" stroke="#CF142B" strokeWidth="4" />
    <Path d="M30 0v36M0 18h60" stroke="#fff" strokeWidth="10" />
    <Path d="M30 0v36M0 18h60" stroke="#CF142B" strokeWidth="6" />
  </Svg>
);

const FlagSA = ({ size = 20 }) => (
  <Svg width={size} height={size * 0.67} viewBox="0 0 30 20">
    <Path d="M0 0h30v20H0z" fill="#006C35" />
    <Path d="M6 7h18v1H6zM8 10h14v1H8zM10 13h10v1H10z" fill="#fff" />
  </Svg>
);

const FlagPL = ({ size = 20 }) => (
  <Svg width={size} height={size * 0.625} viewBox="0 0 16 10">
    <Path d="M0 0h16v5H0z" fill="#fff" />
    <Path d="M0 5h16v5H0z" fill="#DC143C" />
  </Svg>
);

const FlagSO = ({ size = 20 }) => (
  <Svg width={size} height={size * 0.67} viewBox="0 0 30 20">
    <Path d="M0 0h30v20H0z" fill="#4189DD" />
    <Path d="M15 4l1.5 4.5h4.7l-3.8 2.8 1.4 4.5-3.8-2.8-3.8 2.8 1.4-4.5-3.8-2.8h4.7z" fill="#fff" />
  </Svg>
);

const FlagPK = ({ size = 20 }) => (
  <Svg width={size} height={size * 0.67} viewBox="0 0 30 20">
    <Path d="M0 0h7.5v20H0z" fill="#fff" />
    <Path d="M7.5 0h22.5v20H7.5z" fill="#01411C" />
    <Circle cx="17" cy="10" r="4.5" fill="#fff" />
    <Circle cx="18.5" cy="10" r="3.5" fill="#01411C" />
    <Path d="M20 6l0.8 2.5 2.6 0-2.1 1.5 0.8 2.5-2.1-1.5-2.1 1.5 0.8-2.5-2.1-1.5 2.6 0z" fill="#fff" />
  </Svg>
);

// Flag component selector
const FlagIcon = ({ countryCode, size = 20 }) => {
  switch (countryCode) {
    case 'NO': return <FlagNO size={size} />;
    case 'GB': return <FlagGB size={size} />;
    case 'SA': return <FlagSA size={size} />;
    case 'PL': return <FlagPL size={size} />;
    case 'SO': return <FlagSO size={size} />;
    case 'PK': return <FlagPK size={size} />;
    default: return <FlagNO size={size} />;
  }
};

// Language options
const LANGUAGES = [
  { code: 'nb', name: 'Norsk', countryCode: 'NO' },
  { code: 'en', name: 'English', countryCode: 'GB' },
  { code: 'ar', name: 'العربية', countryCode: 'SA' },
  { code: 'pl', name: 'Polski', countryCode: 'PL' },
  { code: 'so', name: 'Soomaali', countryCode: 'SO' },
  { code: 'ur', name: 'اردو', countryCode: 'PK' },
];

// Animated floating bubble - MORE VISIBLE
const FloatingBubble = ({ size, initialX, initialY, duration, delay, color = 'blue', isDark, screenWidth }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Adjust position for screen width
  const adjustedX = typeof initialX === 'function' ? initialX(screenWidth) : initialX;

  useEffect(() => {
    const animateY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -25,
          duration: duration,
          useNativeDriver: true,
          delay: delay,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    );

    const animateX = Animated.loop(
      Animated.sequence([
        Animated.timing(translateX, {
          toValue: 12,
          duration: duration * 1.2,
          useNativeDriver: true,
          delay: delay + 200,
        }),
        Animated.timing(translateX, {
          toValue: -12,
          duration: duration * 1.2,
          useNativeDriver: true,
        }),
        Animated.timing(translateX, {
          toValue: 0,
          duration: duration * 0.6,
          useNativeDriver: true,
        }),
      ])
    );

    const animateScale = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: duration * 0.9,
          useNativeDriver: true,
          delay: delay + 400,
        }),
        Animated.timing(scale, {
          toValue: 0.94,
          duration: duration * 0.9,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: duration * 0.4,
          useNativeDriver: true,
        }),
      ])
    );

    animateY.start();
    animateX.start();
    animateScale.start();

    return () => {
      animateY.stop();
      animateX.stop();
      animateScale.stop();
    };
  }, []);

  // Dark mode: more vibrant, glowing bubbles
  const gradientColors = isDark
    ? color === 'coral' 
      ? ['rgba(248, 81, 73, 0.25)', 'rgba(232, 90, 79, 0.15)']
      : ['rgba(88, 166, 255, 0.30)', 'rgba(67, 97, 238, 0.20)']
    : color === 'coral' 
      ? ['rgba(232, 90, 79, 0.35)', 'rgba(194, 58, 58, 0.25)']
      : ['rgba(91, 127, 250, 0.40)', 'rgba(67, 97, 238, 0.30)'];

  return (
    <Animated.View
      style={[
        styles.floatingBubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: adjustedX,
          top: initialY,
          transform: [
            { translateY },
            { translateX },
            { scale },
          ],
        },
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        style={[styles.bubbleGradient, { borderRadius: size / 2 }]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
};

// HoverButton - Knapp med hover-effekt for web
const HoverButton = ({ children, style, hoverStyle, onPress, activeOpacity = 0.8 }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed, hovered }) => [
        style,
        Platform.OS === 'web' && { 
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
        hovered && Platform.OS === 'web' && hoverStyle,
        pressed && { opacity: activeOpacity },
      ]}
    >
      {children}
    </Pressable>
  );
};

// Professional SVG Logo - Girl with red pigtails (bouncing)
const MascotLogo = ({ size = 120 }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -6,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <SvgGradient id="bgGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#5B7FFA" />
            <Stop offset="100%" stopColor="#4361EE" />
          </SvgGradient>
          <SvgGradient id="hairGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#E85A4F" />
            <Stop offset="50%" stopColor="#D64545" />
            <Stop offset="100%" stopColor="#C23A3A" />
          </SvgGradient>
          <SvgGradient id="faceGradMain" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFEDDE" />
            <Stop offset="100%" stopColor="#FFE0C8" />
          </SvgGradient>
          <SvgGradient id="ribbonGradMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FFD93D" />
            <Stop offset="100%" stopColor="#F5B800" />
          </SvgGradient>
        </Defs>

        <Circle cx="60" cy="60" r="56" fill="url(#bgGradMain)" />
        <Circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

        {/* Left pigtail */}
        <G>
          <Ellipse cx="22" cy="52" rx="12" ry="18" fill="url(#hairGradMain)" />
          <Ellipse cx="22" cy="52" rx="10" ry="15" fill="url(#hairGradMain)" opacity="0.8" />
          <Circle cx="22" cy="34" r="6" fill="url(#ribbonGradMain)" />
          <Circle cx="22" cy="34" r="4" fill="#FFE566" />
          <Path d="M18 38 Q14 45 16 52" stroke="#F5B800" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M26 38 Q30 45 28 52" stroke="#F5B800" strokeWidth="3" fill="none" strokeLinecap="round" />
        </G>

        {/* Right pigtail */}
        <G>
          <Ellipse cx="98" cy="52" rx="12" ry="18" fill="url(#hairGradMain)" />
          <Ellipse cx="98" cy="52" rx="10" ry="15" fill="url(#hairGradMain)" opacity="0.8" />
          <Circle cx="98" cy="34" r="6" fill="url(#ribbonGradMain)" />
          <Circle cx="98" cy="34" r="4" fill="#FFE566" />
          <Path d="M94 38 Q90 45 92 52" stroke="#F5B800" strokeWidth="3" fill="none" strokeLinecap="round" />
          <Path d="M102 38 Q106 45 104 52" stroke="#F5B800" strokeWidth="3" fill="none" strokeLinecap="round" />
        </G>

        {/* Hair top/bangs */}
        <Path d="M32 48 Q35 22 60 18 Q85 22 88 48 Q82 35 60 30 Q38 35 32 48" fill="url(#hairGradMain)" />
        <Path d="M32 48 Q28 55 32 68 L38 64 Q35 55 38 48 Z" fill="url(#hairGradMain)" />
        <Path d="M88 48 Q92 55 88 68 L82 64 Q85 55 82 48 Z" fill="url(#hairGradMain)" />

        {/* Face */}
        <Circle cx="60" cy="60" r="26" fill="url(#faceGradMain)" />
        <Ellipse cx="52" cy="52" rx="12" ry="8" fill="rgba(255,255,255,0.3)" />

        {/* Bangs detail */}
        <Path d="M40 50 Q45 38 60 36 Q75 38 80 50 Q72 45 60 42 Q48 45 40 50" fill="url(#hairGradMain)" />

        {/* Eyes */}
        <G>
          <Ellipse cx="50" cy="58" rx="7" ry="8" fill="white" />
          <Circle cx="50" cy="59" r="5" fill="#2D3748" />
          <Circle cx="50" cy="59" r="2.5" fill="#1A202C" />
          <Circle cx="52" cy="57" r="2" fill="white" />
          <Circle cx="48" cy="61" r="1" fill="white" opacity="0.5" />
          
          <Ellipse cx="70" cy="58" rx="7" ry="8" fill="white" />
          <Circle cx="70" cy="59" r="5" fill="#2D3748" />
          <Circle cx="70" cy="59" r="2.5" fill="#1A202C" />
          <Circle cx="72" cy="57" r="2" fill="white" />
          <Circle cx="68" cy="61" r="1" fill="white" opacity="0.5" />
        </G>

        {/* Eyebrows */}
        <Path d="M44 50 Q50 48 54 50" stroke="#C23A3A" strokeWidth="2" fill="none" strokeLinecap="round" />
        <Path d="M66 50 Q70 48 76 50" stroke="#C23A3A" strokeWidth="2" fill="none" strokeLinecap="round" />

        {/* Blush */}
        <Ellipse cx="42" cy="68" rx="6" ry="4" fill="#FFB6B6" opacity="0.5" />
        <Ellipse cx="78" cy="68" rx="6" ry="4" fill="#FFB6B6" opacity="0.5" />

        {/* Nose */}
        <Path d="M60 62 L58 68 L62 68" fill="none" stroke="#E8C4B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Smile */}
        <Path d="M52 74 Q60 82 68 74" fill="none" stroke="#E85A4F" strokeWidth="3" strokeLinecap="round" />
        <Path d="M54 75 Q60 80 66 75" fill="white" opacity="0.8" />

        {/* Freckles */}
        <Circle cx="45" cy="64" r="1" fill="#E8A090" opacity="0.6" />
        <Circle cx="48" cy="66" r="1" fill="#E8A090" opacity="0.6" />
        <Circle cx="72" cy="64" r="1" fill="#E8A090" opacity="0.6" />
        <Circle cx="75" cy="66" r="1" fill="#E8A090" opacity="0.6" />
      </Svg>
    </Animated.View>
  );
};

// Small logo for header/footer
const SmallLogo = ({ size = 42 }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120">
    <Defs>
      <SvgGradient id="bgGradSmall" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#5B7FFA" />
        <Stop offset="100%" stopColor="#4361EE" />
      </SvgGradient>
      <SvgGradient id="hairGradSmall" x1="0%" y1="0%" x2="100%" y2="100%">
        <Stop offset="0%" stopColor="#E85A4F" />
        <Stop offset="100%" stopColor="#C23A3A" />
      </SvgGradient>
    </Defs>
    <Circle cx="60" cy="60" r="56" fill="url(#bgGradSmall)" />
    <Ellipse cx="22" cy="52" rx="10" ry="16" fill="url(#hairGradSmall)" />
    <Circle cx="22" cy="36" r="5" fill="#FFD93D" />
    <Ellipse cx="98" cy="52" rx="10" ry="16" fill="url(#hairGradSmall)" />
    <Circle cx="98" cy="36" r="5" fill="#FFD93D" />
    <Path d="M32 48 Q35 22 60 18 Q85 22 88 48 Q82 35 60 30 Q38 35 32 48" fill="url(#hairGradSmall)" />
    <Circle cx="60" cy="60" r="26" fill="#FFEDDE" />
    <Path d="M40 50 Q45 38 60 36 Q75 38 80 50 Q72 45 60 42 Q48 45 40 50" fill="url(#hairGradSmall)" />
    <Circle cx="50" cy="59" r="4" fill="#2D3748" />
    <Circle cx="70" cy="59" r="4" fill="#2D3748" />
    <Circle cx="51.5" cy="57.5" r="1.5" fill="white" />
    <Circle cx="71.5" cy="57.5" r="1.5" fill="white" />
    <Path d="M52 74 Q60 82 68 74" fill="none" stroke="#E85A4F" strokeWidth="3" strokeLinecap="round" />
  </Svg>
);

const LandingScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isDark, toggleTheme } = useTheme();
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Use dynamic dimensions
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const isSmallScreen = width < 380;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  // Theme colors
  const bgColor = isDark ? colors.dark.bg.primary : colors.white;
  const cardBg = isDark ? colors.dark.surface.default : colors.white;
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[600];
  const borderColor = isDark ? colors.dark.border.default : colors.neutral[100];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguageModal(false);
  };

  const currentLanguage = LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];

  const features = [
    {
      icon: 'flash',
      color: isDark ? colors.dark.primary.default : colors.primary[500],
      bgColor: isDark ? colors.dark.primary.muted : colors.primary[50],
      title: t('features.quickCheckIn'),
      description: t('features.quickCheckInDesc'),
    },
    {
      icon: 'shield-checkmark',
      color: isDark ? colors.dark.success.default : colors.success[500],
      bgColor: isDark ? colors.dark.success.muted : colors.success[50],
      title: t('features.secure'),
      description: t('features.secureDesc'),
    },
    {
      icon: 'phone-portrait',
      color: colors.purple[500],
      bgColor: isDark ? 'rgba(168, 85, 247, 0.15)' : colors.purple[50],
      title: t('features.everywhere'),
      description: t('features.everywhereDesc'),
    },
    {
      icon: 'people',
      color: isDark ? colors.dark.warning.default : colors.warning[500],
      bgColor: isDark ? colors.dark.warning.muted : colors.warning[50],
      title: t('features.overview'),
      description: t('features.overviewDesc'),
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={[
          styles.header, 
          { 
            paddingTop: insets.top + 12, 
            backgroundColor: bgColor,
            borderBottomWidth: 1,
            borderBottomColor: isDark ? colors.dark.border.subtle : colors.neutral[200],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.15 : 0.05,
            shadowRadius: 8,
            elevation: 3,
          }
        ]}>
          <View style={styles.headerLogo}>
            <SmallLogo size={isSmallScreen ? 36 : 42} />
            {!isSmallScreen && (
              <Text style={[styles.headerTitle, { color: isDark ? colors.dark.primary.default : colors.primary[600] }]}>Henteklar</Text>
            )}
          </View>
          
          <View style={styles.headerActions}>
            {/* Language Selector */}
            <HoverButton 
              style={[styles.headerButton, { backgroundColor: isDark ? colors.dark.bg.tertiary : colors.neutral[100], paddingHorizontal: isSmallScreen ? 8 : 12 }]}
              hoverStyle={{ 
                backgroundColor: isDark ? colors.dark.bg.secondary : colors.neutral[200],
                transform: [{ scale: 1.02 }],
              }}
              onPress={() => setShowLanguageModal(true)}
            >
              <FlagIcon countryCode={currentLanguage.countryCode} size={isSmallScreen ? 18 : 22} />
              {!isSmallScreen && <Ionicons name="chevron-down" size={14} color={subtextColor} />}
            </HoverButton>

            {/* Dark Mode Toggle */}
            <HoverButton 
              style={[styles.headerButton, { 
                backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50],
                paddingHorizontal: isSmallScreen ? 8 : 12,
              }]}
              hoverStyle={{ 
                backgroundColor: isDark ? colors.primary[800] : colors.primary[100],
                transform: [{ scale: 1.05 }],
              }}
              onPress={toggleTheme}
            >
              <Ionicons 
                name={isDark ? 'sunny' : 'moon'} 
                size={isSmallScreen ? 16 : 18} 
                color={isDark ? colors.dark.primary.default : colors.primary[600]} 
              />
            </HoverButton>

            {/* Login Button */}
            <HoverButton 
              style={[styles.loginButton, { paddingHorizontal: isSmallScreen ? 12 : 20 }]}
              hoverStyle={{ 
                backgroundColor: colors.primary[600],
                transform: [{ scale: 1.03 }],
                shadowColor: colors.primary[500],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
              }}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={[styles.loginButtonText, { fontSize: isSmallScreen ? 13 : 15 }]}>{t('login')}</Text>
              <Ionicons name="arrow-forward" size={isSmallScreen ? 16 : 18} color={colors.white} />
            </HoverButton>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={isDark 
              ? [colors.dark.bg.primary, colors.dark.bg.secondary, colors.dark.bg.primary]
              : [colors.primary[50], '#f0f4ff', colors.white]
            }
            style={styles.heroGradient}
          >
            {/* Animated floating bubbles */}
            <FloatingBubble size={isSmallScreen ? 180 : 260} initialX={-70} initialY={-50} duration={4000} delay={0} color="blue" isDark={isDark} screenWidth={width} />
            <FloatingBubble size={isSmallScreen ? 120 : 180} initialX={(w) => w - (isSmallScreen ? 60 : 100)} initialY={-30} duration={5000} delay={500} color="blue" isDark={isDark} screenWidth={width} />
            <FloatingBubble size={isSmallScreen ? 100 : 140} initialX={(w) => w - (isSmallScreen ? 120 : 160)} initialY={180} duration={3500} delay={1000} color="coral" isDark={isDark} screenWidth={width} />
            <FloatingBubble size={isSmallScreen ? 70 : 100} initialX={30} initialY={260} duration={4500} delay={300} color="coral" isDark={isDark} screenWidth={width} />
            <FloatingBubble size={isSmallScreen ? 80 : 120} initialX={(w) => w / 2 - 60} initialY={-80} duration={5500} delay={800} color="blue" isDark={isDark} screenWidth={width} />
            <FloatingBubble size={isSmallScreen ? 50 : 80} initialX={70} initialY={130} duration={3000} delay={1200} color="blue" isDark={isDark} screenWidth={width} />
            <FloatingBubble size={isSmallScreen ? 40 : 60} initialX={(w) => w - (isSmallScreen ? 60 : 90)} initialY={100} duration={3800} delay={600} color="coral" isDark={isDark} screenWidth={width} />
            
            <Animated.View 
              style={[
                styles.heroContent,
                {
                  opacity: fadeAnim,
                  transform: [
                    { translateY: slideAnim },
                    { scale: scaleAnim },
                  ],
                },
              ]}
            >
              {/* Mascot with glow */}
              <View style={styles.mascotContainer}>
                <View style={[styles.mascotGlow, { 
                  backgroundColor: isDark ? colors.dark.primary.default : colors.primary[200],
                  opacity: isDark ? 0.2 : 0.3,
                  width: isSmallScreen ? 160 : 200,
                  height: isSmallScreen ? 160 : 200,
                  borderRadius: isSmallScreen ? 80 : 100,
                }]} />
                <View style={[styles.mascotGlowInner, { 
                  backgroundColor: isDark ? colors.dark.primary.default : colors.primary[300],
                  opacity: isDark ? 0.15 : 0.2,
                  width: isSmallScreen ? 130 : 160,
                  height: isSmallScreen ? 130 : 160,
                  borderRadius: isSmallScreen ? 65 : 80,
                }]} />
                <MascotLogo size={isLargeScreen ? 160 : (isSmallScreen ? 110 : 140)} />
              </View>

              {/* Badge */}
              <View style={[styles.tagline, { 
                backgroundColor: isDark ? colors.dark.surface.default : colors.white,
                borderColor: isDark ? colors.dark.border.default : colors.primary[100],
              }]}>
                <Ionicons name="sparkles" size={isSmallScreen ? 14 : 16} color={isDark ? colors.dark.primary.default : colors.primary[600]} />
                <Text style={[styles.taglineText, { color: isDark ? colors.dark.primary.default : colors.primary[700], fontSize: isSmallScreen ? 12 : 14 }]}>{t('landing.tagline')}</Text>
              </View>

              {/* Title */}
              <Text style={[styles.heroTitle, { color: textColor, fontSize: isLargeScreen ? 52 : (isSmallScreen ? 28 : 36), lineHeight: isLargeScreen ? 62 : (isSmallScreen ? 34 : 44) }]}>
                {t('landing.title')}{'\n'}
                <Text style={[styles.heroHighlight, { color: isDark ? colors.dark.primary.default : colors.primary[500] }]}>{t('landing.titleHighlight')}</Text>
              </Text>

              {/* Subtitle */}
              <Text style={[styles.heroSubtitle, { color: subtextColor, fontSize: isSmallScreen ? 15 : 17 }]}>{t('landing.subtitle')}</Text>

              {/* CTA Button */}
              <HoverButton 
                style={styles.primaryCta}
                hoverStyle={{
                  transform: [{ scale: 1.03 }],
                  shadowColor: colors.primary[500],
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                }}
                onPress={() => navigation.navigate('Login')}
              >
                <LinearGradient
                  colors={[colors.primary[500], colors.primary[600]]}
                  style={styles.primaryCtaGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryCtaText}>{t('landing.getStarted')}</Text>
                  <View style={styles.ctaIconContainer}>
                    <Ionicons name="arrow-forward" size={20} color={colors.white} />
                  </View>
                </LinearGradient>
              </HoverButton>

              {/* Trust badges */}
              <View style={[styles.trustBadges, { 
                backgroundColor: isDark ? colors.dark.surface.default : colors.white,
              }]}>
                <View style={styles.trustBadge}>
                  <View style={[styles.trustBadgeIcon, { backgroundColor: isDark ? colors.dark.success.muted : colors.success[50] }]}>
                    <Ionicons name="shield-checkmark" size={16} color={isDark ? colors.dark.success.default : colors.success[500]} />
                  </View>
                  <Text style={[styles.trustBadgeText, { color: isDark ? colors.dark.text.primary : colors.neutral[700] }]}>{t('landing.gdprApproved')}</Text>
                </View>
                <View style={[styles.trustBadgeDivider, { backgroundColor: isDark ? colors.dark.border.default : colors.neutral[200] }]} />
                <View style={styles.trustBadge}>
                  <View style={[styles.trustBadgeIcon, { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50] }]}>
                    <Ionicons name="lock-closed" size={16} color={isDark ? colors.dark.primary.default : colors.primary[500]} />
                  </View>
                  <Text style={[styles.trustBadgeText, { color: isDark ? colors.dark.text.primary : colors.neutral[700] }]}>{t('landing.secureStorage')}</Text>
                </View>
              </View>
            </Animated.View>
          </LinearGradient>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          {/* Bakgrunns-bobler for features */}
          <FloatingBubble size={isSmallScreen ? 100 : 140} initialX={-40} initialY={50} duration={5500} delay={200} color="blue" isDark={isDark} screenWidth={width} />
          <FloatingBubble size={isSmallScreen ? 80 : 110} initialX={(w) => w - 60} initialY={150} duration={4800} delay={800} color="coral" isDark={isDark} screenWidth={width} />
          <FloatingBubble size={isSmallScreen ? 60 : 90} initialX={(w) => w / 2 - 30} initialY={280} duration={5200} delay={400} color="blue" isDark={isDark} screenWidth={width} />
          
          <View style={styles.featuresSectionHeader}>
            <Text style={[styles.featuresSectionTitle, { color: textColor }]}>{t('landing.featuresTitle')}</Text>
            <Text style={[styles.featuresSectionSubtitle, { color: subtextColor }]}>{t('landing.featuresSubtitle')}</Text>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <HoverButton 
                key={index} 
                style={[styles.featureCard, { 
                  backgroundColor: isDark ? colors.dark.surface.default : colors.white,
                  borderColor: isDark ? colors.dark.border.subtle : colors.neutral[100],
                  width: isLargeScreen ? '46%' : '100%',
                }]}
                hoverStyle={{
                  transform: [{ scale: 1.02 }, { translateY: -4 }],
                  shadowColor: isDark ? colors.primary[400] : colors.primary[500],
                  shadowOffset: { width: 0, height: 12 },
                  shadowOpacity: 0.15,
                  shadowRadius: 20,
                  borderColor: isDark ? colors.dark.primary.muted : colors.primary[200],
                }}
              >
                <View style={[styles.featureIcon, { backgroundColor: feature.bgColor }]}>
                  <Ionicons name={feature.icon} size={isSmallScreen ? 24 : 28} color={feature.color} />
                </View>
                <Text style={[styles.featureTitle, { color: textColor, fontSize: isSmallScreen ? 17 : 19 }]}>{feature.title}</Text>
                <Text style={[styles.featureDesc, { color: subtextColor }]}>{feature.description}</Text>
              </HoverButton>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={isDark 
              ? [colors.dark.primary.default, colors.primary[600], colors.primary[700]]
              : [colors.primary[500], colors.primary[600], colors.primary[700]]
            }
            style={styles.ctaCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <FloatingBubble size={isSmallScreen ? 140 : 180} initialX={-50} initialY={-50} duration={6000} delay={0} color="blue" isDark={isDark} screenWidth={width} />
            <FloatingBubble size={isSmallScreen ? 90 : 120} initialX={(w) => w - (isSmallScreen ? 100 : 140)} initialY={-20} duration={5000} delay={500} color="blue" isDark={isDark} screenWidth={width} />
            <FloatingBubble size={isSmallScreen ? 70 : 100} initialX={30} initialY={120} duration={5500} delay={300} color="coral" isDark={isDark} screenWidth={width} />
            <FloatingBubble size={isSmallScreen ? 50 : 70} initialX={(w) => w - 80} initialY={100} duration={4500} delay={700} color="coral" isDark={isDark} screenWidth={width} />
            
            <View style={styles.ctaCardContent}>
              <Text style={styles.ctaCardTitle}>{t('landing.ctaTitle')}</Text>
              <Text style={styles.ctaCardSubtitle}>{t('landing.ctaSubtitle')}</Text>
              <HoverButton 
                style={styles.ctaCardButton}
                hoverStyle={{
                  transform: [{ scale: 1.05 }],
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.2,
                  shadowRadius: 12,
                }}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.ctaCardButtonText}>{t('landing.loginNow')}</Text>
                <Ionicons name="arrow-forward" size={18} color={colors.primary[600]} />
              </HoverButton>
            </View>
          </LinearGradient>
        </View>

        {/* Footer med bobler */}
        <View style={[styles.footerWrapper, { backgroundColor: isDark ? colors.dark.bg.secondary : colors.neutral[50] }]}>
          <FloatingBubble size={isSmallScreen ? 80 : 120} initialX={-30} initialY={-20} duration={6500} delay={100} color="blue" isDark={isDark} screenWidth={width} />
          <FloatingBubble size={isSmallScreen ? 60 : 90} initialX={(w) => w - 50} initialY={10} duration={5800} delay={600} color="coral" isDark={isDark} screenWidth={width} />
          <FloatingBubble size={isSmallScreen ? 50 : 70} initialX={(w) => w / 3} initialY={30} duration={5200} delay={900} color="blue" isDark={isDark} screenWidth={width} />
          
          <View style={[styles.footer, { borderTopColor: isDark ? colors.dark.border.subtle : colors.neutral[100] }]}>
            <View style={styles.footerLogo}>
              <SmallLogo size={32} />
              <Text style={[styles.footerTitle, { color: isDark ? colors.dark.primary.default : colors.primary[600] }]}>Henteklar</Text>
            </View>
            <Text style={[styles.footerText, { color: isDark ? colors.dark.text.muted : colors.neutral[400] }]}>{t('landing.copyright')}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.languageModal, { backgroundColor: isDark ? colors.dark.surface.overlay : colors.white }]}>
            <View style={styles.languageModalHeader}>
              <Text style={[styles.languageModalTitle, { color: textColor }]}>Velg språk / Select language</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={subtextColor} />
              </TouchableOpacity>
            </View>
            
            {LANGUAGES.map((lang) => (
              <HoverButton
                key={lang.code}
                style={[
                  styles.languageOption,
                  { borderColor: isDark ? colors.dark.border.default : colors.neutral[100] },
                  i18n.language === lang.code && { 
                    backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50],
                    borderColor: isDark ? colors.dark.primary.default : colors.primary[500],
                  }
                ]}
                hoverStyle={{
                  backgroundColor: isDark ? colors.dark.bg.tertiary : colors.neutral[50],
                  transform: [{ scale: 1.01 }],
                }}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <View style={styles.languageFlagContainer}>
                  <FlagIcon countryCode={lang.countryCode} size={24} />
                </View>
                <Text style={[styles.languageName, { color: textColor }]}>{lang.name}</Text>
                {i18n.language === lang.code && (
                  <Ionicons name="checkmark-circle" size={20} color={isDark ? colors.dark.primary.default : colors.primary[600]} />
                )}
              </HoverButton>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    zIndex: 10,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
  },
  languageFlagContainer: {
    width: 28,
    height: 20,
    borderRadius: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  heroSection: {
    marginBottom: 48,
  },
  heroGradient: {
    paddingVertical: 48,
    position: 'relative',
    overflow: 'hidden',
    minHeight: 520,
  },
  floatingBubble: {
    position: 'absolute',
    overflow: 'hidden',
  },
  bubbleGradient: {
    flex: 1,
  },
  heroContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    zIndex: 10,
  },
  mascotContainer: {
    position: 'relative',
    marginBottom: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mascotGlow: {
    position: 'absolute',
  },
  mascotGlowInner: {
    position: 'absolute',
  },
  tagline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 28,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
  },
  taglineText: {
    fontSize: 14,
    fontWeight: '600',
  },
  heroTitle: {
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  heroHighlight: {
    // Color applied inline
  },
  heroSubtitle: {
    fontSize: 17,
    textAlign: 'center',
    maxWidth: 480,
    lineHeight: 26,
    marginBottom: 36,
    paddingHorizontal: 16,
  },
  primaryCta: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: 36,
  },
  primaryCtaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingLeft: 32,
    paddingRight: 8,
    paddingVertical: 8,
  },
  primaryCtaText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.white,
  },
  ctaIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trustBadgeIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustBadgeDivider: {
    width: 1,
    height: 24,
  },
  trustBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 48,
    position: 'relative',
    overflow: 'hidden',
  },
  featuresSectionHeader: {
    alignItems: 'center',
    marginBottom: 36,
    zIndex: 10,
  },
  featuresSectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  featuresSectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 400,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20,
    zIndex: 10,
  },
  featureCard: {
    maxWidth: 360,
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 16,
    elevation: 2,
  },
  featureIcon: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  featureTitle: {
    fontSize: 19,
    fontWeight: '700',
    marginBottom: 10,
  },
  featureDesc: {
    fontSize: 15,
    lineHeight: 24,
  },
  ctaSection: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  ctaCard: {
    borderRadius: 32,
    padding: 48,
    overflow: 'hidden',
    position: 'relative',
  },
  ctaCardContent: {
    alignItems: 'center',
    zIndex: 10,
  },
  ctaCardTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  ctaCardSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  ctaCardButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  ctaCardButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.primary[600],
  },
  footerWrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderTopWidth: 1,
    zIndex: 10,
  },
  footerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  footerText: {
    fontSize: 13,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  languageModal: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  languageModalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
  },
  languageName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default LandingScreen;

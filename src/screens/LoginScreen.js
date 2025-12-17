import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { requestPasswordReset } from '../data/api';
import { colors } from '../theme';
import { Logo } from '../components/Logo';

// Language options
const LANGUAGES = [
  { code: 'nb', name: 'Norsk', countryCode: 'NO' },
  { code: 'en', name: 'English', countryCode: 'GB' },
  { code: 'ar', name: 'Arabic', countryCode: 'SA' },
  { code: 'pl', name: 'Polski', countryCode: 'PL' },
  { code: 'so', name: 'Soomaali', countryCode: 'SO' },
  { code: 'ur', name: 'Urdu', countryCode: 'PK' },
];

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

// Animert flytende boble-komponent
const FloatingBubble = ({ size, initialX, initialY, duration, delay, screenWidth }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  const adjustedX = typeof initialX === 'function' ? initialX(screenWidth) : initialX;

  useEffect(() => {
    const animateY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -20,
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
          toValue: 10,
          duration: duration * 1.2,
          useNativeDriver: true,
          delay: delay + 300,
        }),
        Animated.timing(translateX, {
          toValue: -10,
          duration: duration * 1.2,
          useNativeDriver: true,
        }),
      ])
    );

    const animateScale = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: duration * 0.9,
          useNativeDriver: true,
          delay: delay + 200,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: duration * 0.9,
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

  return (
    <Animated.View
      style={{
        position: 'absolute',
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: 'rgba(255, 255, 255, 0.12)',
        left: adjustedX,
        top: initialY,
        transform: [{ translateY }, { translateX }, { scale }],
      }}
    />
  );
};

const LoginScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { login } = useAuth();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  // Use dynamic dimensions
  const { width, height } = useWindowDimensions();
  const isLargeScreen = width > 1024;
  const isMediumScreen = width > 768;
  const isSmallScreen = width < 380;
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(null);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginLoading, setLoginLoading] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Forgot password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  const resolvedLanguage = (i18n.resolvedLanguage || i18n.language || 'nb').split('-')[0];
  const currentLanguage = LANGUAGES.find(l => l.code === resolvedLanguage) || LANGUAGES[0];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('loginPage.fillAllFields'));
      return;
    }
    setError('');
    setLoginLoading(true);
    
    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || t('loginPage.loginError'));
      setLoginLoading(false);
    }
    // Ved suksess vil onAuthStateChanged håndtere navigasjonen
  };

  const handleForgotPassword = async () => {
    if (!resetEmail || !resetEmail.includes('@')) {
      Alert.alert(t('loginPage.error'), t('loginPage.invalidEmail'));
      return;
    }
    
    setResetLoading(true);
    try {
      await requestPasswordReset(resetEmail);
      setResetSent(true);
    } catch (error) {
      Alert.alert(t('loginPage.error'), error.message || t('loginPage.resetError'));
    } finally {
      setResetLoading(false);
    }
  };

  const closeForgotModal = () => {
    setShowForgotModal(false);
    setResetEmail('');
    setResetSent(false);
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguageModal(false);
  };

  // Theme colors - Profesjonell dark mode
  const bgColor = isDark ? colors.dark.bg.primary : colors.neutral[50];
  const cardBg = isDark ? colors.dark.surface.default : colors.white;
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const inputBg = isDark ? colors.dark.bg.tertiary : colors.neutral[50];
  const inputBorder = isDark ? colors.dark.border.default : colors.neutral[200];

  // Left panel for large screens
  const renderLeftPanel = () => (
    <LinearGradient
      colors={[colors.primary[400], colors.primary[500], colors.primary[600]]}
      style={styles.leftPanel}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={styles.leftContent}>
        <Animated.View style={[styles.logoSection, { opacity: fadeAnim }]}>
          <View style={styles.logoCircle}>
            <Logo size={100} />
          </View>
        </Animated.View>
        
        <Animated.View style={[styles.welcomeSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.welcomeTitle}>{t('loginPage.welcomeBack')}</Text>
          <Text style={styles.welcomeSubtitle}>
            {t('loginPage.welcomeSubtitle')}
          </Text>
        </Animated.View>

        <Animated.View style={[styles.featuresSection, { opacity: fadeAnim }]}>
          {[
            { icon: 'flash', text: t('loginPage.quickCheckIn') },
            { icon: 'shield-checkmark', text: t('loginPage.secureAndSafe') },
            { icon: 'people', text: t('loginPage.fullOverview') },
            { icon: 'notifications', text: t('loginPage.realtimeNotifications') },
          ].map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <Ionicons name={feature.icon} size={18} color={colors.white} />
              </View>
              <Text style={styles.featureText}>{feature.text}</Text>
            </View>
          ))}
        </Animated.View>

        <Animated.View style={[styles.testimonialCard, { opacity: fadeAnim }]}>
          <Text style={styles.testimonialText}>
            {t('loginPage.testimonial')}
          </Text>
          <View style={styles.testimonialAuthor}>
            <View style={styles.testimonialAvatar}>
              <Text style={styles.testimonialAvatarText}>MK</Text>
            </View>
            <View>
              <Text style={styles.testimonialName}>{t('loginPage.testimonialAuthor')}</Text>
              <Text style={styles.testimonialRole}>{t('loginPage.testimonialRole')}</Text>
            </View>
          </View>
        </Animated.View>
      </View>

      {/* Animerte bobler */}
      <FloatingBubble size={180} initialX={-60} initialY={-40} duration={5000} delay={0} screenWidth={width} />
      <FloatingBubble size={120} initialX={(w) => w * 0.35 - 60} initialY={height * 0.15} duration={4500} delay={500} screenWidth={width} />
      <FloatingBubble size={90} initialX={(w) => w * 0.35 - 100} initialY={height * 0.6} duration={4000} delay={300} screenWidth={width} />
      <FloatingBubble size={150} initialX={-40} initialY={height * 0.7} duration={5500} delay={800} screenWidth={width} />
      <FloatingBubble size={70} initialX={(w) => w * 0.35 - 50} initialY={height * 0.4} duration={3800} delay={200} screenWidth={width} />
      <FloatingBubble size={100} initialX={20} initialY={height * 0.45} duration={4200} delay={600} screenWidth={width} />
    </LinearGradient>
  );

  // Login form
  const renderForm = () => (
    <Animated.View 
      style={[
        styles.formContent, 
        { 
          backgroundColor: cardBg,
          opacity: fadeAnim, 
          transform: [{ translateY: slideAnim }] 
        }
      ]}
    >
      {/* Top row */}
      <View style={styles.formTopRow}>
        <TouchableOpacity 
          style={styles.backToLandingButton}
          onPress={() => navigation.navigate('Landing')}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={20} color={colors.primary[500]} />
          <Text style={styles.backToLandingText}>{t('loginPage.backToLanding')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.languageToggle,
            { backgroundColor: isDark ? colors.dark.bg.tertiary : colors.neutral[100] },
          ]}
          onPress={() => setShowLanguageModal(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('settings.language') || 'Language'}
        >
          <FlagIcon countryCode={currentLanguage.countryCode} size={18} />
          {!isSmallScreen && (
            <Ionicons name="chevron-down" size={14} color={subtextColor} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.formHeader}>
        <Text style={[styles.formTitle, { color: textColor }]}>{t('loginPage.loginTitle')}</Text>
        <Text style={[styles.formSubtitle, { color: subtextColor }]}>
          {t('loginPage.loginSubtitle')}
        </Text>
      </View>

      {error ? (
        <View style={[styles.errorContainer, { backgroundColor: isDark ? colors.red[900] : colors.red[50] }]}>
          <Ionicons name="alert-circle" size={18} color={colors.red[isDark ? 400 : 600]} />
          <Text style={[styles.errorText, { color: colors.red[isDark ? 400 : 600] }]}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('loginPage.email')}</Text>
        <View style={[
          styles.inputWrapper,
          { backgroundColor: inputBg, borderColor: focused === 'email' ? colors.primary[500] : inputBorder },
          focused === 'email' && styles.inputWrapperFocused,
        ]}>
          <Ionicons 
            name="mail-outline" 
            size={20} 
            color={focused === 'email' ? colors.primary[500] : colors.neutral[400]} 
          />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder={t('loginPage.emailPlaceholder')}
            placeholderTextColor={colors.neutral[400]}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() => setFocused('email')}
            onBlur={() => setFocused(null)}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.inputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('loginPage.password')}</Text>
        <View style={[
          styles.inputWrapper,
          { backgroundColor: inputBg, borderColor: focused === 'password' ? colors.primary[500] : inputBorder },
          focused === 'password' && styles.inputWrapperFocused,
        ]}>
          <Ionicons 
            name="lock-closed-outline" 
            size={20} 
            color={focused === 'password' ? colors.primary[500] : colors.neutral[400]} 
          />
          <TextInput
            style={[styles.input, { color: textColor }]}
            placeholder="••••••••"
            placeholderTextColor={colors.neutral[400]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setFocused('password')}
            onBlur={() => setFocused(null)}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
            <Ionicons 
              name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
              size={20} 
              color={colors.neutral[400]} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.optionsRow}>
        <TouchableOpacity style={styles.rememberMe} onPress={() => setRememberMe(!rememberMe)} activeOpacity={0.7}>
          <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
            {rememberMe && <Ionicons name="checkmark" size={14} color={colors.white} />}
          </View>
          <Text style={[styles.rememberText, { color: subtextColor }]}>{t('loginPage.rememberMe')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowForgotModal(true)}>
          <Text style={styles.forgotText}>{t('loginPage.forgotPassword')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.loginButton, loginLoading && styles.loginButtonDisabled]}
        onPress={handleLogin}
        disabled={loginLoading}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary[500], colors.primary[600]]}
          style={styles.loginButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          {loginLoading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <>
              <Text style={styles.loginButtonText}>{t('loginPage.login')}</Text>
              <Ionicons name="arrow-forward" size={20} color={colors.white} />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={[styles.dividerLine, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />
        <Text style={[styles.dividerText, { color: colors.neutral[400] }]}>{t('loginPage.or')}</Text>
        <View style={[styles.dividerLine, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[200] }]} />
      </View>

      <View style={styles.socialButtons}>
        <TouchableOpacity style={[styles.socialButton, { borderColor: isDark ? colors.neutral[600] : colors.neutral[200], backgroundColor: cardBg }]}>
          <Ionicons name="logo-microsoft" size={20} color="#00A4EF" />
          <Text style={[styles.socialButtonText, { color: textColor }]}>Microsoft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.socialButton, { borderColor: isDark ? colors.neutral[600] : colors.neutral[200], backgroundColor: cardBg }]}>
          <Ionicons name="logo-google" size={20} color="#DB4437" />
          <Text style={[styles.socialButtonText, { color: textColor }]}>Google</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.helpSection}>
        <Text style={[styles.helpText, { color: subtextColor }]}>{t('loginPage.loginProblems')}</Text>
        <TouchableOpacity>
          <Text style={styles.helpLink}>{t('loginPage.contactKindergarten')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {isLargeScreen ? (
        // Desktop layout - split view
        <View style={styles.splitContainer}>
          {renderLeftPanel()}
          <View style={styles.rightPanel}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.formContainer}
            >
              {renderForm()}
            </KeyboardAvoidingView>
          </View>
        </View>
      ) : (
        // Mobile/tablet layout - single column
        <ScrollView 
          contentContainerStyle={[styles.mobileContainer, { paddingTop: insets.top + 20 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.mobileContent}
          >
            {/* Mobile header with logo */}
            <Animated.View style={[styles.mobileHeader, { opacity: fadeAnim }]}>
              <View style={[styles.mobileLogoCircle, { backgroundColor: isDark ? colors.primary[900] : colors.primary[50] }]}>
                <Logo size={64} />
              </View>
              <Text style={[styles.mobileTitle, { color: colors.primary[isDark ? 400 : 600] }]}>Henteklar</Text>
              <Text style={[styles.mobileSubtitle, { color: subtextColor }]}>
                Sikker innsjekking for barnehager
              </Text>
            </Animated.View>

            {renderForm()}

            <View style={[styles.mobileFooter, { paddingBottom: insets.bottom + 20 }]}>
              <Text style={[styles.footerText, { color: colors.neutral[400] }]}>
                © 2025 Henteklar. Alle rettigheter reservert.
              </Text>
            </View>
          </KeyboardAvoidingView>
        </ScrollView>
      )}

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        animationType="fade"
        transparent={true}
        onRequestClose={closeForgotModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <TouchableOpacity style={styles.modalClose} onPress={closeForgotModal}>
              <Ionicons name="close" size={24} color={subtextColor} />
            </TouchableOpacity>

            {resetSent ? (
              // Success state
              <View style={styles.modalSuccessContent}>
                <View style={styles.successIconContainer}>
                  <Ionicons name="checkmark-circle" size={64} color={colors.success[500]} />
                </View>
                <Text style={[styles.modalTitle, { color: textColor }]}>{t('loginPage.resetSent')}</Text>
                <Text style={[styles.modalSubtitle, { color: subtextColor }]}>
                  {t('loginPage.resetSentDesc')}
                </Text>
                <TouchableOpacity
                  style={styles.modalSuccessButton}
                  onPress={closeForgotModal}
                  activeOpacity={0.8}
                >
                  <Text style={styles.modalSuccessButtonText}>{t('loginPage.backToLogin')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              // Form state
              <>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="lock-open-outline" size={40} color={colors.primary[500]} />
                </View>
                <Text style={[styles.modalTitle, { color: textColor }]}>{t('loginPage.resetPassword')}</Text>
                <Text style={[styles.modalSubtitle, { color: subtextColor }]}>
                  {t('loginPage.resetPasswordDesc')}
                </Text>

                <View style={styles.modalInputGroup}>
                  <Text style={[styles.modalInputLabel, { color: isDark ? colors.neutral[300] : colors.neutral[700] }]}>{t('loginPage.email')}</Text>
                  <View style={[
                    styles.modalInputWrapper,
                    { backgroundColor: inputBg, borderColor: inputBorder },
                  ]}>
                    <Ionicons name="mail-outline" size={20} color={colors.neutral[400]} />
                    <TextInput
                      style={[styles.modalInput, { color: textColor }]}
                      placeholder={t('loginPage.emailPlaceholder')}
                      placeholderTextColor={colors.neutral[400]}
                      value={resetEmail}
                      onChangeText={setResetEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalButton, resetLoading && styles.modalButtonDisabled]}
                  onPress={handleForgotPassword}
                  disabled={resetLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={[colors.primary[500], colors.primary[600]]}
                    style={styles.modalButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    {resetLoading ? (
                      <ActivityIndicator color={colors.white} />
                    ) : (
                      <>
                        <Text style={styles.modalButtonText}>{t('loginPage.sendResetLink')}</Text>
                        <Ionicons name="send" size={18} color={colors.white} />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalBackLink} onPress={closeForgotModal}>
                  <Ionicons name="arrow-back" size={16} color={colors.primary[500]} />
                  <Text style={styles.modalBackLinkText}>{t('loginPage.backToLogin')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Language Modal */}
      <Modal
        visible={showLanguageModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <TouchableOpacity
          style={styles.languageModalOverlay}
          activeOpacity={1}
          onPress={() => setShowLanguageModal(false)}
        >
          <View style={[styles.languageModal, { backgroundColor: cardBg }]}>
            <View style={styles.languageModalHeader}>
              <Text style={[styles.languageModalTitle, { color: textColor }]}>{t('settings.language') || 'Language'}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={22} color={subtextColor} />
              </TouchableOpacity>
            </View>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.languageOption,
                  resolvedLanguage === lang.code && {
                    borderColor: colors.primary[500],
                    backgroundColor: colors.primary[50],
                  },
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <View style={styles.languageFlagContainer}>
                  <FlagIcon countryCode={lang.countryCode} size={22} />
                </View>
                <Text style={[styles.languageName, { color: textColor }]}>{lang.name}</Text>
                {resolvedLanguage === lang.code && (
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary[500]} />
                )}
              </TouchableOpacity>
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
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  // Left panel (desktop only)
  leftPanel: {
    width: '45%',
    minWidth: 400,
    maxWidth: 550,
    padding: 48,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  leftContent: {
    zIndex: 1,
  },
  logoSection: {
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  welcomeSection: {
    marginBottom: 36,
  },
  welcomeTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 12,
  },
  welcomeSubtitle: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 26,
    maxWidth: 380,
  },
  featuresSection: {
    gap: 16,
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    color: colors.white,
    fontWeight: '500',
  },
  testimonialCard: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  testimonialText: {
    fontSize: 15,
    color: colors.white,
    fontStyle: 'italic',
    lineHeight: 24,
    marginBottom: 20,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  testimonialAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  testimonialAvatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  testimonialName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  testimonialRole: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
  decorCircle: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  decorCircle1: {
    width: 250,
    height: 250,
    top: -80,
    right: -80,
  },
  decorCircle2: {
    width: 180,
    height: 180,
    bottom: 80,
    right: -40,
  },
  decorCircle3: {
    width: 120,
    height: 120,
    bottom: -30,
    left: 40,
  },
  // Right panel (desktop)
  rightPanel: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  // Mobile layout
  mobileContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
  },
  mobileContent: {
    flex: 1,
    justifyContent: 'center',
  },
  mobileHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mobileLogoCircle: {
    width: 100,
    height: 100,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mobileTitle: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 8,
  },
  mobileSubtitle: {
    fontSize: 15,
    textAlign: 'center',
  },
  mobileFooter: {
    marginTop: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
  },
  // Form styles
  formContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 28,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 32,
    elevation: 10,
  },
  formTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  backToLandingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
  },
  backToLandingText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '500',
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 10,
  },
  formHeader: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 54,
    gap: 12,
  },
  inputWrapperFocused: {
    shadowColor: colors.primary[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  rememberText: {
    fontSize: 14,
  },
  forgotText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 20,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
  },
  loginButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
  },
  socialButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  helpSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  helpText: {
    fontSize: 14,
  },
  helpLink: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.25,
    shadowRadius: 40,
    elevation: 20,
  },
  modalClose: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  modalInputGroup: {
    marginBottom: 24,
  },
  modalInputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  modalInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 16,
    height: 54,
    gap: 12,
  },
  modalInput: {
    flex: 1,
    fontSize: 16,
  },
  modalButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 16,
  },
  modalButtonDisabled: {
    opacity: 0.7,
  },
  modalButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 54,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
  modalBackLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  modalBackLinkText: {
    fontSize: 14,
    color: colors.primary[500],
    fontWeight: '600',
  },
  modalSuccessContent: {
    alignItems: 'center',
    paddingTop: 16,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  modalNote: {
    fontSize: 13,
    textAlign: 'center',
    fontStyle: 'italic',
    marginBottom: 24,
  },
  modalSuccessButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  modalSuccessButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  languageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  languageModal: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 10,
  },
  languageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  languageModalTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
    marginBottom: 8,
  },
  languageFlagContainer: {
    width: 30,
    height: 20,
    borderRadius: 3,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default LoginScreen;

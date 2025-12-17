/**
 * @fileoverview MyChildScreen - Dedikert skjerm for foreldre
 * Viser kun foreldrenes egne barn med full oversikt og hurtighandlinger
 * @module screens/MyChildScreen
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Image,
  Animated,
  useWindowDimensions,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Path, G, Defs, LinearGradient as SvgGradient, Stop, Ellipse } from 'react-native-svg';
import { getChildrenForParent, checkInChild, checkOutChild, getSettings } from '../data/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar, Card } from '../components';
import { colors } from '../theme';

/** Minimum touch target for tilgjengelighet (WCAG 2.1) */
const MIN_TOUCH_TARGET = 44;
const useNativeDriver = Platform.OS !== 'web';

/**
 * Animert boble-komponent for bakgrunnsdekorasjon
 */
const FloatingBubble = ({ size, initialX, initialY, duration, delay, color = 'white', isDark = false }) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animateY = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: -15,
          duration: duration,
          useNativeDriver,
          delay: delay,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: duration,
          useNativeDriver,
        }),
      ])
    );

    const animateScale = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: duration * 0.8,
          useNativeDriver,
          delay: delay + 200,
        }),
        Animated.timing(scale, {
          toValue: 0.95,
          duration: duration * 0.8,
          useNativeDriver,
        }),
      ])
    );

    animateY.start();
    animateScale.start();

    return () => {
      animateY.stop();
      animateScale.stop();
    };
  }, []);

  // Velg farge basert på dark mode
  const getBubbleColor = () => {
    if (isDark) {
      return color === 'white' ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)';
    }
    return color === 'white' ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.08)';
  };

  return (
    <Animated.View
      style={[
        styles.floatingBubble,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: initialX,
          top: initialY,
          backgroundColor: getBubbleColor(),
          transform: [{ translateY }, { scale }],
        },
      ]}
    />
  );
};

/**
 * Twinkle stjerne for dark mode
 */
const TwinkleStar = ({ x, y, size = 3, delay = 0 }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 1500,
          useNativeDriver,
          delay: delay,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 1500,
          useNativeDriver,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#fff',
        opacity,
      }}
    />
  );
};

/**
 * Familie-illustrasjon SVG
 */
const FamilyIllustration = ({ size = 120 }) => {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 2000,
          useNativeDriver,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY: bounceAnim }] }}>
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <SvgGradient id="heartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="#FF6B6B" />
            <Stop offset="100%" stopColor="#EE5A5A" />
          </SvgGradient>
          <SvgGradient id="circleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor="rgba(255,255,255,0.3)" />
            <Stop offset="100%" stopColor="rgba(255,255,255,0.1)" />
          </SvgGradient>
        </Defs>
        
        {/* Bakgrunns-sirkel */}
        <Circle cx="60" cy="60" r="55" fill="url(#circleGrad)" />
        
        {/* Hjerte */}
        <Path 
          d="M60 95 C60 95 25 65 25 45 C25 30 40 20 60 40 C80 20 95 30 95 45 C95 65 60 95 60 95Z" 
          fill="url(#heartGrad)"
        />
        
        {/* Voksen figur */}
        <Circle cx="50" cy="52" r="10" fill="#FFE0C8" />
        <Ellipse cx="50" cy="72" rx="8" ry="12" fill="#5B7FFA" />
        
        {/* Barn figur */}
        <Circle cx="70" cy="58" r="8" fill="#FFE0C8" />
        <Ellipse cx="70" cy="74" rx="6" ry="10" fill="#10B981" />
        
        {/* Smil på voksen */}
        <Path d="M46 54 Q50 58 54 54" stroke="#E85A4F" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Smil på barn */}
        <Path d="M67 60 Q70 63 73 60" stroke="#E85A4F" strokeWidth="2" fill="none" strokeLinecap="round" />
        
        {/* Øyne */}
        <Circle cx="47" cy="50" r="1.5" fill="#2D3748" />
        <Circle cx="53" cy="50" r="1.5" fill="#2D3748" />
        <Circle cx="68" cy="56" r="1.5" fill="#2D3748" />
        <Circle cx="72" cy="56" r="1.5" fill="#2D3748" />
        
        {/* Gnister rundt */}
        <Circle cx="30" cy="35" r="3" fill="#FFD93D" opacity="0.8" />
        <Circle cx="90" cy="40" r="2" fill="#FFD93D" opacity="0.8" />
        <Circle cx="85" cy="85" r="2.5" fill="#FFD93D" opacity="0.8" />
        <Circle cx="35" cy="80" r="2" fill="#FFD93D" opacity="0.8" />
      </Svg>
    </Animated.View>
  );
};

/**
 * MyChildScreen - Hovedskjerm for foreldre
 * Viser oversikt over egne barn med status og hurtighandlinger
 * @param {Object} props - Komponentprops
 * @param {Object} props.navigation - React Navigation objekt
 */
const MyChildScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 380;
  
  const [children, setChildren] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null); // Holder styr på hvilken knapp som laster

  // Theme colors
  const bgColor = isDark ? colors.dark.bg.primary : colors.neutral[50];
  const cardBg = isDark ? colors.dark.surface.default : colors.white;
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const borderColor = isDark ? colors.dark.border.default : colors.neutral[100];
  const actionsBg = isDark ? colors.dark.bg.tertiary : colors.neutral[50];

  // Laster barn ved oppstart
  useEffect(() => {
    loadMyChildren();
  }, []);

  /**
   * Henter forelderens barn fra Firebase
   * Bruker RBAC til å filtrere kun egne barn
   */
  const loadMyChildren = async () => {
    try {
      console.log('👨‍👩‍👧 MyChildScreen: Henter barn for', user?.email);
      const [myChildren, settingsData] = await Promise.all([
        getChildrenForParent(user?.email),
        getSettings(),
      ]);
      setChildren(myChildren);
      setSettings(settingsData);
      console.log('✅ Fant', myChildren.length, 'barn');
    } catch (error) {
      console.error('❌ Feil ved henting av barn:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Håndterer pull-to-refresh
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadMyChildren();
  };

  /**
   * Sjekker inn et barn
   * @param {Object} child - Barnobjekt
   */
  const handleCheckIn = async (child) => {
    setActionLoading(`checkin-${child.id}`);
    try {
      console.log('🔄 Sjekker inn barn:', child.name, child.id);
      await checkInChild(child.id, user?.name);
      console.log('✅ Innsjekking vellykket');
      await loadMyChildren(); // Oppdater listen
    } catch (error) {
      console.error('❌ Feil ved innsjekking:', error);
      alert(`Kunne ikke sjekke inn ${child.name}. Feil: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Sjekker ut et barn
   * @param {Object} child - Barnobjekt
   */
  const handleCheckOut = async (child) => {
    setActionLoading(`checkout-${child.id}`);
    try {
      console.log('🔄 Sjekker ut barn:', child.name, child.id);
      await checkOutChild(child.id, user?.name);
      console.log('✅ Utsjekking vellykket');
      await loadMyChildren();
    } catch (error) {
      console.error('❌ Feil ved utsjekking:', error);
      alert(`Kunne ikke sjekke ut ${child.name}. Feil: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  /**
   * Åpner e-postklient for å kontakte barnehagen
   * @param {string} email - E-postadresse
   */
  const handleContact = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  /**
   * Formaterer dagens dato
   * @returns {string} Formatert dato
   */
  const getFormattedDate = () => {
    const locale = i18n.language === 'nb' ? 'nb-NO' : i18n.language === 'en' ? 'en-US' : i18n.language;
    return new Date().toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  };

  /**
   * Rendrer et barnekort med status og handlinger
   * @param {Object} child - Barnobjekt
   */
  const renderChildCard = (child) => (
    <Card key={child.id} style={styles.childCard}>
      {/* Header med barn-info */}
      <TouchableOpacity
        style={styles.childHeader}
        onPress={() => navigation.navigate('ChildProfile', { id: child.id })}
        accessibilityRole="button"
        accessibilityLabel={`${t('myChild.profile')} ${child.name}`}
      >
        <View style={styles.childAvatarContainer}>
          <Avatar
            initials={child.avatar}
            size="xlarge"
            variant={child.isCheckedIn ? 'success' : 'neutral'}
          />
          {/* Status-indikator */}
          <View style={[
            styles.statusIndicator,
            { borderColor: cardBg },
            child.isCheckedIn ? styles.statusIndicatorActive : styles.statusIndicatorInactive
          ]} />
        </View>
        
        <View style={styles.childInfo}>
          <Text style={[styles.childName, { color: textColor }]}>{child.name}</Text>
          <Text style={[styles.childMeta, { color: subtextColor }]}>
            {child.age} {t('myChild.years')} • {child.group}
          </Text>
          
          {/* Status-badge */}
          <View style={[
            styles.statusBadge,
            child.isCheckedIn 
              ? { backgroundColor: isDark ? colors.dark.success.muted : colors.success[50] }
              : { backgroundColor: isDark ? colors.dark.bg.tertiary : colors.neutral[100] }
          ]}>
            <Ionicons
              name={child.isCheckedIn ? 'checkmark-circle' : 'home'}
              size={16}
              color={child.isCheckedIn 
                ? (isDark ? colors.dark.success.default : colors.success[600])
                : subtextColor}
            />
            <Text style={[
              styles.statusText,
              child.isCheckedIn 
                ? { color: isDark ? colors.dark.success.default : colors.success[700] }
                : { color: subtextColor }
            ]}>
              {child.isCheckedIn 
                ? `${t('myChild.inKindergarten')} ${child.checkedInAt}` 
                : `${t('myChild.pickedUp')} ${child.checkedOutAt || ''}`}
            </Text>
          </View>
        </View>
        
        <Ionicons name="chevron-forward" size={24} color={subtextColor} />
      </TouchableOpacity>

      {/* Hurtighandlinger */}
      <View style={[styles.actionsContainer, { backgroundColor: actionsBg, borderTopColor: borderColor }]}>
        <Text style={[styles.actionsTitle, { color: subtextColor }]}>{t('myChild.quickActions')}</Text>
        
        <View style={styles.actionButtons}>
          {/* Sjekk inn/ut knapp */}
          {child.isCheckedIn ? (
            <TouchableOpacity
              style={[styles.actionButton, styles.checkOutButton, { 
                backgroundColor: isDark ? colors.dark.surface.default : colors.white,
                borderColor: isDark ? colors.dark.danger.default : colors.red[200],
                opacity: actionLoading === `checkout-${child.id}` ? 0.7 : 1
              }]}
              onPress={() => handleCheckOut(child)}
              disabled={actionLoading === `checkout-${child.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${t('myChild.checkOut')} ${child.name}`}
            >
              {actionLoading === `checkout-${child.id}` ? (
                <ActivityIndicator size="small" color={isDark ? colors.dark.danger.default : colors.red[600]} />
              ) : (
                <Ionicons name="log-out-outline" size={20} color={isDark ? colors.dark.danger.default : colors.red[600]} />
              )}
              <Text style={[styles.checkOutButtonText, { color: isDark ? colors.dark.danger.default : colors.red[600] }]}>
                {actionLoading === `checkout-${child.id}` ? 'Sjekker ut...' : t('myChild.checkOut')}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.actionButton, styles.checkInButton, {
                opacity: actionLoading === `checkin-${child.id}` ? 0.7 : 1
              }]}
              onPress={() => handleCheckIn(child)}
              disabled={actionLoading === `checkin-${child.id}`}
              accessibilityRole="button"
              accessibilityLabel={`${t('myChild.checkIn')} ${child.name}`}
            >
              {actionLoading === `checkin-${child.id}` ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="log-in-outline" size={20} color={colors.white} />
              )}
              <Text style={styles.checkInButtonText}>
                {actionLoading === `checkin-${child.id}` ? 'Sjekker inn...' : t('myChild.checkIn')}
              </Text>
            </TouchableOpacity>
          )}

          {/* Se profil knapp */}
          <TouchableOpacity
            style={[styles.actionButton, styles.profileButton, {
              backgroundColor: isDark ? colors.dark.surface.default : colors.white,
              borderColor: isDark ? colors.dark.primary.default : colors.primary[200]
            }]}
            onPress={() => navigation.navigate('ChildProfile', { id: child.id })}
            accessibilityRole="button"
            accessibilityLabel={`${t('myChild.profile')} ${child.name}`}
          >
            <Ionicons name="person-outline" size={20} color={isDark ? colors.dark.primary.default : colors.primary[600]} />
            <Text style={[styles.profileButtonText, { color: isDark ? colors.dark.primary.default : colors.primary[600] }]}>
              {t('myChild.profile')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Kontaktinfo for andre foresatte */}
      {child.parents && child.parents.length > 1 && (
        <View style={[styles.otherParentsContainer, { borderTopColor: borderColor }]}>
          <Text style={[styles.otherParentsTitle, { color: subtextColor }]}>{t('myChild.otherGuardians')}</Text>
          {child.parents
            .filter(p => p.email !== user?.email)
            .map((parent, index) => (
              <TouchableOpacity
                key={index}
                style={styles.parentItem}
                onPress={() => handleContact(parent.email)}
                accessibilityRole="button"
                accessibilityLabel={`Contact ${parent.name}`}
              >
                <View style={styles.parentInfo}>
                  <Text style={[styles.parentName, { color: textColor }]}>{parent.name}</Text>
                  <Text style={[styles.parentRelation, { color: subtextColor }]}>{parent.relation}</Text>
                </View>
                <Ionicons name="mail-outline" size={20} color={isDark ? colors.dark.primary.default : colors.primary[500]} />
              </TouchableOpacity>
            ))}
        </View>
      )}
    </Card>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgColor }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary[500]]}
          tintColor={colors.primary[500]}
        />
      }
    >
      {/* Hero Header med gradient */}
      <View style={styles.heroWrapper}>
        <LinearGradient
          colors={isDark 
            ? ['#1a1a2e', '#16213e', '#0f3460']
            : [colors.primary[400], colors.primary[500], colors.primary[600]]
          }
          style={styles.heroGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Animerte bobler i bakgrunnen */}
          <FloatingBubble size={isSmallScreen ? 80 : 100} initialX={-20} initialY={-20} duration={4000} delay={0} color="white" isDark={isDark} />
          <FloatingBubble size={isSmallScreen ? 60 : 80} initialX={width - 100} initialY={20} duration={3500} delay={500} color="light" isDark={isDark} />
          <FloatingBubble size={isSmallScreen ? 40 : 60} initialX={width / 2 - 30} initialY={-10} duration={4500} delay={200} color="white" isDark={isDark} />
          <FloatingBubble size={isSmallScreen ? 50 : 70} initialX={width - 60} initialY={100} duration={3800} delay={800} color="light" isDark={isDark} />
          
          {/* Twinkle-stjerner for dark mode */}
          {isDark && (
            <>
              <TwinkleStar x={40} y={25} size={2} delay={0} />
              <TwinkleStar x={width - 80} y={15} size={3} delay={400} />
              <TwinkleStar x={width / 3} y={40} size={2} delay={800} />
              <TwinkleStar x={width - 150} y={60} size={2.5} delay={200} />
              <TwinkleStar x={100} y={80} size={2} delay={600} />
              <TwinkleStar x={width - 40} y={90} size={3} delay={1000} />
              <TwinkleStar x={width / 2 + 50} y={30} size={2} delay={300} />
              <TwinkleStar x={70} y={120} size={2.5} delay={700} />
            </>
          )}
          
          <View style={styles.heroContent}>
            <View style={styles.heroTextSection}>
              <Text style={styles.heroGreeting}>
                {t('myChild.hello')}, {user?.name?.split(' ')[0]}!
              </Text>
              <Text style={styles.heroDate}>{getFormattedDate()}</Text>
              {settings?.kindergartenName && (
                <View style={styles.heroKindergartenRow}>
                  <Ionicons name="business" size={14} color="rgba(255,255,255,0.9)" />
                  <Text style={styles.heroKindergartenName}>{settings.kindergartenName}</Text>
                </View>
              )}
              
              <View style={styles.heroTitleRow}>
                <View style={styles.heroTitleBadge}>
                  <Ionicons name="heart" size={16} color={colors.white} />
                </View>
                <Text style={styles.heroTitle}>{t('myChild.title')}</Text>
              </View>
              
              <Text style={styles.heroSubtitle}>
                {children.length === 1 
                  ? t('myChild.overviewSingle')
                  : t('myChild.overviewMultiple', { count: children.length })}
              </Text>
            </View>
            
            {/* Illustrasjon */}
            <View style={styles.heroIllustration}>
              <FamilyIllustration size={isSmallScreen ? 100 : 120} />
            </View>
          </View>
          
          {/* Bølge-effekt i bunnen */}
          <View style={styles.heroWave}>
            <Svg width={width} height={40} viewBox={`0 0 ${width} 40`} preserveAspectRatio="none">
              <Path 
                d={`M0 20 Q${width * 0.25} 0 ${width * 0.5} 20 T${width} 20 L${width} 40 L0 40 Z`}
                fill={bgColor}
              />
            </Svg>
          </View>
        </LinearGradient>
      </View>

      {/* Stats kort */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <View style={[styles.statIconContainer, { backgroundColor: isDark ? colors.dark.success.muted : colors.success[50] }]}>
            <Ionicons name="checkmark-circle" size={20} color={isDark ? colors.dark.success.default : colors.success[500]} />
          </View>
          <Text style={[styles.statNumber, { color: isDark ? colors.dark.success.default : colors.success[600] }]}>
            {children.filter(c => c.isCheckedIn).length}
          </Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>I barnehagen</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <View style={[styles.statIconContainer, { backgroundColor: isDark ? colors.dark.bg.tertiary : colors.neutral[100] }]}>
            <Ionicons name="home" size={20} color={subtextColor} />
          </View>
          <Text style={[styles.statNumber, { color: textColor }]}>
            {children.filter(c => !c.isCheckedIn).length}
          </Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Hjemme</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <View style={[styles.statIconContainer, { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50] }]}>
            <Ionicons name="people" size={20} color={isDark ? colors.dark.primary.default : colors.primary[500]} />
          </View>
          <Text style={[styles.statNumber, { color: isDark ? colors.dark.primary.default : colors.primary[600] }]}>
            {children.length}
          </Text>
          <Text style={[styles.statLabel, { color: subtextColor }]}>Totalt</Text>
        </View>
      </View>

      {/* Barn-liste */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: subtextColor }]}>{t('loading')}</Text>
        </View>
      ) : children.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Ionicons name="information-circle-outline" size={48} color={subtextColor} />
          <Text style={[styles.emptyTitle, { color: textColor }]}>{t('myChild.noChildren')}</Text>
          <Text style={[styles.emptyText, { color: subtextColor }]}>
            {t('myChild.noChildrenDesc')}
          </Text>
        </Card>
      ) : (
        children.map(renderChildCard)
      )}

      {/* Informasjonsboks */}
      <Card style={[styles.infoCard, { 
        backgroundColor: isDark ? colors.dark.primary.subtle : colors.primary[50],
        borderColor: isDark ? colors.dark.primary.muted : colors.primary[100]
      }]}>
        <View style={styles.infoHeader}>
          <Ionicons name="information-circle" size={24} color={isDark ? colors.dark.primary.default : colors.primary[500]} />
          <Text style={[styles.infoTitle, { color: isDark ? colors.dark.primary.default : colors.primary[700] }]}>
            {t('myChild.tips')}
          </Text>
        </View>
        <Text style={[styles.infoText, { color: isDark ? colors.dark.text.secondary : colors.primary[700] }]}>
          {t('myChild.tipsText')}
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    paddingBottom: 40,
  },
  // Hero header styles
  heroWrapper: {
    marginBottom: 20,
  },
  heroGradient: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 60,
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  heroTextSection: {
    flex: 1,
    paddingRight: 10,
  },
  heroGreeting: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.white,
    marginBottom: 4,
  },
  heroDate: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  heroKindergartenRow: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.18)',
    marginBottom: 12,
  },
  heroKindergartenName: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.95)',
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  heroTitleBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
  },
  heroIllustration: {
    marginRight: -10,
  },
  heroWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  floatingBubble: {
    position: 'absolute',
  },
  // Stats row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 20,
    marginTop: -30,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  // Child cards - add horizontal padding
  childCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 0,
    overflow: 'hidden',
  },
  childHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
    minHeight: MIN_TOUCH_TARGET,
  },
  childAvatarContainer: {
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
  },
  statusIndicatorActive: {
    backgroundColor: colors.success[500],
  },
  statusIndicatorInactive: {
    backgroundColor: colors.neutral[400],
  },
  childInfo: {
    flex: 1,
  },
  childName: {
    fontSize: 18,
    fontWeight: '700',
  },
  childMeta: {
    fontSize: 14,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
  },
  actionsContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  actionsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: MIN_TOUCH_TARGET,
  },
  checkInButton: {
    backgroundColor: colors.success[500],
  },
  checkInButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  checkOutButton: {
    borderWidth: 2,
  },
  checkOutButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  profileButton: {
    borderWidth: 2,
  },
  profileButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  otherParentsContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  otherParentsTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  parentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    minHeight: MIN_TOUCH_TARGET,
  },
  parentInfo: {},
  parentName: {
    fontSize: 14,
    fontWeight: '600',
  },
  parentRelation: {
    fontSize: 12,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  loadingText: {
    fontSize: 16,
  },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    marginHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  infoCard: {
    marginTop: 8,
    marginHorizontal: 20,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default MyChildScreen;

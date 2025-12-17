/**
 * @fileoverview Hovednavigasjon for Henteklar-appen
 * Håndterer autentisering, rollebasert navigasjon og tilgjengelighet
 * @module navigation/AppNavigator
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, AccessibilityInfo, ScrollView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme';
import { Logo, LogoSmall } from '../components/Logo';
import {
  LandingScreen,
  LoginScreen,
  DashboardScreen,
  CheckInOutScreen,
  ChildProfileScreen,
  SettingsScreen,
} from '../screens';
import AddChildScreen from '../screens/AddChildScreen';
import EditChildScreen from '../screens/EditChildScreen';
import HistoryScreen from '../screens/HistoryScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MyChildScreen from '../screens/MyChildScreen';

const Stack = createNativeStackNavigator();
const { width } = Dimensions.get('window');
const isLargeScreen = width > 900;

/** Minimum touch target størrelse for tilgjengelighet (44x44px per WCAG) */
const MIN_TOUCH_TARGET = 44;

/**
 * CustomHeader - Toppmeny med rollebasert navigasjon
 * @param {Object} props - Komponentprops
 * @param {Object} props.navigation - React Navigation objekt
 * @param {string} props.currentRoute - Nåværende aktiv rute
 */
const CustomHeader = ({ navigation, currentRoute }) => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const insets = useSafeAreaInsets();

  // Dark mode colors
  const headerBg = isDark ? colors.dark.surface.default : colors.white;
  const headerBorder = isDark ? colors.dark.border.subtle : colors.neutral[100];
  const logoTextColor = isDark ? colors.dark.primary.default : colors.primary[600];
  const navBg = isDark ? colors.dark.bg.tertiary : colors.neutral[100];
  const navTextColor = isDark ? colors.dark.text.secondary : colors.neutral[600];
  const navIconColor = isDark ? colors.dark.text.muted : colors.neutral[500];
  const userBg = isDark ? colors.dark.bg.tertiary : colors.neutral[50];
  const userNameColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const userRoleColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const logoutBg = isDark ? 'rgba(248, 81, 73, 0.15)' : colors.red[50];
  const logoutBorder = isDark ? 'rgba(248, 81, 73, 0.3)' : colors.red[100];
  const themeToggleBg = isDark ? colors.dark.bg.tertiary : colors.neutral[100];

  /**
   * Genererer navigasjonselementer basert på brukerens rolle
   * Foreldre får "Mitt barn"-fane, ansatte/admin får full tilgang
   * @returns {Array} Liste med navigasjonselementer
   */
  const getNavItems = () => {
    // Basis-navigasjon for foreldre
    if (user?.role === 'parent') {
      return [
        { name: 'MyChild', label: t('nav.myChild') || 'Mitt barn', icon: 'heart-outline' },
        { name: 'Calendar', label: t('nav.calendar') || 'Kalender', icon: 'calendar-outline' },
        { name: 'History', label: t('nav.history'), icon: 'time-outline' },
        { name: 'Settings', label: t('nav.settings'), icon: 'settings-outline' },
      ];
    }
    
    // Full navigasjon for ansatte og admin
    return [
      { name: 'Dashboard', label: t('nav.overview'), icon: 'grid-outline' },
      { name: 'CheckInOut', label: t('nav.checkInOut'), icon: 'checkmark-circle-outline' },
      { name: 'Calendar', label: t('nav.calendar') || 'Kalender', icon: 'calendar-outline' },
      { name: 'History', label: t('nav.history'), icon: 'time-outline' },
      { name: 'Settings', label: t('nav.settings'), icon: 'settings-outline' },
    ];
  };

  const navItems = getNavItems();

  return (
    <View style={[styles.header, { paddingTop: insets.top, backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
      <View style={styles.headerContent}>
        {/* Logo - med accessibility */}
        <TouchableOpacity 
          style={styles.headerLogoContainer}
          onPress={() => navigation.navigate(user?.role === 'parent' ? 'MyChild' : 'Dashboard')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={t('nav.goToHome') || 'Gå til forsiden'}
          accessibilityHint="Trykk for å gå til hovedsiden"
        >
          <LogoSmall size={44} />
          <Text style={[styles.headerLogoText, { color: logoTextColor }]}>Henteklar</Text>
        </TouchableOpacity>

        {/* Top Navigation - med accessibility */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.topNav, { backgroundColor: navBg }]}
          style={styles.topNavScroll}
        >
          {navItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.navItem,
                currentRoute === item.name && styles.navItemActive,
              ]}
              onPress={() => navigation.navigate(item.name)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: currentRoute === item.name }}
              accessibilityLabel={item.label}
              accessibilityHint={`Naviger til ${item.label}`}
            >
              <Ionicons 
                name={item.icon} 
                size={20} 
                color={currentRoute === item.name ? colors.white : navIconColor} 
                style={styles.navItemIcon}
              />
              {isLargeScreen && (
                <Text
                  style={[
                    styles.navItemText,
                    { color: navTextColor },
                    currentRoute === item.name && styles.navItemTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* User & Logout - med accessibility */}
        <View style={styles.headerRight}>
          {/* Dark mode toggle */}
          <TouchableOpacity
            style={[styles.themeToggle, { backgroundColor: themeToggleBg }]}
            onPress={toggleTheme}
            activeOpacity={0.7}
            accessibilityRole="switch"
            accessibilityState={{ checked: isDark }}
            accessibilityLabel={isDark ? 'Bytt til lyst tema' : 'Bytt til mørkt tema'}
          >
            <Ionicons 
              name={isDark ? 'sunny' : 'moon'} 
              size={20} 
              color={isDark ? colors.dark.warning.default : colors.neutral[600]} 
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.userInfo, { backgroundColor: userBg }]} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Settings')}
            accessibilityRole="button"
            accessibilityLabel={`Bruker: ${user?.name}, rolle: ${user?.role === 'admin' ? 'Administrator' : user?.role === 'staff' ? 'Ansatt' : 'Forelder'}. Trykk for å åpne innstillinger.`}
            accessibilityHint="Trykk for å gå til innstillinger"
          >
            <LinearGradient
              colors={[colors.primary[400], colors.primary[600]]}
              style={styles.avatar}
            >
              <Text style={styles.avatarText}>{user?.avatar}</Text>
            </LinearGradient>
            {isLargeScreen && (
              <View style={styles.userText}>
                <Text style={[styles.userName, { color: userNameColor }]}>{user?.name}</Text>
                <Text style={[styles.userRole, { color: userRoleColor }]}>
                  {user?.role === 'admin' ? 'Administrator' : user?.role === 'staff' ? 'Ansatt' : 'Forelder'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: logoutBg, borderColor: logoutBorder }]}
            onPress={logout}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="Logg ut"
            accessibilityHint="Trykk for å logge ut av appen"
          >
            <Ionicons name="log-out-outline" size={20} color={isDark ? colors.dark.danger.default : colors.red[500]} />
            {isLargeScreen && (
              <Text style={[styles.logoutText, { color: isDark ? colors.dark.danger.default : colors.red[600] }]}>Logg ut</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

/**
 * MainScreen - Hovedcontainer med rollebasert navigasjon
 * Rendrer riktig skjerm basert på brukerrolle og valgt rute
 * @param {Object} props - Komponentprops
 */
const MainScreen = ({ navigation, route }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  // Sett standard rute basert på rolle
  const defaultRoute = user?.role === 'parent' ? 'MyChild' : 'Dashboard';
  const [currentRoute, setCurrentRoute] = useState(defaultRoute);

  // Dark mode background
  const mainBg = isDark ? colors.dark.bg.primary : colors.neutral[50];

  /**
   * Oppretter navigasjonsobjekt med tilpasset navigate-funksjon
   * @param {string} name - Rutenavn
   * @returns {Object} Navigasjonsobjekt
   */
  const createNavigation = (name) => ({
    ...navigation,
    navigate: (targetName, params) => {
      const mainRoutes = ['Dashboard', 'MyChild', 'CheckInOut', 'Calendar', 'History', 'Settings'];
      if (mainRoutes.includes(targetName)) {
        setCurrentRoute(targetName);
      } else {
        navigation.navigate(targetName, params);
      }
    },
  });

  /**
   * Rendrer riktig skjerm basert på currentRoute
   * @returns {React.Component} Skjermkomponent
   */
  const renderScreen = () => {
    switch (currentRoute) {
      case 'MyChild':
        return <MyChildScreen navigation={createNavigation('MyChild')} />;
      case 'Dashboard':
        return <DashboardScreen navigation={createNavigation('Dashboard')} />;
      case 'CheckInOut':
        return <CheckInOutScreen navigation={createNavigation('CheckInOut')} />;
      case 'Calendar':
        return <CalendarScreen navigation={createNavigation('Calendar')} />;
      case 'History':
        return <HistoryScreen navigation={createNavigation('History')} />;
      case 'Settings':
        return <SettingsScreen navigation={createNavigation('Settings')} />;
      default:
        return user?.role === 'parent' 
          ? <MyChildScreen navigation={createNavigation('MyChild')} />
          : <DashboardScreen navigation={createNavigation('Dashboard')} />;
    }
  };

  return (
    <View style={[styles.mainContainer, { backgroundColor: mainBg }]} accessibilityRole="main">
      <CustomHeader 
        navigation={{ navigate: setCurrentRoute }} 
        currentRoute={currentRoute} 
      />
      <View style={styles.screenContainer}>
        {renderScreen()}
      </View>
    </View>
  );
};

// Loading Screen
const LoadingScreen = () => (
  <LinearGradient
    colors={[colors.primary[50], colors.white]}
    style={styles.loadingContainer}
  >
    <View style={styles.loadingContent}>
      <View style={styles.loadingMascotContainer}>
        <View style={styles.loadingMascotGlow} />
        <Logo size={140} animated />
      </View>
      <Text style={styles.loadingText}>Henteklar</Text>
      <Text style={styles.loadingSubtext}>Laster inn...</Text>
    </View>
  </LinearGradient>
);

// Main App Navigator
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="Main" component={MainScreen} />
            <Stack.Screen
              name="ChildProfile"
              component={ChildProfileScreen}
              options={{
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="AddChild"
              component={AddChildScreen}
              options={{
                headerShown: true,
                headerTitle: 'Legg til barn',
                headerBackTitle: 'Tilbake',
                headerTintColor: colors.neutral[700],
                headerTitleStyle: {
                  fontWeight: '600',
                },
                headerStyle: {
                  backgroundColor: colors.neutral[50],
                },
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="EditChild"
              component={EditChildScreen}
              options={{
                headerShown: false,
              }}
            />
          </>
        ) : (
          <>
            <Stack.Screen name="Landing" component={LandingScreen} />
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  header: {
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  headerLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: MIN_TOUCH_TARGET,
    flexShrink: 0,
  },
  logoCircle: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMascot: {
    width: 32,
    height: 32,
  },
  headerLogoText: {
    fontSize: 22,
    fontWeight: '700',
    display: isLargeScreen ? 'flex' : 'none',
  },
  topNavScroll: {
    flexShrink: 1,
    flexGrow: 0,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderRadius: 14,
    padding: 5,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: isLargeScreen ? 18 : 10,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: 'center',
  },
  navItemActive: {
    backgroundColor: colors.primary[500],
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  navItemIcon: {
    opacity: 0.9,
  },
  navItemText: {
    fontSize: 14,
    fontWeight: '600',
  },
  navItemTextActive: {
    color: colors.white,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  themeToggle: {
    width: MIN_TOUCH_TARGET, // Tilgjengelighet: minimum 44px
    height: MIN_TOUCH_TARGET,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingRight: isLargeScreen ? 16 : 0,
    paddingLeft: 4,
    paddingVertical: 4,
    borderRadius: 28,
    minHeight: MIN_TOUCH_TARGET,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  userText: {},
  userName: {
    fontSize: 14,
    fontWeight: '600',
  },
  userRole: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12, // Økt for touch target
    borderRadius: 12,
    borderWidth: 1,
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
  },
  screenContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContent: {
    alignItems: 'center',
  },
  loadingMascotContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  loadingMascotGlow: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: colors.primary[200],
    opacity: 0.3,
    top: -20,
    left: -20,
  },
  loadingMascot: {
    width: 140,
    height: 140,
  },
  loadingText: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary[600],
    marginBottom: 8,
  },
  loadingSubtext: {
    fontSize: 16,
    color: colors.neutral[500],
  },
});

export default AppNavigator;

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  Image,
  RefreshControl,
  Platform,
  Animated,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getAllChildren, getSettings, getChildrenForParent } from '../data/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar, Badge, SkeletonList, SkeletonStats } from '../components';
import { colors } from '../theme';

// Pulserende status-indikator komponent
const PulsingDot = ({ isActive }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    if (isActive) {
      const pulse = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.4,
              duration: 1000,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0,
              duration: 1000,
              useNativeDriver: Platform.OS !== 'web',
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.6,
              duration: 1000,
              useNativeDriver: Platform.OS !== 'web',
            }),
          ]),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isActive]);

  if (!isActive) {
    return (
      <View style={[styles.statusDot, styles.statusDotInactive]} />
    );
  }

  return (
    <View style={styles.statusDotContainer}>
      <Animated.View
        style={[
          styles.statusDotPulse,
          {
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      />
      <View style={[styles.statusDot, styles.statusDotActive]} />
    </View>
  );
};

const DashboardScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [children, setChildren] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Use dynamic dimensions
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768;
  const isSmallScreen = width < 380;
  const numColumns = isLargeScreen ? 2 : 1;

  // Theme colors - Profesjonell dark mode
  const bgColor = isDark ? colors.dark.bg.primary : colors.neutral[50];
  const cardBg = isDark ? colors.dark.surface.default : colors.white;
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const inputBg = isDark ? colors.dark.bg.tertiary : colors.white;
  const inputBorder = isDark ? colors.dark.border.default : colors.neutral[200];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // RBAC: Foreldre ser kun sine egne barn, ansatte/admin ser alle
      let childrenData;
      if (user?.role === 'parent') {
        childrenData = await getChildrenForParent(user.email);
      } else {
        childrenData = await getAllChildren();
      }
      
      const settingsData = await getSettings();
      setChildren(childrenData);
      setSettings(settingsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const filteredChildren = children.filter((child) =>
    child.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const checkedInCount = children.filter((c) => c.isCheckedIn).length;
  const checkedOutCount = children.filter((c) => !c.isCheckedIn).length;

  const today = new Date().toLocaleDateString('nb-NO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const StatCard = ({ icon, label, value, color, gradient }) => (
    <LinearGradient
      colors={gradient}
      style={[styles.statCard, { flex: isLargeScreen ? 1 : undefined }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View style={[styles.statIconContainer, { width: isSmallScreen ? 40 : 48, height: isSmallScreen ? 40 : 48 }]}>
        <Ionicons name={icon} size={isSmallScreen ? 20 : 24} color={colors.white} />
      </View>
      <View style={styles.statInfo}>
        <Text style={[styles.statValue, { fontSize: isSmallScreen ? 24 : 28 }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </LinearGradient>
  );

  const ChildCard = ({ child }) => (
    <TouchableOpacity
      style={[styles.childCard, { backgroundColor: cardBg }]}
      onPress={() => navigation.navigate('ChildProfile', { id: child.id })}
      activeOpacity={0.7}
    >
      <View style={styles.childCardInner}>
        <View style={styles.childCardHeader}>
          <Avatar
            initials={child.avatar}
            size="large"
            variant={child.isCheckedIn ? 'success' : 'neutral'}
          />
          <PulsingDot isActive={child.isCheckedIn} />
        </View>
        
        <View style={styles.childCardBody}>
          <Text style={[styles.childName, { color: textColor }]} numberOfLines={1}>{child.name}</Text>
          <Text style={[styles.childMeta, { color: subtextColor }]}>{child.age} {t('dashboard.years')} • {child.group}</Text>
          
          <View style={styles.childStatus}>
            {child.isCheckedIn ? (
              <View style={[styles.statusTagActive, { backgroundColor: isDark ? colors.success[900] : colors.success[50] }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.success[isDark ? 400 : 600]} />
                <Text style={[styles.statusTextActive, { color: colors.success[isDark ? 400 : 700] }]}>
                  Inne {child.checkedInAt}
                </Text>
              </View>
            ) : (
              <View style={[styles.statusTagInactive, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
                <Ionicons name="exit-outline" size={14} color={subtextColor} />
                <Text style={[styles.statusTextInactive, { color: subtextColor }]}>
                  Hentet {child.checkedOutAt}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.childCardArrow}>
        <Ionicons name="chevron-forward" size={20} color={isDark ? colors.neutral[600] : colors.neutral[300]} />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      {/* Welcome section */}
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeLeft}>
          <Text style={[styles.welcomeGreeting, { color: textColor }]}>
            Hei, {user?.name?.split(' ')[0]}
          </Text>
          <Text style={[styles.welcomeDate, { color: subtextColor }]}>{today}</Text>
        </View>
        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddChild')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={styles.addButtonText}>Nytt barn</Text>
        </TouchableOpacity>
      </View>

      {/* Kindergarten info */}
      {settings && (
        <View style={[styles.kindergartenCard, { backgroundColor: cardBg }]}>
          <View style={styles.kindergartenContent}>
            <View style={[styles.kindergartenLogo, { backgroundColor: isDark ? colors.primary[900] : colors.primary[50] }]}>
              {settings.kindergartenLogo ? (
                <Image
                  source={{ uri: settings.kindergartenLogo }}
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              ) : (
                <Ionicons name="business" size={28} color={colors.primary[500]} />
              )}
            </View>
            <View style={styles.kindergartenInfo}>
              <Text style={[styles.kindergartenName, { color: textColor }]}>{settings.kindergartenName}</Text>
              <View style={styles.kindergartenMeta}>
                <Ionicons name="time-outline" size={14} color={subtextColor} />
                <Text style={[styles.kindergartenHours, { color: subtextColor }]}>
                  {settings.openingHours?.open} - {settings.openingHours?.close}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Stats */}
      {loading ? (
        <SkeletonStats />
      ) : (
        <View style={[styles.statsContainer, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
          <StatCard
            icon="people"
            label={t('dashboard.totalChildren')}
            value={children.length}
            color="blue"
            gradient={[colors.primary[400], colors.primary[600]]}
          />
          <StatCard
            icon="checkmark-circle"
            label={t('dashboard.checkedIn')}
            value={checkedInCount}
            color="green"
            gradient={[colors.success[400], colors.success[600]]}
          />
          <StatCard
            icon="home"
            label={t('dashboard.checkedOut')}
            value={checkedOutCount}
            color="orange"
            gradient={['#f59e0b', '#d97706']}
          />
        </View>
      )}

      {/* Search & title */}
      <View style={styles.listHeaderContainer}>
        <View style={styles.listHeaderTop}>
          <Text style={[styles.listTitle, { color: textColor }]}>{t('dashboard.allChildren')}</Text>
          <Text style={[styles.listCount, { color: subtextColor }]}>{filteredChildren.length} barn</Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Search bar - outside FlatList to prevent focus loss */}
      <View style={[styles.searchWrapper, { backgroundColor: bgColor }]}>
        <View style={[styles.searchContainer, { backgroundColor: inputBg, borderColor: inputBorder }]}>
          <Ionicons name="search" size={20} color={subtextColor} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder={t('dashboard.searchChildren')}
            placeholderTextColor={subtextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={subtextColor} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredChildren}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        key={numColumns}
        ListHeaderComponent={renderHeader}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item, index }) => (
          <View style={[
            styles.childCardWrapper,
            numColumns > 1 && index % 2 === 0 && { paddingRight: 8 },
            numColumns > 1 && index % 2 === 1 && { paddingLeft: 8 },
          ]}>
            <ChildCard child={item} />
          </View>
        )}
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingHorizontal: 24 }}>
              <SkeletonList count={4} />
            </View>
          ) : (
            <View style={[styles.emptyContainer, { backgroundColor: cardBg }]}>
              <View style={[styles.emptyIcon, { backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100] }]}>
                <Ionicons name="people-outline" size={48} color={isDark ? colors.neutral[500] : colors.neutral[300]} />
              </View>
              <Text style={[styles.emptyTitle, { color: textColor }]}>Ingen barn funnet</Text>
              <Text style={[styles.emptyText, { color: subtextColor }]}>
                {searchQuery ? 'Prøv et annet søkeord' : 'Legg til barn for å komme i gang'}
              </Text>
            </View>
          )
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    width: '100%',
    overflow: 'hidden',
  },
  listContent: {
    paddingBottom: 32,
  },
  headerContainer: {
    padding: 24,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeLeft: {},
  welcomeGreeting: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  welcomeDate: {
    fontSize: 15,
    color: colors.neutral[500],
    marginTop: 4,
    textTransform: 'capitalize',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.white,
  },
  kindergartenCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  kindergartenContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  kindergartenLogo: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  kindergartenInfo: {
    flex: 1,
  },
  kindergartenName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  kindergartenMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  kindergartenHours: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  statsContainer: {
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    gap: 14,
  },
  statIconContainer: {
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statInfo: {},
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.white,
  },
  statLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  listHeaderContainer: {
    marginBottom: 8,
  },
  listHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  listCount: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 14,
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  searchWrapper: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.neutral[800],
  },
  childCardWrapper: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 6,
  },
  childCard: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  childCardInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  childCardHeader: {
    position: 'relative',
  },
  statusDotContainer: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusDotPulse: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.success[400],
  },
  statusDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: colors.white,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  statusDotActive: {
    backgroundColor: colors.success[500],
  },
  statusDotInactive: {
    backgroundColor: colors.neutral[400],
  },
  childCardBody: {
    flex: 1,
  },
  childName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  childMeta: {
    fontSize: 13,
    color: colors.neutral[500],
    marginTop: 2,
  },
  childStatus: {
    marginTop: 10,
  },
  statusTagActive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success[50],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusTextActive: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.success[700],
  },
  statusTagInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  statusTextInactive: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.neutral[600],
  },
  childCardArrow: {
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 48,
    marginHorizontal: 24,
    backgroundColor: colors.white,
    borderRadius: 20,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.neutral[800],
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: colors.neutral[500],
    textAlign: 'center',
  },
});

export default DashboardScreen;

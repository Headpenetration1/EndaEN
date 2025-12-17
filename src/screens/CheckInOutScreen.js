import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { getAllChildren, checkInChild, checkOutChild, getChildrenForParent } from '../data/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar } from '../components';
import { colors } from '../theme';

const CheckInOutScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [children, setChildren] = useState([]);
  const [recentAction, setRecentAction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Use dynamic dimensions
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 900;
  const isSmallScreen = width < 380;

  // Theme colors
  const bgColor = isDark ? colors.dark.bg.primary : colors.neutral[50];
  const cardBg = isDark ? colors.dark.surface.default : colors.white;
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const borderColor = isDark ? colors.dark.border.default : colors.neutral[200];
  const childCardBg = isDark ? colors.dark.bg.tertiary : colors.neutral[50];

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (recentAction) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(2500),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setRecentAction(null));
    }
  }, [recentAction]);

  const loadChildren = async () => {
    try {
      // RBAC: Foreldre ser kun sine egne barn
      let data;
      if (user?.role === 'parent') {
        data = await getChildrenForParent(user.email);
      } else {
        data = await getAllChildren();
      }
      setChildren(data);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (child) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setActionLoading(`checkin-${child.id}`);
    try {
      console.log('🔄 Sjekker inn barn:', child.name, child.id);
      await checkInChild(child.id, user?.name);
      console.log('✅ Innsjekking vellykket');
      setRecentAction({
        childName: child.name,
        action: 'inn',
        time: timeString,
      });
      await loadChildren();
    } catch (error) {
      console.error('❌ Error checking in:', error);
      alert(`Kunne ikke sjekke inn ${child.name}. Feil: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCheckOut = async (child) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
    });

    setActionLoading(`checkout-${child.id}`);
    try {
      console.log('🔄 Sjekker ut barn:', child.name, child.id);
      await checkOutChild(child.id, user?.name);
      console.log('✅ Utsjekking vellykket');
      setRecentAction({
        childName: child.name,
        action: 'ut',
        time: timeString,
      });
      await loadChildren();
    } catch (error) {
      console.error('❌ Error checking out:', error);
      alert(`Kunne ikke sjekke ut ${child.name}. Feil: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const notCheckedIn = children.filter((c) => !c.isCheckedIn);
  const checkedIn = children.filter((c) => c.isCheckedIn);

  const renderChildItem = ({ item, isCheckedInList }) => (
    <View style={[styles.childCard, { backgroundColor: childCardBg }]}>
      <View style={styles.childInfo}>
        <Avatar
          initials={item.avatar}
          size="medium"
          variant={isCheckedInList ? 'success' : 'neutral'}
        />
        <View style={styles.childDetails}>
          <Text style={[styles.childName, { color: textColor }]}>{item.name}</Text>
          <Text style={[styles.childMeta, { color: subtextColor }]}>
            {item.age} år • {item.group}
          </Text>
        </View>
      </View>
      
      {isCheckedInList ? (
        <View style={styles.checkInInfo}>
          <View style={[styles.timeTag, { backgroundColor: isDark ? colors.dark.success.muted : colors.success[50] }]}>
            <Ionicons name="time-outline" size={14} color={isDark ? colors.dark.success.default : colors.success[600]} />
            <Text style={[styles.timeText, { color: isDark ? colors.dark.success.default : colors.success[700] }]}>{item.checkedInAt}</Text>
          </View>
          <TouchableOpacity
            style={[styles.checkOutButton, { 
              borderColor: isDark ? colors.dark.border.default : colors.neutral[200],
              backgroundColor: isDark ? colors.dark.bg.tertiary : colors.white,
              opacity: actionLoading === `checkout-${item.id}` ? 0.7 : 1
            }]}
            onPress={() => handleCheckOut(item)}
            disabled={actionLoading === `checkout-${item.id}`}
            activeOpacity={0.7}
          >
            {actionLoading === `checkout-${item.id}` ? (
              <ActivityIndicator size="small" color={isDark ? colors.dark.text.secondary : colors.neutral[600]} />
            ) : (
              <Text style={[styles.checkOutButtonText, { color: isDark ? colors.dark.text.secondary : colors.neutral[600] }]}>Sjekk ut</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          style={[styles.checkInButton, {
            opacity: actionLoading === `checkin-${item.id}` ? 0.7 : 1
          }]}
          onPress={() => handleCheckIn(item)}
          disabled={actionLoading === `checkin-${item.id}`}
          activeOpacity={0.7}
        >
          {actionLoading === `checkin-${item.id}` ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <>
              <Ionicons name="log-in-outline" size={18} color={colors.white} />
              <Text style={styles.checkInButtonText}>Sjekk inn</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  const renderList = (data, title, subtitle, isCheckedInList, emptyIcon, emptyText) => (
    <View style={[styles.listContainer, isLargeScreen && styles.listContainerLarge, { backgroundColor: cardBg }]}>
      <View style={[
        styles.listHeader,
        isCheckedInList 
          ? { backgroundColor: isDark ? colors.dark.success.muted : colors.success[50], borderBottomColor: isDark ? colors.dark.border.subtle : colors.success[100] }
          : { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50], borderBottomColor: isDark ? colors.dark.border.subtle : colors.primary[100] }
      ]}>
        <View style={styles.listHeaderLeft}>
          <View style={[
            styles.listHeaderIcon,
            isCheckedInList 
              ? { backgroundColor: isDark ? colors.dark.success.muted : colors.success[100] }
              : { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[100] },
            isSmallScreen && { width: 36, height: 36 }
          ]}>
            <Ionicons 
              name={isCheckedInList ? 'checkmark-circle' : 'log-in'} 
              size={isSmallScreen ? 16 : 20} 
              color={isCheckedInList 
                ? (isDark ? colors.dark.success.default : colors.success[600])
                : (isDark ? colors.dark.primary.default : colors.primary[600])} 
            />
          </View>
          <View>
            <Text style={[styles.listTitle, { color: textColor, fontSize: isSmallScreen ? 16 : 18 }]}>{title}</Text>
            <Text style={[styles.listSubtitle, { color: subtextColor }]}>{subtitle}</Text>
          </View>
        </View>
        <View style={[
          styles.countBadge,
          isCheckedInList 
            ? { backgroundColor: isDark ? colors.dark.success.muted : colors.success[100] }
            : { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[100] },
          isSmallScreen && { width: 34, height: 34 }
        ]}>
          <Text style={[
            styles.countText,
            isCheckedInList 
              ? { color: isDark ? colors.dark.success.default : colors.success[700] }
              : { color: isDark ? colors.dark.primary.default : colors.primary[700] },
            isSmallScreen && { fontSize: 14 }
          ]}>
            {data.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => renderChildItem({ item, isCheckedInList })}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? colors.dark.bg.tertiary : colors.neutral[100] }]}>
              <Ionicons name={emptyIcon} size={32} color={isDark ? colors.dark.text.muted : colors.neutral[300]} />
            </View>
            <Text style={[styles.emptyText, { color: subtextColor }]}>{emptyText}</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { flexDirection: isLargeScreen ? 'row' : 'column', alignItems: isLargeScreen ? 'center' : 'flex-start' }]}>
        <View>
          <Text style={[styles.title, { color: textColor, fontSize: isSmallScreen ? 24 : 28 }]}>{t('checkInOut.title')}</Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>{t('checkInOut.subtitle')}</Text>
        </View>
        
        <View style={styles.statsRow}>
          <View style={[styles.statBadge, { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50] }]}>
            <Ionicons name="people" size={isSmallScreen ? 14 : 16} color={isDark ? colors.dark.primary.default : colors.primary[600]} />
            <Text style={[styles.statText, { color: isDark ? colors.dark.primary.default : colors.primary[700] }]}>
              {children.length} totalt
            </Text>
          </View>
          <View style={[styles.statBadge, { backgroundColor: isDark ? colors.dark.success.muted : colors.success[50] }]}>
            <Ionicons name="checkmark-circle" size={isSmallScreen ? 14 : 16} color={isDark ? colors.dark.success.default : colors.success[600]} />
            <Text style={[styles.statText, { color: isDark ? colors.dark.success.default : colors.success[700] }]}>
              {checkedIn.length} inne
            </Text>
          </View>
        </View>
      </View>

      {/* Success toast */}
      {recentAction && (
        <Animated.View style={[styles.toast, { opacity: fadeAnim }]}>
          <View style={styles.toastIcon}>
            <Ionicons name="checkmark" size={18} color={colors.white} />
          </View>
          <Text style={styles.toastText}>
            <Text style={styles.toastBold}>{recentAction.childName}</Text>
            {' '}ble sjekket {recentAction.action} kl. {recentAction.time}
          </Text>
        </Animated.View>
      )}

      {/* Split view */}
      <View style={[styles.splitContainer, { flexDirection: isLargeScreen ? 'row' : 'column' }]}>
        {renderList(
          notCheckedIn,
          'Sjekk inn',
          `${notCheckedIn.length} venter`,
          false,
          'log-in-outline',
          'Alle barn er sjekket inn!'
        )}
        {renderList(
          checkedIn,
          'Inne nå',
          `${checkedIn.length} barn`,
          true,
          'checkmark-circle-outline',
          'Ingen barn er sjekket inn'
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    justifyContent: 'space-between',
    padding: 24,
    paddingBottom: 16,
    gap: 16,
  },
  title: {
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success[600],
    marginHorizontal: 24,
    marginBottom: 16,
    padding: 14,
    borderRadius: 12,
    gap: 12,
    shadowColor: colors.success[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  toastIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastText: {
    flex: 1,
    fontSize: 14,
    color: colors.white,
  },
  toastBold: {
    fontWeight: '700',
  },
  splitContainer: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
    paddingBottom: 24,
  },
  listContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  listContainerLarge: {
    maxWidth: '50%',
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
  },
  listHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  listHeaderIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  listSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  countBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 16,
    fontWeight: '700',
  },
  listContent: {
    padding: 12,
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  childInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  childDetails: {
    flex: 1,
  },
  childName: {
    fontSize: 15,
    fontWeight: '600',
  },
  childMeta: {
    fontSize: 13,
    marginTop: 2,
  },
  checkInInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  timeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  checkInButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success[500],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: colors.success[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  checkInButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  checkOutButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 2,
  },
  checkOutButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CheckInOutScreen;

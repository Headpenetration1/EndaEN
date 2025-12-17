import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getChildById, getCheckInOutLogs, checkInChild, checkOutChild } from '../data/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Avatar, Button } from '../components';
import { colors } from '../theme';

const { width } = Dimensions.get('window');
const isLargeScreen = width > 768;

const ChildProfileScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { id } = route.params;
  const [child, setChild] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const bgColor = isDark ? colors.dark.bg.primary : colors.neutral[50];
  const cardBg = isDark ? colors.dark.surface.default : colors.white;
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const borderColor = isDark ? colors.dark.border.subtle : colors.neutral[100];
  const mutedBg = isDark ? colors.dark.bg.tertiary : colors.neutral[100];
  const primaryTint = isDark ? colors.dark.primary.default : colors.primary[600];
  const primaryMuted = isDark ? colors.dark.primary.muted : colors.primary[50];
  const successTint = isDark ? colors.dark.success.default : colors.success[600];
  const successMuted = isDark ? colors.dark.success.muted : colors.success[50];
  const dangerTint = isDark ? colors.dark.danger.default : colors.red[600];
  const dangerMuted = isDark ? colors.dark.danger.muted : colors.red[50];
  const accentTint = colors.accent[500];
  const accentMuted = isDark ? colors.dark.danger.muted : colors.accent[50];
  const checkedInGradient = isDark
    ? [colors.dark.success.muted, colors.dark.success.default]
    : [colors.success[400], colors.success[500]];
  const checkedOutGradient = isDark
    ? [colors.dark.bg.tertiary, colors.dark.bg.secondary]
    : [colors.neutral[300], colors.neutral[400]];

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      const [childData, logsData] = await Promise.all([
        getChildById(id),
        getCheckInOutLogs({ childId: id, limit: 20 }),
      ]);
      setChild(childData);
      setLogs(logsData);
    } catch (error) {
      console.error('Error loading child data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer, { backgroundColor: bgColor }]}>
        <Text style={[styles.loadingText, { color: subtextColor }]}>{t('loading')}</Text>
      </View>
    );
  }

  if (!child) {
    return (
      <View style={[styles.container, { backgroundColor: bgColor }]}>
        <View style={[styles.errorCard, { backgroundColor: cardBg, borderColor: borderColor, borderWidth: isDark ? 1 : 0 }]}>
          <Ionicons name="alert-circle-outline" size={48} color={isDark ? colors.dark.text.muted : colors.neutral[300]} />
          <Text style={[styles.errorText, { color: subtextColor }]}>{t('childProfile.notFound')}</Text>
          <TouchableOpacity style={styles.backButtonLarge} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonLargeText}>{t('childProfile.backToOverview')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const toggleCheckIn = async () => {
    try {
      if (child.isCheckedIn) {
        await checkOutChild(id, user?.name);
      } else {
        await checkInChild(id, user?.name);
      }
      loadData();
    } catch (error) {
      Alert.alert('Feil', 'Kunne ikke oppdatere status');
    }
  };

  const handleCall = (phone) => {
    Linking.openURL(`tel:${phone.replace(/\s/g, '')}`);
  };

  const handleEmail = (email, parentName) => {
    const subject = encodeURIComponent(`Angående ${child.name}`);
    Linking.openURL(`mailto:${email}?subject=${subject}`);
  };

  const handleSMS = (phone, parentName) => {
    const body = encodeURIComponent(`Hei ${parentName}, dette gjelder ${child.name}.`);
    Linking.openURL(`sms:${phone.replace(/\s/g, '')}?body=${body}`);
  };

  const formatLogTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('nb-NO', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.content, { backgroundColor: bgColor }]}>
        {/* Header with back and edit buttons */}
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={subtextColor} />
            <Text style={[styles.backButtonText, { color: subtextColor }]}>Tilbake</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editButton, { backgroundColor: primaryMuted }]} 
            onPress={() => navigation.navigate('EditChild', { childId: child.id })}
          >
            <Ionicons name="create-outline" size={20} color={primaryTint} />
            <Text style={[styles.editButtonText, { color: primaryTint }]}>Rediger</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Header Card */}
        <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: isDark ? borderColor : 'transparent', borderWidth: isDark ? 1 : 0 }]}>
          <LinearGradient
            colors={child.isCheckedIn 
              ? checkedInGradient
              : checkedOutGradient
            }
            style={styles.profileHeader}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.avatarContainer}>
              <Avatar initials={child.avatar} size="xlarge" />
              <View style={[
                styles.statusIndicator,
                { borderColor: isDark ? colors.dark.bg.primary : colors.white },
                child.isCheckedIn
                  ? { backgroundColor: isDark ? colors.dark.success.default : colors.success[500] }
                  : { backgroundColor: isDark ? colors.dark.text.muted : colors.neutral[400] }
              ]}>
                <Ionicons 
                  name={child.isCheckedIn ? "checkmark" : "close"} 
                  size={14} 
                  color={colors.white} 
                />
              </View>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{child.name}</Text>
              <Text style={styles.profileMeta}>
                {child.age} år • {child.group}
              </Text>
              
              <View style={styles.statusBadge}>
                <Ionicons 
                  name={child.isCheckedIn ? "time-outline" : "exit-outline"} 
                  size={14} 
                  color={colors.white} 
                />
                <Text style={styles.statusBadgeText}>
                  {child.isCheckedIn 
                    ? `Inne siden ${child.checkedInAt}` 
                    : `Hentet ${child.checkedOutAt}`
                  }
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Action Button */}
          <View style={[styles.actionSection, { borderTopColor: borderColor }]}>
            <TouchableOpacity
              style={[
                styles.checkButton,
                child.isCheckedIn ? styles.checkOutButton : styles.checkInButton
              ]}
              onPress={toggleCheckIn}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={child.isCheckedIn ? "log-out-outline" : "log-in-outline"} 
                size={22} 
                color={colors.white} 
              />
              <Text style={styles.checkButtonText}>
                {child.isCheckedIn ? 'Sjekk ut' : 'Sjekk inn'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Information */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: borderColor, borderWidth: isDark ? 1 : 0 }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: borderColor }]}>
            <View style={[styles.sectionIconContainer, { backgroundColor: primaryMuted }]}>
              <Ionicons name="people" size={20} color={primaryTint} />
            </View>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Kontaktinformasjon</Text>
          </View>

          {child.parents && child.parents.map((parent, index) => (
            <View 
              key={parent.id} 
              style={[
                styles.parentCard,
                index < child.parents.length - 1 && [styles.parentCardBorder, { borderBottomColor: borderColor }]
              ]}
            >
              <View style={styles.parentHeader}>
                <View style={[styles.parentAvatar, { backgroundColor: primaryMuted }]}>
                  <Text style={[styles.parentAvatarText, { color: primaryTint }]}>
                    {parent.name.split(' ').map((n) => n[0]).join('').toUpperCase()}
                  </Text>
                </View>
                <View style={styles.parentInfo}>
                  <View style={styles.parentNameRow}>
                    <Text style={[styles.parentName, { color: textColor }]}>{parent.name}</Text>
                    {parent.isPrimary && (
                      <View style={[styles.primaryBadge, { backgroundColor: isDark ? colors.amber[700] : colors.amber[100] }]}>
                        <Ionicons name="star" size={10} color={isDark ? colors.dark.bg.primary : colors.amber[700]} />
                        <Text style={[styles.primaryBadgeText, { color: isDark ? colors.dark.bg.primary : colors.amber[700] }]}>Primær</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.parentRelation, { color: subtextColor }]}>{parent.relation}</Text>
                </View>
              </View>

              {/* Contact buttons */}
              <View style={styles.contactButtons}>
                <TouchableOpacity 
                  style={[styles.contactButton, styles.callButton, { backgroundColor: successMuted, borderColor: isDark ? colors.dark.success.default : colors.success[200] }]}
                  onPress={() => handleCall(parent.phone)}
                >
                  <Ionicons name="call" size={18} color={successTint} />
                  <Text style={[styles.callButtonText, { color: successTint }]}>Ring</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.contactButton, styles.emailButton, { backgroundColor: primaryMuted, borderColor: isDark ? colors.dark.primary.default : colors.primary[200] }]}
                  onPress={() => handleEmail(parent.email, parent.name)}
                >
                  <Ionicons name="mail" size={18} color={primaryTint} />
                  <Text style={[styles.emailButtonText, { color: primaryTint }]}>Send e-post</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.contactButton, styles.smsButton, { backgroundColor: accentMuted, borderColor: isDark ? colors.dark.danger.default : colors.accent[200] }]}
                  onPress={() => handleSMS(parent.phone, parent.name)}
                >
                  <Ionicons name="chatbubble" size={18} color={accentTint} />
                  <Text style={[styles.smsButtonText, { color: accentTint }]}>SMS</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Activity Log */}
        <View style={[styles.sectionCard, { backgroundColor: cardBg, borderColor: borderColor, borderWidth: isDark ? 1 : 0 }]}>
          <View style={[styles.sectionHeader, { borderBottomColor: borderColor }]}>
            <View style={[styles.sectionIconContainer, { backgroundColor: primaryMuted }]}>
              <Ionicons name="time" size={20} color={primaryTint} />
            </View>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Aktivitetslogg</Text>
            <Text style={[styles.sectionCount, { color: subtextColor }]}>{logs.length} hendelser</Text>
          </View>

          {logs.length === 0 ? (
            <View style={styles.emptyLogs}>
              <Ionicons name="document-text-outline" size={32} color={isDark ? colors.dark.text.muted : colors.neutral[300]} />
              <Text style={[styles.emptyLogsText, { color: subtextColor }]}>Ingen aktivitet registrert ennå</Text>
            </View>
          ) : (
            <View style={styles.logsContainer}>
              {logs.slice(0, 10).map((log, index) => (
                <View 
                  key={log.id} 
                  style={[
                    styles.logItem,
                    index < Math.min(logs.length, 10) - 1 && [styles.logItemBorder, { borderBottomColor: borderColor }]
                  ]}
                >
                  <View style={[
                    styles.logIcon,
                    log.action === 'checkIn'
                      ? { backgroundColor: successMuted }
                      : { backgroundColor: dangerMuted }
                  ]}>
                    <Ionicons 
                      name={log.action === 'checkIn' ? 'log-in' : 'log-out'} 
                      size={16} 
                      color={log.action === 'checkIn' ? successTint : dangerTint} 
                    />
                  </View>
                  <View style={styles.logContent}>
                    <Text style={[styles.logAction, { color: textColor }]}>
                      {log.action === 'checkIn' ? 'Sjekket inn' : 'Sjekket ut'}
                    </Text>
                    <Text style={[styles.logTime, { color: subtextColor }]}>{formatLogTime(log.timestamp)}</Text>
                  </View>
                  <Text style={[styles.logPerformer, { color: subtextColor, backgroundColor: mutedBg }]}>{log.performedBy}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    width: '100%',
    overflow: 'hidden',
  },
  content: {
    padding: 24,
    maxWidth: 700,
    alignSelf: 'center',
    width: '100%',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.neutral[500],
  },
  errorCard: {
    margin: 24,
    padding: 48,
    backgroundColor: colors.white,
    borderRadius: 20,
    alignItems: 'center',
    gap: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.neutral[600],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 15,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.primary[50],
    borderRadius: 10,
  },
  editButtonText: {
    fontSize: 14,
    color: colors.primary[600],
    fontWeight: '600',
  },
  backButtonLarge: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backButtonLargeText: {
    fontSize: 15,
    color: colors.white,
    fontWeight: '600',
  },
  profileCard: {
    backgroundColor: colors.white,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: isLargeScreen ? 'row' : 'column',
    alignItems: 'center',
    padding: 28,
    gap: 20,
  },
  avatarContainer: {
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.white,
  },
  statusActive: {
    backgroundColor: colors.success[500],
  },
  statusInactive: {
    backgroundColor: colors.neutral[400],
  },
  profileInfo: {
    flex: 1,
    alignItems: isLargeScreen ? 'flex-start' : 'center',
  },
  profileName: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    textAlign: isLargeScreen ? 'left' : 'center',
  },
  profileMeta: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  statusBadgeText: {
    fontSize: 13,
    color: colors.white,
    fontWeight: '600',
  },
  actionSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[100],
  },
  checkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  checkInButton: {
    backgroundColor: colors.success[500],
  },
  checkOutButton: {
    backgroundColor: colors.red[500],
  },
  checkButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
    gap: 12,
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.success[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: colors.neutral[800],
  },
  sectionCount: {
    fontSize: 13,
    color: colors.neutral[500],
  },
  parentCard: {
    padding: 20,
  },
  parentCardBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  parentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  parentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  parentAvatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary[700],
  },
  parentInfo: {
    flex: 1,
  },
  parentNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  parentName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.amber[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.amber[700],
  },
  parentRelation: {
    fontSize: 14,
    color: colors.neutral[500],
    marginTop: 2,
  },
  contactButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
  },
  callButton: {
    backgroundColor: colors.success[50],
    borderColor: colors.success[200],
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success[700],
  },
  emailButton: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[200],
  },
  emailButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary[700],
  },
  smsButton: {
    backgroundColor: colors.accent[50],
    borderColor: colors.accent[200],
  },
  smsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.accent[500],
  },
  emptyLogs: {
    alignItems: 'center',
    padding: 40,
    gap: 12,
  },
  emptyLogsText: {
    fontSize: 14,
    color: colors.neutral[500],
  },
  logsContainer: {
    padding: 8,
  },
  logItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 14,
  },
  logItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  logIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logIconIn: {
    backgroundColor: colors.success[50],
  },
  logIconOut: {
    backgroundColor: colors.red[50],
  },
  logContent: {
    flex: 1,
  },
  logAction: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral[800],
  },
  logTime: {
    fontSize: 12,
    color: colors.neutral[500],
    marginTop: 2,
  },
  logPerformer: {
    fontSize: 12,
    color: colors.neutral[400],
    backgroundColor: colors.neutral[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
});

export default ChildProfileScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getChildrenForParent, getCheckInOutLogs } from '../data/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Avatar } from '../components';
import { colors } from '../theme';

const HistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Theme colors
  const bgColor = isDark ? colors.dark.bg.primary : colors.neutral[50];
  const cardBg = isDark ? colors.dark.surface.default : colors.white;
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const borderColor = isDark ? colors.dark.border.default : colors.neutral[100];

  useEffect(() => {
    loadHistory();
  }, [selectedDate]);

  const loadHistory = async () => {
    setLoading(true);
    console.log('📜 HistoryScreen loadHistory');
    console.log('👤 Bruker:', user?.name, '(rolle:', user?.role + ')');
    
    try {
      const dateString = selectedDate.toISOString().split('T')[0];
      
      // Hvis forelder, hent kun egne barns logger
      if (user?.role === 'parent') {
        console.log('👨‍👩‍👧 FORELDER: Henter kun logger for egne barn');
        
        // 1. Hent forelderens barn
        const childrenData = await getChildrenForParent(user.email);
        console.log('👶 Mine barn:', childrenData.map(c => c.name).join(', '));
        
        // 2. Hent logger for alle egne barn på denne datoen
        const allLogs = [];
        for (const child of childrenData) {
          console.log('📋 Henter logger for:', child.name);
          const childLogs = await getCheckInOutLogs({
            childId: child.id,
            date: dateString
          });
          allLogs.push(...childLogs);
        }
        
        // 3. Sorter etter tid (nyeste først)
        allLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        console.log('✅ Totalt', allLogs.length, 'logger for egne barn');
        setHistory(allLogs);
      } else {
        // Staff/admin ser alle logger fra checkinLogs
        console.log('👔 STAFF/ADMIN: Henter alle check-in/out logger');
        const logsData = await getCheckInOutLogs({ date: dateString });
        console.log('✅ Totalt', logsData.length, 'logger');
        setHistory(logsData);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('nb-NO', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('nb-NO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActionIcon = (action) => {
    switch (action) {
      case 'checkIn':
        return 'log-in-outline';
      case 'checkOut':
        return 'log-out-outline';
      case 'create':
        return 'add-circle-outline';
      case 'update':
        return 'create-outline';
      case 'delete':
        return 'trash-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'checkIn':
        return isDark ? colors.dark.success.default : colors.success[600];
      case 'checkOut':
        return isDark ? colors.dark.danger.default : colors.red[600];
      case 'create':
        return isDark ? colors.dark.primary.default : colors.primary[600];
      case 'update':
        return colors.accent[600];
      case 'delete':
        return isDark ? colors.dark.text.secondary : colors.neutral[600];
      default:
        return subtextColor;
    }
  };

  const getActionText = (entry) => {
    switch (entry.action) {
      case 'checkIn':
        return t('history.checkedIn', { name: entry.childName, time: entry.time });
      case 'checkOut':
        return t('history.checkedOut', { name: entry.childName, time: entry.time });
      case 'create':
        return t('history.created', { name: entry.childName });
      case 'update':
        return t('history.updated', { name: entry.childName });
      case 'delete':
        return t('history.deleted', { name: entry.childName });
      default:
        return entry.action;
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const renderHistoryItem = ({ item }) => (
    <View style={[styles.historyItem, { borderBottomColor: borderColor }]}>
      <View
        style={[
          styles.actionIconContainer,
          { backgroundColor: `${getActionColor(item.action)}20` },
        ]}
      >
        <Ionicons
          name={getActionIcon(item.action)}
          size={20}
          color={getActionColor(item.action)}
        />
      </View>
      <View style={styles.historyContent}>
        <Text style={[styles.historyText, { color: textColor }]}>{getActionText(item)}</Text>
        <Text style={[styles.historyTime, { color: subtextColor }]}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>{t('history.title')}</Text>
      </View>

      {/* Date Selector */}
      <Card style={styles.dateCard}>
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50] }]}
            onPress={() => changeDate(-1)}
          >
            <Ionicons name="chevron-back" size={24} color={isDark ? colors.dark.primary.default : colors.primary[600]} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.datePicker, { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50] }]}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={isDark ? colors.dark.primary.default : colors.primary[600]}
            />
            <Text style={[styles.dateText, { color: isDark ? colors.dark.primary.default : colors.primary[700] }]}>{formatDate(selectedDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50] }]}
            onPress={() => changeDate(1)}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={isDark ? colors.dark.primary.default : colors.primary[600]}
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            maximumDate={new Date()}
            locale="nb-NO"
          />
        )}
      </Card>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={[styles.statItem, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <View style={[styles.statIcon, { backgroundColor: isDark ? colors.dark.success.muted : colors.success[50] }]}>
            <Ionicons
              name="log-in-outline"
              size={20}
              color={isDark ? colors.dark.success.default : colors.success[600]}
            />
          </View>
          <View>
            <Text style={[styles.statValue, { color: textColor }]}>
              {history.filter((h) => h.action === 'checkIn').length}
            </Text>
            <Text style={[styles.statLabel, { color: subtextColor }]}>{t('history.checkIns')}</Text>
          </View>
        </View>

        <View style={[styles.statItem, { backgroundColor: cardBg, borderColor: borderColor }]}>
          <View style={[styles.statIcon, { backgroundColor: isDark ? colors.dark.danger.muted : colors.red[50] }]}>
            <Ionicons name="log-out-outline" size={20} color={isDark ? colors.dark.danger.default : colors.red[600]} />
          </View>
          <View>
            <Text style={[styles.statValue, { color: textColor }]}>
              {history.filter((h) => h.action === 'checkOut').length}
            </Text>
            <Text style={[styles.statLabel, { color: subtextColor }]}>{t('history.checkOuts')}</Text>
          </View>
        </View>
      </View>

      {/* History List */}
      <Card style={styles.historyCard} padding={false}>
        <View style={[styles.listHeader, { borderBottomColor: borderColor }]}>
          <Text style={[styles.listTitle, { color: textColor }]}>{t('history.activities')}</Text>
          <Text style={[styles.listCount, { color: subtextColor }]}>
            {history.length} {t('history.events')}
          </Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={[styles.loadingText, { color: subtextColor }]}>{t('loading')}</Text>
          </View>
        ) : history.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: isDark ? colors.dark.bg.tertiary : colors.neutral[100] }]}>
              <Ionicons name="time-outline" size={32} color={isDark ? colors.dark.text.muted : colors.neutral[400]} />
            </View>
            <Text style={[styles.emptyText, { color: subtextColor }]}>{t('history.noEvents')}</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item, index) => `${item.timestamp}-${index}`}
            renderItem={renderHistoryItem}
            style={styles.historyList}
            contentContainerStyle={styles.historyListContent}
          />
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  dateCard: {
    marginBottom: 16,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePicker: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginHorizontal: 12,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
  },
  historyCard: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  listCount: {
    fontSize: 14,
  },
  historyList: {
    flex: 1,
  },
  historyListContent: {
    padding: 4,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyContent: {
    flex: 1,
  },
  historyText: {
    fontSize: 14,
    marginBottom: 2,
  },
  historyTime: {
    fontSize: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
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
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HistoryScreen;

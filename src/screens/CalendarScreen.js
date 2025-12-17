import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card } from '../components';
import { colors } from '../theme';
import {
  getCalendarEvents,
  createCalendarEvent,
  deleteCalendarEvent,
} from '../data/api';

const EVENT_TYPES = [
  { id: 'meeting', label: 'Foreldremøte', color: '#3b82f6', icon: 'people-outline' },
  { id: 'trip', label: 'Turdag', color: '#22c55e', icon: 'walk-outline' },
  { id: 'holiday', label: 'Stengt/Ferie', color: '#ef4444', icon: 'sunny-outline' },
  { id: 'event', label: 'Arrangement', color: '#f59e0b', icon: 'star-outline' },
  { id: 'general', label: 'Annet', color: '#8b5cf6', icon: 'calendar-outline' },
];

const CalendarScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    time: '',
    type: 'general',
  });

  // Theme colors
  const bgColor = isDark ? colors.dark.bg.primary : colors.neutral[50];
  const cardBg = isDark ? colors.dark.surface.default : colors.white;
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const borderColor = isDark ? colors.dark.border.default : colors.neutral[200];
  const inputBg = isDark ? colors.dark.bg.tertiary : colors.neutral[50];
  const modalBg = isDark ? colors.dark.surface.overlay : colors.white;

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    try {
      const data = await getCalendarEvents({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth(),
      });
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    
    const days = [];
    
    // Tomme dager før første dag
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Dager i måneden
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    
    return days;
  };

  const getEventsForDay = (day) => {
    if (!day) return [];
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter((e) => e.date === dateStr);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('nb-NO', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (delta) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentDate(newDate);
    setSelectedDate(null);
  };

  const handleDayPress = (day) => {
    if (!day) return;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(dateStr);
  };

  const handleAddEvent = async () => {
    if (!newEvent.title.trim()) {
      Alert.alert('Feil', 'Tittel er påkrevd');
      return;
    }

    try {
      await createCalendarEvent({
        ...newEvent,
        date: selectedDate,
        createdBy: user?.name,
      });
      
      setShowAddModal(false);
      setNewEvent({ title: '', description: '', time: '', type: 'general' });
      loadEvents();
      Alert.alert('Suksess', 'Hendelse lagt til!');
    } catch (error) {
      Alert.alert('Feil', 'Kunne ikke legge til hendelse');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    Alert.alert(
      'Slett hendelse',
      'Er du sikker på at du vil slette denne hendelsen?',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Slett',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCalendarEvent(eventId);
              loadEvents();
            } catch (error) {
              Alert.alert('Feil', 'Kunne ikke slette hendelse');
            }
          },
        },
      ]
    );
  };

  const selectedDateEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];

  const weekDays = ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø'];
  const days = getDaysInMonth(currentDate);
  const today = new Date();
  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: bgColor }]} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: textColor }]}>{t('calendar.title') || 'Kalender'}</Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>
            {t('calendar.subtitle') || 'Hold oversikt over viktige datoer'}
          </Text>
        </View>

        {/* Måneds-navigasjon */}
        <Card style={styles.calendarCard}>
          <View style={styles.monthNav}>
            <TouchableOpacity
              style={[styles.monthButton, { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50] }]}
              onPress={() => changeMonth(-1)}
            >
              <Ionicons name="chevron-back" size={24} color={isDark ? colors.dark.primary.default : colors.primary[600]} />
            </TouchableOpacity>
            
            <Text style={[styles.monthText, { color: textColor }]}>{formatMonthYear(currentDate)}</Text>
            
            <TouchableOpacity
              style={[styles.monthButton, { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[50] }]}
              onPress={() => changeMonth(1)}
            >
              <Ionicons name="chevron-forward" size={24} color={isDark ? colors.dark.primary.default : colors.primary[600]} />
            </TouchableOpacity>
          </View>

          {/* Ukedager */}
          <View style={styles.weekDays}>
            {weekDays.map((day) => (
              <Text key={day} style={[styles.weekDay, { color: subtextColor }]}>
                {day}
              </Text>
            ))}
          </View>

          {/* Kalenderdager */}
          <View style={styles.daysGrid}>
            {days.map((day, index) => {
              const dayEvents = getEventsForDay(day);
              const dateStr = day
                ? `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                : null;
              const isSelected = dateStr === selectedDate;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayCell,
                    isToday(day) && [styles.todayCell, { backgroundColor: isDark ? colors.dark.primary.muted : colors.primary[100] }],
                    isSelected && styles.selectedCell,
                  ]}
                  onPress={() => handleDayPress(day)}
                  disabled={!day}
                >
                  {day && (
                    <>
                      <Text
                        style={[
                          styles.dayText,
                          { color: textColor },
                          isToday(day) && [styles.todayText, { color: isDark ? colors.dark.primary.default : colors.primary[700] }],
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {day}
                      </Text>
                      {dayEvents.length > 0 && (
                        <View style={styles.eventDots}>
                          {dayEvents.slice(0, 3).map((event, i) => {
                            const eventType = EVENT_TYPES.find((t) => t.id === event.type);
                            return (
                              <View
                                key={i}
                                style={[
                                  styles.eventDot,
                                  { backgroundColor: eventType?.color || colors.primary[500] },
                                ]}
                              />
                            );
                          })}
                        </View>
                      )}
                    </>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </Card>

        {/* Valgt dato hendelser */}
        {selectedDate && (
          <Card style={styles.eventsCard}>
            <View style={styles.eventsHeader}>
              <Text style={[styles.eventsTitle, { color: textColor }]}>
                {new Date(selectedDate).toLocaleDateString('nb-NO', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                })}
              </Text>
              {user?.role === 'admin' || user?.role === 'staff' ? (
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => setShowAddModal(true)}
                >
                  <Ionicons name="add-circle" size={20} color={colors.white} />
                  <Text style={styles.addButtonText}>Legg til</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {selectedDateEvents.length === 0 ? (
              <View style={styles.noEvents}>
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color={isDark ? colors.dark.text.muted : colors.neutral[300]}
                />
                <Text style={[styles.noEventsText, { color: subtextColor }]}>
                  Ingen hendelser denne dagen
                </Text>
              </View>
            ) : (
              selectedDateEvents.map((event) => {
                const eventType = EVENT_TYPES.find((t) => t.id === event.type);
                return (
                  <View key={event.id} style={[styles.eventItem, { backgroundColor: isDark ? colors.dark.bg.tertiary : colors.neutral[50] }]}>
                    <View
                      style={[
                        styles.eventIcon,
                        { backgroundColor: `${eventType?.color}20` },
                      ]}
                    >
                      <Ionicons
                        name={eventType?.icon || 'calendar-outline'}
                        size={20}
                        color={eventType?.color}
                      />
                    </View>
                    <View style={styles.eventInfo}>
                      <Text style={[styles.eventTitle, { color: textColor }]}>{event.title}</Text>
                      {event.time && (
                        <Text style={[styles.eventTime, { color: subtextColor }]}>
                          <Ionicons name="time-outline" size={12} /> {event.time}
                        </Text>
                      )}
                      {event.description && (
                        <Text style={[styles.eventDesc, { color: isDark ? colors.dark.text.secondary : colors.neutral[600] }]}>{event.description}</Text>
                      )}
                      <Text style={[styles.eventType, { color: isDark ? colors.dark.text.muted : colors.neutral[400] }]}>{eventType?.label}</Text>
                    </View>
                    {(user?.role === 'admin' || user?.role === 'staff') && (
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => handleDeleteEvent(event.id)}
                      >
                        <Ionicons name="trash-outline" size={18} color={isDark ? colors.dark.danger.default : colors.red[500]} />
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })
            )}
          </Card>
        )}

        {/* Event type legend */}
        <Card style={styles.legendCard}>
          <Text style={[styles.legendTitle, { color: isDark ? colors.dark.text.secondary : colors.neutral[700] }]}>Hendelsestyper</Text>
          <View style={styles.legendGrid}>
            {EVENT_TYPES.map((type) => (
              <View key={type.id} style={styles.legendItem}>
                <View
                  style={[styles.legendDot, { backgroundColor: type.color }]}
                />
                <Text style={[styles.legendText, { color: isDark ? colors.dark.text.secondary : colors.neutral[600] }]}>{type.label}</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      {/* Add Event Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: modalBg }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: textColor }]}>Ny hendelse</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Ionicons name="close" size={24} color={isDark ? colors.dark.text.secondary : colors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: isDark ? colors.dark.text.secondary : colors.neutral[700] }]}>Tittel *</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: inputBg, 
                borderColor: borderColor,
                color: textColor
              }]}
              placeholder="F.eks. Foreldremøte"
              placeholderTextColor={isDark ? colors.dark.text.placeholder : colors.neutral[400]}
              value={newEvent.title}
              onChangeText={(text) => setNewEvent({ ...newEvent, title: text })}
            />

            <Text style={[styles.inputLabel, { color: isDark ? colors.dark.text.secondary : colors.neutral[700] }]}>Tidspunkt</Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: inputBg, 
                borderColor: borderColor,
                color: textColor
              }]}
              placeholder="F.eks. 18:00"
              placeholderTextColor={isDark ? colors.dark.text.placeholder : colors.neutral[400]}
              value={newEvent.time}
              onChangeText={(text) => setNewEvent({ ...newEvent, time: text })}
            />

            <Text style={[styles.inputLabel, { color: isDark ? colors.dark.text.secondary : colors.neutral[700] }]}>Beskrivelse</Text>
            <TextInput
              style={[styles.input, styles.textArea, { 
                backgroundColor: inputBg, 
                borderColor: borderColor,
                color: textColor
              }]}
              placeholder="Valgfri beskrivelse..."
              placeholderTextColor={isDark ? colors.dark.text.placeholder : colors.neutral[400]}
              value={newEvent.description}
              onChangeText={(text) => setNewEvent({ ...newEvent, description: text })}
              multiline
              numberOfLines={3}
            />

            <Text style={[styles.inputLabel, { color: isDark ? colors.dark.text.secondary : colors.neutral[700] }]}>Type</Text>
            <View style={styles.typeGrid}>
              {EVENT_TYPES.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.typeButton,
                    { borderColor: isDark ? colors.dark.border.default : colors.neutral[200] },
                    newEvent.type === type.id && {
                      borderColor: type.color,
                      backgroundColor: `${type.color}10`,
                    },
                  ]}
                  onPress={() => setNewEvent({ ...newEvent, type: type.id })}
                >
                  <Ionicons
                    name={type.icon}
                    size={16}
                    color={newEvent.type === type.id ? type.color : subtextColor}
                  />
                  <Text
                    style={[
                      styles.typeButtonText,
                      { color: isDark ? colors.dark.text.secondary : colors.neutral[600] },
                      newEvent.type === type.id && { color: type.color },
                    ]}
                  >
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleAddEvent}>
              <Text style={styles.saveButtonText}>Lagre hendelse</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    padding: 16,
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  calendarCard: {
    marginBottom: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  monthButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthText: {
    fontSize: 18,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 8,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  todayCell: {
    // Background color applied inline
  },
  selectedCell: {
    backgroundColor: colors.primary[500],
  },
  dayText: {
    fontSize: 14,
  },
  todayText: {
    fontWeight: '700',
  },
  selectedText: {
    color: colors.white,
    fontWeight: '600',
  },
  eventDots: {
    flexDirection: 'row',
    gap: 2,
    marginTop: 2,
  },
  eventDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  eventsCard: {
    marginBottom: 16,
  },
  eventsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  eventsTitle: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary[600],
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.white,
  },
  noEvents: {
    alignItems: 'center',
    padding: 32,
  },
  noEventsText: {
    fontSize: 14,
    marginTop: 12,
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventTime: {
    fontSize: 12,
    marginTop: 2,
  },
  eventDesc: {
    fontSize: 14,
    marginTop: 4,
  },
  eventType: {
    fontSize: 12,
    marginTop: 4,
  },
  deleteButton: {
    padding: 8,
  },
  legendCard: {
    marginBottom: 32,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: colors.primary[600],
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.white,
  },
});

export default CalendarScreen;

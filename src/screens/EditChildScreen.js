import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getChildById, updateChild, deleteChild } from '../data/api';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme';

const EditChildScreen = ({ route, navigation }) => {
  const { childId } = route.params;
  const { t } = useTranslation();
  const { isDark } = useTheme();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [child, setChild] = useState(null);
  
  // Form state
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [group, setGroup] = useState('');
  const [parents, setParents] = useState([]);
  const [errors, setErrors] = useState({});

  // Theme colors
  const bgColor = isDark ? colors.dark.bg.primary : colors.neutral[50];
  const cardBg = isDark ? colors.dark.surface.default : colors.white;
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const subtextColor = isDark ? colors.dark.text.secondary : colors.neutral[500];
  const inputBg = isDark ? colors.dark.bg.tertiary : colors.white;
  const inputBorder = isDark ? colors.dark.border.default : colors.neutral[200];

  useEffect(() => {
    loadChild();
  }, [childId]);

  const loadChild = async () => {
    try {
      const data = await getChildById(childId);
      if (data) {
        setChild(data);
        setName(data.name);
        setAge(String(data.age));
        setGroup(data.group || '');
        setParents(data.parents || []);
      }
    } catch (error) {
      console.error('Error loading child:', error);
      Alert.alert('Feil', 'Kunne ikke laste barnet');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Navn er påkrevd';
    }
    
    if (!age.trim()) {
      newErrors.age = 'Alder er påkrevd';
    } else if (isNaN(parseInt(age)) || parseInt(age) < 0 || parseInt(age) > 10) {
      newErrors.age = 'Alder må være mellom 0 og 10';
    }
    
    // Valider foreldre
    parents.forEach((parent, index) => {
      if (!parent.name?.trim()) {
        newErrors[`parent_${index}_name`] = 'Navn er påkrevd';
      }
      if (parent.email && !parent.email.includes('@')) {
        newErrors[`parent_${index}_email`] = 'Ugyldig e-post';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    
    setSaving(true);
    try {
      const updatedChild = await updateChild(childId, {
        name: name.trim(),
        age: parseInt(age),
        group: group.trim() || 'Mauren',
        parents: parents,
        avatar: name.trim()
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      });
      
      Alert.alert(
        'Lagret',
        `${updatedChild.name} er oppdatert`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Error saving child:', error);
      Alert.alert('Feil', 'Kunne ikke lagre endringene');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Slett barn',
      `Er du sikker på at du vil slette ${name}? Dette kan ikke angres.`,
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Slett',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteChild(childId);
              Alert.alert('Slettet', `${name} er fjernet fra systemet`);
              navigation.navigate('Dashboard');
            } catch (error) {
              Alert.alert('Feil', 'Kunne ikke slette barnet');
            }
          },
        },
      ]
    );
  };

  const updateParent = (index, field, value) => {
    const updated = [...parents];
    updated[index] = { ...updated[index], [field]: value };
    setParents(updated);
  };

  const addParent = () => {
    setParents([
      ...parents,
      {
        id: `p${Date.now()}`,
        name: '',
        relation: '',
        phone: '',
        email: '',
        isPrimary: parents.length === 0,
      },
    ]);
  };

  const removeParent = (index) => {
    const updated = parents.filter((_, i) => i !== index);
    // Sett første som primær hvis primær ble fjernet
    if (updated.length > 0 && !updated.some((p) => p.isPrimary)) {
      updated[0].isPrimary = true;
    }
    setParents(updated);
  };

  const setPrimaryParent = (index) => {
    const updated = parents.map((p, i) => ({
      ...p,
      isPrimary: i === index,
    }));
    setParents(updated);
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!child) {
    return (
      <View style={[styles.errorContainer, { backgroundColor: bgColor }]}>
        <Ionicons name="alert-circle" size={64} color={colors.red[500]} />
        <Text style={[styles.errorText, { color: textColor }]}>Barn ikke funnet</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Tilbake</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: textColor }]}>Rediger profil</Text>
        <TouchableOpacity
          style={[styles.headerButton, styles.deleteButton]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={22} color={colors.red[500]} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Child Info Section */}
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>
              <Ionicons name="person" size={18} color={colors.primary[500]} />
              {'  '}Barnets informasjon
            </Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: subtextColor }]}>Navn *</Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: inputBg, borderColor: errors.name ? colors.red[500] : inputBorder, color: textColor },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="Barnets fulle navn"
                placeholderTextColor={colors.neutral[400]}
              />
              {errors.name && <Text style={styles.errorMsg}>{errors.name}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: subtextColor }]}>Alder *</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: inputBg, borderColor: errors.age ? colors.red[500] : inputBorder, color: textColor },
                  ]}
                  value={age}
                  onChangeText={setAge}
                  placeholder="4"
                  placeholderTextColor={colors.neutral[400]}
                  keyboardType="number-pad"
                  maxLength={2}
                />
                {errors.age && <Text style={styles.errorMsg}>{errors.age}</Text>}
              </View>

              <View style={[styles.inputGroup, { flex: 2, marginLeft: 12 }]}>
                <Text style={[styles.inputLabel, { color: subtextColor }]}>Gruppe</Text>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: inputBg, borderColor: inputBorder, color: textColor },
                  ]}
                  value={group}
                  onChangeText={setGroup}
                  placeholder="F.eks. Mauren"
                  placeholderTextColor={colors.neutral[400]}
                />
              </View>
            </View>
          </View>

          {/* Parents Section */}
          <View style={[styles.section, { backgroundColor: cardBg }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: textColor }]}>
                <Ionicons name="people" size={18} color={colors.primary[500]} />
                {'  '}Foresatte
              </Text>
              <TouchableOpacity style={styles.addParentBtn} onPress={addParent}>
                <Ionicons name="add-circle" size={24} color={colors.primary[500]} />
              </TouchableOpacity>
            </View>

            {parents.length === 0 && (
              <Text style={[styles.emptyText, { color: subtextColor }]}>
                Ingen foresatte registrert. Trykk + for å legge til.
              </Text>
            )}

            {parents.map((parent, index) => (
              <View key={parent.id || index} style={[styles.parentCard, { borderColor: inputBorder }]}>
                <View style={styles.parentHeader}>
                  <TouchableOpacity
                    style={[
                      styles.primaryBadge,
                      parent.isPrimary && styles.primaryBadgeActive,
                    ]}
                    onPress={() => setPrimaryParent(index)}
                  >
                    <Ionicons
                      name={parent.isPrimary ? 'star' : 'star-outline'}
                      size={16}
                      color={parent.isPrimary ? colors.warning[500] : colors.neutral[400]}
                    />
                    <Text
                      style={[
                        styles.primaryBadgeText,
                        parent.isPrimary && styles.primaryBadgeTextActive,
                      ]}
                    >
                      {parent.isPrimary ? 'Primær' : 'Sett som primær'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.removeParentBtn}
                    onPress={() => removeParent(index)}
                  >
                    <Ionicons name="close-circle" size={24} color={colors.red[400]} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: subtextColor }]}>Navn *</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: inputBg, borderColor: errors[`parent_${index}_name`] ? colors.red[500] : inputBorder, color: textColor },
                    ]}
                    value={parent.name}
                    onChangeText={(v) => updateParent(index, 'name', v)}
                    placeholder="Foresattes navn"
                    placeholderTextColor={colors.neutral[400]}
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={[styles.inputLabel, { color: subtextColor }]}>Relasjon</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: inputBg, borderColor: inputBorder, color: textColor },
                      ]}
                      value={parent.relation}
                      onChangeText={(v) => updateParent(index, 'relation', v)}
                      placeholder="Mor/Far"
                      placeholderTextColor={colors.neutral[400]}
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={[styles.inputLabel, { color: subtextColor }]}>Telefon</Text>
                    <TextInput
                      style={[
                        styles.input,
                        { backgroundColor: inputBg, borderColor: inputBorder, color: textColor },
                      ]}
                      value={parent.phone}
                      onChangeText={(v) => updateParent(index, 'phone', v)}
                      placeholder="912 34 567"
                      placeholderTextColor={colors.neutral[400]}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: subtextColor }]}>E-post</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { backgroundColor: inputBg, borderColor: errors[`parent_${index}_email`] ? colors.red[500] : inputBorder, color: textColor },
                    ]}
                    value={parent.email}
                    onChangeText={(v) => updateParent(index, 'email', v)}
                    placeholder="forelder@example.com"
                    placeholderTextColor={colors.neutral[400]}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={[colors.primary[500], colors.primary[600]]}
              style={styles.saveButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={22} color={colors.white} />
                  <Text style={styles.saveButtonText}>Lagre endringer</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 24,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: colors.primary[500],
    borderRadius: 12,
  },
  backButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[100],
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: colors.red[50],
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  addParentBtn: {
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  errorMsg: {
    color: colors.red[500],
    fontSize: 13,
    marginTop: 6,
  },
  emptyText: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  parentCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  parentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
  },
  primaryBadgeActive: {
    backgroundColor: colors.warning[50],
  },
  primaryBadgeText: {
    fontSize: 13,
    color: colors.neutral[500],
    fontWeight: '500',
  },
  primaryBadgeTextActive: {
    color: colors.warning[700],
  },
  removeParentBtn: {
    padding: 4,
  },
  saveButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
    shadowColor: colors.primary[900],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 6,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.white,
  },
});

export default EditChildScreen;

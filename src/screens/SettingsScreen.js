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
  Switch,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Card, Avatar, Button } from '../components';
import { colors as defaultColors } from '../theme';
import {
  updateUser,
  changePassword,
  deleteUser,
  deleteAllData,
  createUser,
  getAllUsers,
  validatePasswordStrength,
} from '../data/api';

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

const SettingsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user, logout, updateUserData } = useAuth();
  const { themeMode, setTheme, isDark, colors } = useTheme();
  
  // Available languages
  const LANGUAGES = [
    { code: 'nb', name: 'Norsk', countryCode: 'NO' },
    { code: 'en', name: 'English', countryCode: 'GB' },
    { code: 'ar', name: 'العربية', countryCode: 'SA' },
    { code: 'pl', name: 'Polski', countryCode: 'PL' },
    { code: 'so', name: 'Soomaali', countryCode: 'SO' },
    { code: 'ur', name: 'اردو', countryCode: 'PK' },
  ];
  
  // Modals
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  
  // Form states
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(null);
  
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserRole, setNewUserRole] = useState('staff');
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadUsers();
    }
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setShowLanguageModal(false);
  };

  const getCurrentLanguage = () => {
    return LANGUAGES.find(l => l.code === i18n.language) || LANGUAGES[0];
  };

  const handleThemeChange = (mode) => {
    setTheme(mode);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim() || !editEmail.trim()) {
      Alert.alert('Feil', 'Navn og e-post er påkrevd');
      return;
    }

    setLoading(true);
    try {
      await updateUser(user.id, {
        name: editName,
        email: editEmail,
        phone: editPhone,
      });
      
      // Oppdater lokal brukerstate
      if (updateUserData) {
        updateUserData({ name: editName, email: editEmail, phone: editPhone });
      }
      
      setShowEditProfile(false);
      Alert.alert('Suksess', 'Profilen din er oppdatert!');
    } catch (error) {
      Alert.alert('Feil', error.message || 'Kunne ikke oppdatere profilen');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Feil', 'Fyll ut alle feltene');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      Alert.alert('Feil', 'Passordene stemmer ikke overens');
      return;
    }
    
    const strength = validatePasswordStrength(newPassword);
    if (!strength.isValid) {
      Alert.alert('Feil', 'Passordet er for svakt. Bruk minst 8 tegn med store/små bokstaver og tall.');
      return;
    }

    setLoading(true);
    try {
      await changePassword(user.id, oldPassword, newPassword);
      
      setShowChangePassword(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordStrength(null);
      Alert.alert('Suksess', 'Passordet er endret!');
    } catch (error) {
      Alert.alert('Feil', error.message || 'Kunne ikke endre passord');
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordChange = (text) => {
    setNewPassword(text);
    if (text.length > 0) {
      setPasswordStrength(validatePasswordStrength(text));
    } else {
      setPasswordStrength(null);
    }
  };

  const handleAddUser = async () => {
    if (!newUserName.trim() || !newUserEmail.trim()) {
      Alert.alert('Feil', 'Navn og e-post er påkrevd');
      return;
    }

    setLoading(true);
    try {
      await createUser({
        name: newUserName,
        email: newUserEmail,
        phone: newUserPhone,
        role: newUserRole,
      });
      
      setShowAddUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPhone('');
      setNewUserRole('staff');
      loadUsers();
      Alert.alert('Suksess', 'Bruker opprettet!');
    } catch (error) {
      Alert.alert('Feil', error.message || 'Kunne ikke opprette bruker');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Slett konto',
      'Dette vil slette kontoen din og alle tilknyttede data permanent. Denne handlingen kan ikke angres.',
      [
        { text: 'Avbryt', style: 'cancel' },
        {
          text: 'Slett alt',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteUser(user.id);
              await deleteAllData();
              await logout();
            } catch (error) {
              Alert.alert('Feil', 'Kunne ikke slette kontoen');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleContactParent = (method, value) => {
    if (method === 'email') {
      Linking.openURL(`mailto:${value}`);
    } else if (method === 'sms') {
      Linking.openURL(`sms:${value.replace(/\s/g, '')}`);
    } else if (method === 'call') {
      Linking.openURL(`tel:${value.replace(/\s/g, '')}`);
    }
  };

  const themedColors = colors || defaultColors;

  const settingsSections = [
    {
      title: t('settings.account'),
      items: [
        {
          icon: 'person-outline',
          label: t('settings.profile'),
          description: t('settings.profileDesc'),
          action: () => {
            setEditName(user?.name || '');
            setEditEmail(user?.email || '');
            setEditPhone(user?.phone || '');
            setShowEditProfile(true);
          },
        },
        {
          icon: 'lock-closed-outline',
          label: 'Endre passord',
          description: 'Oppdater passordet ditt',
          action: () => setShowChangePassword(true),
        },
        {
          icon: 'shield-checkmark-outline',
          label: t('settings.security'),
          description: t('settings.securityDesc'),
          action: () => {},
        },
      ],
    },
    {
      title: t('settings.preferences'),
      items: [
        {
          icon: 'notifications-outline',
          label: t('settings.notifications'),
          description: t('settings.notificationsDesc'),
          action: () => {},
        },
        {
          icon: 'globe-outline',
          label: t('settings.language'),
          description: getCurrentLanguage().name,
          action: () => setShowLanguageModal(true),
        },
        {
          icon: 'moon-outline',
          label: t('settings.appearance'),
          description: themeMode === 'system' ? 'Automatisk' : (isDark ? 'Mørkt tema' : 'Lyst tema'),
          action: () => {},
          customContent: (
            <View style={styles.themeSelector}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'light' && styles.themeOptionActive,
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <Ionicons
                  name="sunny-outline"
                  size={18}
                  color={themeMode === 'light' ? themedColors.primary[600] : themedColors.neutral[500]}
                />
                <Text style={[
                  styles.themeOptionText,
                  themeMode === 'light' && styles.themeOptionTextActive,
                ]}>
                  Lyst
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'dark' && styles.themeOptionActive,
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <Ionicons
                  name="moon-outline"
                  size={18}
                  color={themeMode === 'dark' ? themedColors.primary[600] : themedColors.neutral[500]}
                />
                <Text style={[
                  styles.themeOptionText,
                  themeMode === 'dark' && styles.themeOptionTextActive,
                ]}>
                  Mørkt
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  themeMode === 'system' && styles.themeOptionActive,
                ]}
                onPress={() => handleThemeChange('system')}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={18}
                  color={themeMode === 'system' ? themedColors.primary[600] : themedColors.neutral[500]}
                />
                <Text style={[
                  styles.themeOptionText,
                  themeMode === 'system' && styles.themeOptionTextActive,
                ]}>
                  Auto
                </Text>
              </TouchableOpacity>
            </View>
          ),
        },
      ],
    },
  ];

  // Admin-seksjon
  if (user?.role === 'admin') {
    settingsSections.push({
      title: 'Administrasjon',
      items: [
        {
          icon: 'person-add-outline',
          label: 'Legg til bruker',
          description: 'Opprett ny ansatt eller forelder',
          action: () => setShowAddUser(true),
        },
        {
          icon: 'people-outline',
          label: 'Administrer brukere',
          description: `${users.length} registrerte brukere`,
          action: () => {},
        },
        {
          icon: 'business-outline',
          label: 'Barnehageinnstillinger',
          description: 'Logo, åpningstider, kontaktinfo',
          action: () => {},
        },
      ],
    });
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: themedColors.background }]} 
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themedColors.text }]}>{t('settings.title')}</Text>
          <Text style={[styles.subtitle, { color: themedColors.textSecondary }]}>{t('settings.subtitle')}</Text>
        </View>

        {/* User Card */}
        <Card style={[styles.userCard, { backgroundColor: themedColors.card }]}>
          <View style={styles.userContent}>
            <Avatar initials={user?.avatar} size="large" />
            <View style={styles.userInfo}>
              <Text style={[styles.userName, { color: themedColors.text }]}>{user?.name}</Text>
              <Text style={[styles.userEmail, { color: themedColors.textSecondary }]}>{user?.email}</Text>
              {user?.phone && (
                <Text style={[styles.userPhone, { color: themedColors.textSecondary }]}>{user?.phone}</Text>
              )}
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>
                  {user?.role === 'admin' 
                    ? 'Administrator' 
                    : user?.role === 'staff' 
                      ? t('settings.staff') 
                      : t('settings.parent')}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Settings Sections */}
        {settingsSections.map((section) => (
          <Card key={section.title} style={[styles.sectionCard, { backgroundColor: themedColors.card }]} padding={false}>
            <View style={[styles.sectionHeader, { borderBottomColor: themedColors.border }]}>
              <Text style={[styles.sectionTitle, { color: themedColors.text }]}>{section.title}</Text>
            </View>
            {section.items.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                style={[
                  styles.settingItem,
                  index < section.items.length - 1 && [styles.settingItemBorder, { borderBottomColor: themedColors.border }],
                ]}
                onPress={item.action}
              >
                <View style={styles.settingItemContent}>
                  <View style={[styles.settingIconContainer, { backgroundColor: themedColors.neutral[100] }]}>
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={themedColors.neutral[600]}
                    />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: themedColors.text }]}>{item.label}</Text>
                    <Text style={[styles.settingDescription, { color: themedColors.textSecondary }]}>
                      {item.description}
                    </Text>
                    {item.customContent}
                  </View>
                </View>
                {!item.customContent && (
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={themedColors.neutral[300]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </Card>
        ))}

        {/* Danger Zone */}
        <Card style={[styles.dangerCard, { backgroundColor: themedColors.card }]}>
          <Text style={[styles.dangerTitle, { color: themedColors.red[600] }]}>Faresone</Text>
          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: themedColors.red[200] }]}
            onPress={handleDeleteAccount}
          >
            <Ionicons name="trash-outline" size={20} color={themedColors.red[600]} />
            <Text style={[styles.dangerButtonText, { color: themedColors.red[600] }]}>
              Slett konto og alle data
            </Text>
          </TouchableOpacity>
        </Card>

        {/* Logout Button */}
        <TouchableOpacity 
          style={[styles.logoutButton, { backgroundColor: themedColors.red[50] }]} 
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={themedColors.red[600]} />
          <Text style={[styles.logoutText, { color: themedColors.red[600] }]}>{t('logout')}</Text>
        </TouchableOpacity>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: themedColors.neutral[400] }]}>Henteklar {t('settings.version')}</Text>
          <Text style={[styles.appInfoText, { color: themedColors.neutral[400] }]}>© 2024 FrostByte AS</Text>
        </View>
      </View>

      {/* Edit Profile Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditProfile(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themedColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themedColors.text }]}>Rediger profil</Text>
              <TouchableOpacity onPress={() => setShowEditProfile(false)}>
                <Ionicons name="close" size={24} color={themedColors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>Navn *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themedColors.neutral[50], borderColor: themedColors.border, color: themedColors.text }]}
              value={editName}
              onChangeText={setEditName}
              placeholder="Ditt navn"
              placeholderTextColor={themedColors.neutral[400]}
            />

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>E-post *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themedColors.neutral[50], borderColor: themedColors.border, color: themedColors.text }]}
              value={editEmail}
              onChangeText={setEditEmail}
              placeholder="din@epost.no"
              placeholderTextColor={themedColors.neutral[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>Telefon</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themedColors.neutral[50], borderColor: themedColors.border, color: themedColors.text }]}
              value={editPhone}
              onChangeText={setEditPhone}
              placeholder="912 34 567"
              placeholderTextColor={themedColors.neutral[400]}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: themedColors.primary[600] }]}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Lagrer...' : 'Lagre endringer'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        visible={showChangePassword}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowChangePassword(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themedColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themedColors.text }]}>Endre passord</Text>
              <TouchableOpacity onPress={() => setShowChangePassword(false)}>
                <Ionicons name="close" size={24} color={themedColors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>Nåværende passord</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themedColors.neutral[50], borderColor: themedColors.border, color: themedColors.text }]}
              value={oldPassword}
              onChangeText={setOldPassword}
              placeholder="••••••••"
              placeholderTextColor={themedColors.neutral[400]}
              secureTextEntry
            />

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>Nytt passord</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themedColors.neutral[50], borderColor: themedColors.border, color: themedColors.text }]}
              value={newPassword}
              onChangeText={handleNewPasswordChange}
              placeholder="Minst 8 tegn med store/små bokstaver og tall"
              placeholderTextColor={themedColors.neutral[400]}
              secureTextEntry
            />
            
            {/* Password Strength Indicator */}
            {passwordStrength && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBarContainer}>
                  <View 
                    style={[
                      styles.strengthBar, 
                      { 
                        width: `${(passwordStrength.score / 5) * 100}%`,
                        backgroundColor: passwordStrength.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}
            
            {/* Password Requirements */}
            {passwordStrength && (
              <View style={styles.requirementsList}>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={passwordStrength.checks.length ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={passwordStrength.checks.length ? '#10B981' : themedColors.neutral[400]} 
                  />
                  <Text style={[styles.requirementText, { color: themedColors.neutral[600] }]}>
                    Minst 8 tegn
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={passwordStrength.checks.uppercase ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={passwordStrength.checks.uppercase ? '#10B981' : themedColors.neutral[400]} 
                  />
                  <Text style={[styles.requirementText, { color: themedColors.neutral[600] }]}>
                    Store bokstaver (A-Z)
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={passwordStrength.checks.lowercase ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={passwordStrength.checks.lowercase ? '#10B981' : themedColors.neutral[400]} 
                  />
                  <Text style={[styles.requirementText, { color: themedColors.neutral[600] }]}>
                    Små bokstaver (a-z)
                  </Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={passwordStrength.checks.number ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={passwordStrength.checks.number ? '#10B981' : themedColors.neutral[400]} 
                  />
                  <Text style={[styles.requirementText, { color: themedColors.neutral[600] }]}>
                    Tall (0-9)
                  </Text>
                </View>
              </View>
            )}

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>Bekreft nytt passord</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themedColors.neutral[50], borderColor: themedColors.border, color: themedColors.text }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Gjenta passord"
              placeholderTextColor={themedColors.neutral[400]}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: themedColors.primary[600] }]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Endrer...' : 'Endre passord'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add User Modal (Admin only) */}
      <Modal
        visible={showAddUser}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddUser(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: themedColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themedColors.text }]}>Legg til ny bruker</Text>
              <TouchableOpacity onPress={() => setShowAddUser(false)}>
                <Ionicons name="close" size={24} color={themedColors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>Navn *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themedColors.neutral[50], borderColor: themedColors.border, color: themedColors.text }]}
              value={newUserName}
              onChangeText={setNewUserName}
              placeholder="Fullt navn"
              placeholderTextColor={themedColors.neutral[400]}
            />

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>E-post *</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themedColors.neutral[50], borderColor: themedColors.border, color: themedColors.text }]}
              value={newUserEmail}
              onChangeText={setNewUserEmail}
              placeholder="bruker@epost.no"
              placeholderTextColor={themedColors.neutral[400]}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>Telefon</Text>
            <TextInput
              style={[styles.input, { backgroundColor: themedColors.neutral[50], borderColor: themedColors.border, color: themedColors.text }]}
              value={newUserPhone}
              onChangeText={setNewUserPhone}
              placeholder="912 34 567"
              placeholderTextColor={themedColors.neutral[400]}
              keyboardType="phone-pad"
            />

            <Text style={[styles.inputLabel, { color: themedColors.text }]}>Rolle</Text>
            <View style={styles.roleSelector}>
              {['staff', 'parent', 'admin'].map((role) => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    { borderColor: themedColors.border },
                    newUserRole === role && { 
                      borderColor: themedColors.primary[500], 
                      backgroundColor: themedColors.primary[50] 
                    },
                  ]}
                  onPress={() => setNewUserRole(role)}
                >
                  <Text
                    style={[
                      styles.roleOptionText,
                      { color: themedColors.neutral[600] },
                      newUserRole === role && { color: themedColors.primary[600] },
                    ]}
                  >
                    {role === 'staff' ? 'Ansatt' : role === 'parent' ? 'Forelder' : 'Admin'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: themedColors.primary[600] }]}
              onPress={handleAddUser}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Oppretter...' : 'Opprett bruker'}
              </Text>
            </TouchableOpacity>
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
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.languageModalContent, { backgroundColor: themedColors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themedColors.text }]}>{t('settings.language')}</Text>
              <TouchableOpacity onPress={() => setShowLanguageModal(false)}>
                <Ionicons name="close" size={24} color={themedColors.neutral[600]} />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languageOption,
                    { 
                      backgroundColor: i18n.language === lang.code 
                        ? (isDark ? defaultColors.dark.primary.muted : defaultColors.primary[50])
                        : 'transparent',
                      borderColor: i18n.language === lang.code
                        ? (isDark ? defaultColors.dark.primary.default : defaultColors.primary[500])
                        : themedColors.border,
                    }
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                >
                  <View style={styles.languageFlagContainer}>
                    <FlagIcon countryCode={lang.countryCode} size={24} />
                  </View>
                  <Text style={[
                    styles.languageName,
                    { color: themedColors.text },
                    i18n.language === lang.code && styles.languageNameActive
                  ]}>
                    {lang.name}
                  </Text>
                  {i18n.language === lang.code && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={22} 
                      color={isDark ? defaultColors.dark.primary.default : defaultColors.primary[500]} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
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
    maxWidth: 600,
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
  userCard: {
    marginBottom: 24,
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },
  userPhone: {
    fontSize: 14,
    marginTop: 2,
  },
  roleBadge: {
    backgroundColor: defaultColors.success[100],
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: defaultColors.success[700],
  },
  sectionCard: {
    marginBottom: 16,
  },
  sectionHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
  },
  settingItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    flex: 1,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  themeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: defaultColors.neutral[200],
  },
  themeOptionActive: {
    borderColor: defaultColors.primary[500],
    backgroundColor: defaultColors.primary[50],
  },
  themeOptionText: {
    fontSize: 12,
    color: defaultColors.neutral[600],
  },
  themeOptionTextActive: {
    color: defaultColors.primary[600],
    fontWeight: '500',
  },
  dangerCard: {
    marginBottom: 16,
    padding: 16,
  },
  dangerTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  appInfoText: {
    fontSize: 14,
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
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Password strength styles
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: -8,
    gap: 12,
  },
  strengthBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 3,
  },
  strengthLabel: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 60,
  },
  requirementsList: {
    marginBottom: 16,
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
  },
  // Language Modal styles
  languageModalContent: {
    maxHeight: '60%',
  },
  languageList: {
    gap: 8,
  },
  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  languageFlagContainer: {
    width: 32,
    height: 22,
    borderRadius: 4,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  languageName: {
    fontSize: 16,
    flex: 1,
  },
  languageNameActive: {
    fontWeight: '600',
  },
});

export default SettingsScreen;

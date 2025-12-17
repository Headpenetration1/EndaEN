import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { colors } from '../theme';

const Input = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  autoComplete,
  icon,
  error,
  style,
  inputStyle,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const { isDark } = useTheme();

  const labelColor = isDark ? colors.dark.text.secondary : colors.neutral[700];
  const inputBg = isDark ? colors.dark.bg.tertiary : colors.white;
  const borderColor = isDark ? colors.dark.border.default : colors.neutral[200];
  const textColor = isDark ? colors.dark.text.primary : colors.neutral[800];
  const placeholderColor = isDark ? colors.dark.text.placeholder : colors.neutral[400];
  const focusBorder = isDark ? colors.dark.primary.default : colors.primary[400];
  const errorColor = isDark ? colors.dark.danger.default : colors.red[600];

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, { color: labelColor }]}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: inputBg, borderColor },
          isFocused && { borderColor: focusBorder, borderWidth: 2 },
          error && { borderColor: isDark ? colors.dark.danger.default : colors.red[500] },
        ]}
      >
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, { color: textColor }, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
      {error && <Text style={[styles.errorText, { color: errorColor }]}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  iconContainer: {
    paddingLeft: 16,
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputWithIcon: {
    paddingLeft: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
});

export default Input;

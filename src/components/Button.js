import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors } from '../theme';

const Button = ({
  onPress,
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  children,
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.base];

    // Variant
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'secondary':
        baseStyle.push(styles.secondary);
        break;
      case 'success':
        baseStyle.push(styles.success);
        break;
      case 'danger':
        baseStyle.push(styles.danger);
        break;
      case 'ghost':
        baseStyle.push(styles.ghost);
        break;
    }

    // Size
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
    }

    if (disabled) {
      baseStyle.push(styles.disabled);
    }

    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];

    switch (variant) {
      case 'primary':
      case 'success':
      case 'danger':
        baseStyle.push(styles.textLight);
        break;
      case 'secondary':
      case 'ghost':
        baseStyle.push(styles.textDark);
        break;
    }

    switch (size) {
      case 'small':
        baseStyle.push(styles.textSmall);
        break;
      case 'large':
        baseStyle.push(styles.textLarge);
        break;
    }

    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={variant === 'secondary' || variant === 'ghost' ? colors.neutral[600] : colors.white}
        />
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && icon}
        {title && <Text style={[...getTextStyle(), textStyle]}>{title}</Text>}
        {children}
        {icon && iconPosition === 'right' && icon}
      </>
    );
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[...getButtonStyle(), style]}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  primary: {
    backgroundColor: colors.primary[400],
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  success: {
    backgroundColor: colors.success[500],
  },
  danger: {
    backgroundColor: colors.red[500],
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  large: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  textLight: {
    color: colors.white,
  },
  textDark: {
    color: colors.neutral[700],
  },
  textSmall: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 18,
  },
});

export default Button;

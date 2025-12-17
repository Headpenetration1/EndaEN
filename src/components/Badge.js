import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const Badge = ({ children, variant = 'neutral', icon, style }) => {
  const getBadgeStyle = () => {
    const baseStyle = [styles.badge];
    
    switch (variant) {
      case 'success':
        baseStyle.push(styles.success);
        break;
      case 'warning':
        baseStyle.push(styles.warning);
        break;
      case 'neutral':
        baseStyle.push(styles.neutral);
        break;
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    switch (variant) {
      case 'success':
        baseStyle.push(styles.textSuccess);
        break;
      case 'warning':
        baseStyle.push(styles.textWarning);
        break;
      case 'neutral':
        baseStyle.push(styles.textNeutral);
        break;
    }
    
    return baseStyle;
  };

  return (
    <View style={[...getBadgeStyle(), style]}>
      {icon && icon}
      <Text style={getTextStyle()}>{children}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  success: {
    backgroundColor: colors.success[100],
  },
  warning: {
    backgroundColor: colors.amber[100],
  },
  neutral: {
    backgroundColor: colors.neutral[100],
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
  textSuccess: {
    color: colors.success[700],
  },
  textWarning: {
    color: colors.amber[700],
  },
  textNeutral: {
    color: colors.neutral[600],
  },
});

export default Badge;

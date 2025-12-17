import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme';

const Avatar = ({ 
  initials, 
  size = 'medium', 
  variant = 'primary',
  style 
}) => {
  const getAvatarStyle = () => {
    const baseStyle = [styles.avatar];
    
    // Size
    switch (size) {
      case 'small':
        baseStyle.push(styles.small);
        break;
      case 'medium':
        baseStyle.push(styles.medium);
        break;
      case 'large':
        baseStyle.push(styles.large);
        break;
      case 'xlarge':
        baseStyle.push(styles.xlarge);
        break;
    }
    
    // Variant
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.primary);
        break;
      case 'success':
        baseStyle.push(styles.success);
        break;
      case 'accent':
        baseStyle.push(styles.accent);
        break;
      case 'neutral':
        baseStyle.push(styles.neutral);
        break;
    }
    
    return baseStyle;
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    switch (size) {
      case 'small':
        baseStyle.push(styles.textSmall);
        break;
      case 'medium':
        baseStyle.push(styles.textMedium);
        break;
      case 'large':
        baseStyle.push(styles.textLarge);
        break;
      case 'xlarge':
        baseStyle.push(styles.textXlarge);
        break;
    }
    
    switch (variant) {
      case 'primary':
        baseStyle.push(styles.textPrimary);
        break;
      case 'success':
        baseStyle.push(styles.textSuccess);
        break;
      case 'accent':
        baseStyle.push(styles.textAccent);
        break;
      case 'neutral':
        baseStyle.push(styles.textNeutral);
        break;
    }
    
    return baseStyle;
  };

  return (
    <View style={[...getAvatarStyle(), style]}>
      <Text style={getTextStyle()}>{initials}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 100,
  },
  small: {
    width: 32,
    height: 32,
  },
  medium: {
    width: 40,
    height: 40,
  },
  large: {
    width: 56,
    height: 56,
  },
  xlarge: {
    width: 80,
    height: 80,
  },
  primary: {
    backgroundColor: colors.primary[100],
  },
  success: {
    backgroundColor: colors.success[100],
  },
  accent: {
    backgroundColor: colors.accent[100],
  },
  neutral: {
    backgroundColor: colors.neutral[100],
  },
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  textLarge: {
    fontSize: 18,
  },
  textXlarge: {
    fontSize: 24,
  },
  textPrimary: {
    color: colors.primary[700],
  },
  textSuccess: {
    color: colors.success[700],
  },
  textAccent: {
    color: colors.accent[700],
  },
  textNeutral: {
    color: colors.neutral[600],
  },
});

export default Avatar;

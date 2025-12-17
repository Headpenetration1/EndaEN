import React from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import { colors } from '../theme';

// Skeleton component for loading states
export const Skeleton = ({ width = '100%', height = 20, borderRadius = 8, style }) => {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: Platform.OS !== 'web',
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, []);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  if (Platform.OS === 'web') {
    return (
      <div
        className="skeleton"
        style={{
          width,
          height,
          borderRadius,
          ...style,
        }}
      />
    );
  }

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
};

// Skeleton Card for child loading
export const SkeletonCard = () => (
  <View style={styles.card}>
    <View style={styles.cardContent}>
      <Skeleton width={56} height={56} borderRadius={28} />
      <View style={styles.cardText}>
        <Skeleton width="60%" height={18} style={{ marginBottom: 8 }} />
        <Skeleton width="40%" height={14} />
      </View>
    </View>
    <Skeleton width="30%" height={28} borderRadius={14} style={{ marginTop: 12 }} />
  </View>
);

// Skeleton List
export const SkeletonList = ({ count = 3 }) => (
  <View style={styles.list}>
    {Array.from({ length: count }).map((_, index) => (
      <SkeletonCard key={index} />
    ))}
  </View>
);

// Skeleton Stats
export const SkeletonStats = () => (
  <View style={styles.stats}>
    <Skeleton width="31%" height={90} borderRadius={16} />
    <Skeleton width="31%" height={90} borderRadius={16} />
    <Skeleton width="31%" height={90} borderRadius={16} />
  </View>
);

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: colors.neutral[200],
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  cardText: {
    flex: 1,
  },
  list: {
    gap: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
});

export default Skeleton;

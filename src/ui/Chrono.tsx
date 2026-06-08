import React, { useEffect, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Easing,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useTheme } from '@/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ChronoProps {
  totalSeconds: number;
  remainingSeconds: number;
  size?: number;
}

export function Chrono({ totalSeconds, remainingSeconds, size = 140 }: ChronoProps) {
  const { theme } = useTheme();
  const progress = useSharedValue(remainingSeconds / totalSeconds);

  useEffect(() => {
    progress.value = withTiming(remainingSeconds / totalSeconds, {
      duration: 300,
      easing: Easing.linear,
    });
  }, [remainingSeconds, totalSeconds, progress]);

  const strokeColor = useMemo(() => {
    const ratio = remainingSeconds / totalSeconds;
    if (ratio <= 0.2) return theme.colors.danger;
    if (ratio <= 0.5) return theme.colors.enchere;
    return theme.colors.success;
  }, [remainingSeconds, totalSeconds, theme]);

  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={theme.colors.border}
          strokeWidth={8}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={8}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <Text style={[theme.typography.mono, styles.time, { color: theme.colors.text }]}>
        {Math.max(0, remainingSeconds)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  time: { position: 'absolute' },
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

interface BadgeProps {
  label: string;
  color?: string;
}

export function Badge({ label, color }: BadgeProps) {
  const { theme } = useTheme();
  const bg = color ?? theme.colors.primary;

  return (
    <View style={[styles.badge, { backgroundColor: `${bg}33`, borderRadius: theme.radius.sm }]}>
      <Text style={[theme.typography.caption, { color: bg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});

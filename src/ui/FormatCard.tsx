import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '@/theme';

interface FormatCardProps {
  label: string;
  subtitle?: string;
  color: string;
  selected?: boolean;
  onPress: () => void;
}

export function FormatCard({ label, subtitle, color, selected = false, onPress }: FormatCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: `${color}${selected ? '33' : '18'}`,
          borderColor: color,
          borderRadius: theme.radius.lg,
        },
        selected && styles.selected,
      ]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[theme.typography.bodyMedium, { color }]}>{label}</Text>
      {subtitle ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
    minHeight: 88,
    justifyContent: 'center',
  },
  selected: { borderWidth: 2.5 },
  dot: { width: 10, height: 10, borderRadius: 5, marginBottom: 8 },
});

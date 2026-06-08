import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Minus, Plus } from 'phosphor-react-native';
import { useTheme } from '@/theme';

interface StepperProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

export function Stepper({ label, value, min = 1, max = 99, onChange }: StepperProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[theme.typography.body, { color: theme.colors.text, flex: 1 }]}>{label}</Text>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        style={[styles.btn, { borderColor: theme.colors.border }]}>
        <Minus color={theme.colors.text} size={18} />
      </Pressable>
      <Text style={[theme.typography.subtitle, { color: theme.colors.text, minWidth: 32, textAlign: 'center' }]}>
        {value}
      </Text>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        style={[styles.btn, { borderColor: theme.colors.border }]}>
        <Plus color={theme.colors.text} size={18} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  btn: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
  },
});

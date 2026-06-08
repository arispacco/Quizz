import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';
import type { GameMode } from '@/models';

interface CardProps {
  children: React.ReactNode;
  accent?: GameMode | 'tokens' | 'default';
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, accent = 'default', style }: CardProps) {
  const { theme } = useTheme();

  const borderColor = (() => {
    switch (accent) {
      case 'echange':
        return theme.colors.exchange;
      case 'enchere':
        return theme.colors.enchere;
      case 'tokens':
        return theme.colors.tokens;
      default:
        return theme.colors.border;
    }
  })();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.surface,
          borderColor,
          borderRadius: theme.radius.lg,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
});

import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '@/theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'gold' | 'ghost';

interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}: ButtonProps) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const variantStyle = (() => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'danger':
        return { backgroundColor: theme.colors.danger };
      case 'gold':
        return { backgroundColor: theme.colors.tokens };
      case 'ghost':
        return { backgroundColor: 'transparent' };
      default:
        return { backgroundColor: theme.colors.primary };
    }
  })();

  const textColor =
    variant === 'secondary' || variant === 'ghost'
      ? theme.colors.primary
      : theme.colors.text;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { borderRadius: theme.radius.md, opacity: isDisabled ? 0.5 : pressed ? 0.85 : 1 },
        variantStyle,
        fullWidth && styles.fullWidth,
        style,
      ]}
      {...props}>
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[theme.typography.bodyMedium, { color: textColor, textAlign: 'center' }]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  fullWidth: { width: '100%' },
});

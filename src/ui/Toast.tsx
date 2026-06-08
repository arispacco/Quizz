import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useTheme } from '@/theme';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [toast, setToast] = useState<ToastState | null>(null);
  const opacity = React.useRef(new Animated.Value(0)).current;

  const showToast = useCallback(
    (message: string, type: ToastType = 'info') => {
      setToast({ message, type });
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.delay(2200),
        Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => setToast(null));
    },
    [opacity],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  const bg =
    toast?.type === 'success'
      ? theme.colors.success
      : toast?.type === 'error'
        ? theme.colors.danger
        : theme.colors.tokens;

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <Animated.View
          style={[
            styles.toast,
            { backgroundColor: `${bg}DD`, opacity, borderRadius: theme.radius.md },
          ]}>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>
            {toast.message}
          </Text>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    padding: 14,
    zIndex: 1000,
  },
});

import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import type { AuthStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Button, MeshGradient } from '@/ui';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export function WelcomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { enterDemoMode } = useAuth();
  const scale = useRef(new Animated.Value(0.85)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
    ]).start();
  }, [opacity, scale]);

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <MeshGradient />
      <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
        <Animated.View style={[styles.hero, { opacity, transform: [{ scale }] }]}>
          <Text style={[theme.typography.decorative, styles.logo, { color: theme.colors.primary }]}>
            LE JEU
          </Text>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: 8 }]}>
            Culture générale & stratégie
          </Text>
        </Animated.View>
        <View style={styles.actions}>
          <Button label="Commencer" onPress={() => navigation.navigate('Register')} fullWidth />
          <Button
            label="J'ai déjà un compte"
            variant="secondary"
            onPress={() => navigation.navigate('Login')}
            fullWidth
          />
          <Button label="Mode démo (hors ligne)" variant="ghost" onPress={enterDemoMode} fullWidth />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1, justifyContent: 'space-between', padding: 24 },
  hero: { alignItems: 'center', marginTop: 48 },
  logo: { fontSize: 56, letterSpacing: 2 },
  actions: { gap: 12, paddingBottom: 16 },
});

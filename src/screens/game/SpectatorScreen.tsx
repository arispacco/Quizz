import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Badge, Card, Chrono } from '@/ui';

type Route = RouteProp<RootStackParamList, 'Spectator'>;

export function SpectatorScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Badge label="👁 LIVE" color={theme.colors.danger} />
      <Text style={[theme.typography.title, { color: theme.colors.text, marginTop: 12 }]}>
        Vue spectateur
      </Text>
      <Text style={{ color: theme.colors.textSecondary }}>Match: {route.params.matchId}</Text>
      <Card style={{ marginTop: 20 }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>Joueur A vs Joueur B</Text>
        <Text style={{ color: theme.colors.textSecondary }}>Mode: Échange · Thème: Culture Générale</Text>
        <Chrono totalSeconds={30} remainingSeconds={18} />
        <Text style={{ color: theme.colors.spectators, marginTop: 8 }}>12 spectateurs</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
});

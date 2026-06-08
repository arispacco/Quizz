import React from 'react';
import { Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Button, Card, ScreenLayout } from '@/ui';

type Route = RouteProp<RootStackParamList, 'ClubDetail'>;

export function ClubDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();

  return (
    <ScreenLayout showBack title="Quiz Masters" scroll>
      <Text style={{ color: theme.colors.textSecondary }}>Club #{route.params.clubId}</Text>
      <Card style={{ marginTop: 16 }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>Membres</Text>
        <Text style={{ color: theme.colors.text }}>Nova — Admin</Text>
        <Text style={{ color: theme.colors.text }}>Pixel — Membre</Text>
      </Card>
      <Card style={{ marginTop: 12 }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>Classement interne</Text>
        <Text style={{ color: theme.colors.elo }}>1. Nova — 1340 ELO</Text>
        <Text style={{ color: theme.colors.elo }}>2. Pixel — 1180 ELO</Text>
      </Card>
      <Button label="Rejoindre le club" fullWidth style={{ marginTop: 20 }} />
    </ScreenLayout>
  );
}

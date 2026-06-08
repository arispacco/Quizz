import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Card } from '@/ui';

type Route = RouteProp<RootStackParamList, 'TournamentBracket'>;

const BRACKET = [
  { id: 'm1', teams: ['Équipe Alpha', 'Équipe Beta'], score: '2-1', status: 'completed' },
  { id: 'm2', teams: ['Équipe Gamma', 'Équipe Delta'], score: '1-2', status: 'in_progress' },
  { id: 'm3', teams: ['TBD', 'TBD'], score: '-', status: 'pending' },
];

export function TournamentBracketScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>Bracket</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Tournoi {route.params.matchId.slice(0, 8)}</Text>
      {BRACKET.map(match => (
        <Card
          key={match.id}
          style={{
            marginTop: 12,
            borderColor: match.status === 'in_progress' ? theme.colors.primary : theme.colors.border,
          }}>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>
            {match.teams[0]} vs {match.teams[1]}
          </Text>
          <Text style={{ color: theme.colors.textSecondary }}>Score: {match.score}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56 },
});

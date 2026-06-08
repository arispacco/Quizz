import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, ActivityIndicator, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Bracket, Match, Team } from '@/models';
import type { RootStackParamList } from '@/navigation/types';
import { subscribeToBracket, subscribeToMatch } from '@/services/firebase/database';
import { useTheme } from '@/theme';
import { Card, Button, Badge } from '@/ui';

type Route = RouteProp<RootStackParamList, 'TournamentBracket'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'TournamentBracket'>;

export function TournamentBracketScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { matchId } = route.params;

  const [match, setMatch] = useState<Match | null>(null);
  const [bracket, setBracket] = useState<Bracket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubMatch = subscribeToMatch(matchId, (m) => {
      setMatch(m);
      if (m?.bracketId) {
        const unsubBracket = subscribeToBracket(m.bracketId, (b) => {
          setBracket(b);
          setLoading(false);
        });
        return unsubBracket;
      } else if (m) {
        setLoading(false);
      }
    });
    return unsubMatch;
  }, [matchId]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const getTeamName = (id?: string) => {
    if (!id) return 'TBD';
    return match?.teams.find(t => t.id === id)?.name ?? 'Inconnu';
  };

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={[theme.typography.title, { color: theme.colors.text }]}>Bracket</Text>
        <Badge label={bracket?.currentPhase.toUpperCase() ?? ''} color={theme.colors.primary} />
      </View>
      
      {!bracket && (
        <Card style={{ marginTop: 20 }}>
          <Text style={{ color: theme.colors.textSecondary }}>Le bracket n'a pas encore été généré.</Text>
        </Card>
      )}

      {bracket?.matches.map((m, idx) => (
        <Card
          key={m.id}
          style={{
            marginTop: 12,
            borderColor: m.status === 'in_progress' ? theme.colors.primary : theme.colors.border,
          }}>
          <View style={styles.matchHeader}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Match #{idx + 1} · Round {m.round}</Text>
            {m.status === 'in_progress' && <Badge label="EN COURS" color={theme.colors.success} />}
          </View>
          
          <View style={styles.matchBody}>
            <View style={styles.teamRow}>
              <Text style={[theme.typography.bodyMedium, { color: m.winnerTeamId === m.teamAId ? theme.colors.success : theme.colors.text }]}>
                {getTeamName(m.teamAId)}
              </Text>
              {m.winnerTeamId === m.teamAId && <Text style={{ color: theme.colors.success }}>🏆</Text>}
            </View>
            <Text style={[theme.typography.mono, { color: theme.colors.textSecondary, marginVertical: 4 }]}>VS</Text>
            <View style={styles.teamRow}>
              <Text style={[theme.typography.bodyMedium, { color: m.winnerTeamId === m.teamBId ? theme.colors.success : theme.colors.text }]}>
                {getTeamName(m.teamBId)}
              </Text>
              {m.winnerTeamId === m.teamBId && <Text style={{ color: theme.colors.success }}>🏆</Text>}
            </View>
          </View>

          {m.status === 'in_progress' && (
            <Button 
              label="Voir le duel" 
              style={{ marginTop: 12 }} 
              onPress={() => navigation.navigate('Duel', {
                duelId: m.duelId!,
                matchId: matchId,
                settings: match!.settings,
                players: [] // À récupérer selon les représentants de l'équipe
              })}
            />
          )}
        </Card>
      ))}

      <Button
        label="Accéder au Mercato"
        variant="secondary"
        style={{ marginTop: 24 }}
        onPress={() => navigation.navigate('Mercato', { matchId })}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  matchHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  matchBody: { alignItems: 'center' },
  teamRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});

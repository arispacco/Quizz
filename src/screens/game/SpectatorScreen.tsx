import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { Duel, Match } from '@/models';
import type { RootStackParamList } from '@/navigation/types';
import { subscribeToDuel, subscribeToMatch } from '@/services/firebase/database';
import { useTheme } from '@/theme';
import { Badge, Card, Chrono, ScreenLayout } from '@/ui';

type Route = RouteProp<RootStackParamList, 'Spectator'>;

export function SpectatorScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
  const { matchId } = route.params;
  const [match, setMatch] = useState<Match | null>(null);
  const [duel, setDuel] = useState<Duel | null>(null);

  useEffect(() => {
    const unsubMatch = subscribeToMatch(matchId, (updatedMatch) => {
      setMatch(updatedMatch);
    });
    return unsubMatch;
  }, [matchId]);

  useEffect(() => {
    if (!match?.currentDuelId) {
      setDuel(null);
      return;
    }
    const unsubDuel = subscribeToDuel(match.currentDuelId, (updatedDuel) => {
      setDuel(updatedDuel);
    });
    return unsubDuel;
  }, [match?.currentDuelId]);

  if (!match) {
    return (
      <ScreenLayout title="Spectateur">
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
      </ScreenLayout>
    );
  }

  const playerLabel = (id: string) => match.players.find(p => p.id === id)?.pseudo ?? id;

  const renderDuelStatus = () => {
    if (!duel) return <Text style={{ color: theme.colors.textSecondary }}>En attente du prochain duel...</Text>;

    const isExchange = duel.currentRound.mode === 'echange';
    const timeRemaining = isExchange ? duel.exchange?.timeRemaining : duel.enchere?.timeRemaining;
    const totalTime = isExchange ? match.settings.exchangeTimeSeconds : match.settings.enchereTimeSeconds;

    return (
      <Card accent={isExchange ? 'echange' : 'enchere'}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
          {playerLabel(duel.playerAId)} vs {playerLabel(duel.playerBId)}
        </Text>
        <Text style={{ color: theme.colors.textSecondary, marginVertical: 4 }}>
          {isExchange ? 'Mode Échange' : 'Mode Enchère'} · {duel.currentRound.theme}
        </Text>
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.text, marginVertical: 8 }]}>
          {duel.currentRound.questionText}
        </Text>
        {timeRemaining !== undefined && (
          <View style={styles.chronoRow}>
            <Chrono totalSeconds={totalTime} remainingSeconds={timeRemaining} size={100} />
          </View>
        )}
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 8 }]}>
          Score : {duel.roundWins[duel.playerAId] ?? 0} - {duel.roundWins[duel.playerBId] ?? 0}
        </Text>
      </Card>
    );
  };

  return (
    <ScreenLayout showBack title="Spectateur">
      <View style={styles.header}>
        <Badge label="👁 LIVE" color={theme.colors.danger} />
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, marginLeft: 8 }]}>
          {match.status === 'lobby' ? 'Dans le lobby' : 'Partie en cours'}
        </Text>
      </View>

      <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginVertical: 12 }]}>
        {match.settings.format === 'tournoi' ? 'Tournoi' : 'Duel Face-to-face'}
      </Text>

      {renderDuelStatus()}

      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 20 }]}>
        Match ID: {matchId}
      </Text>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center' },
  chronoRow: { alignItems: 'center', marginVertical: 12 },
});

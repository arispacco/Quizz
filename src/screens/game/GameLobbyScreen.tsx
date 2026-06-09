import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import type { Match } from '@/models';
import type { RootStackParamList } from '@/navigation/types';
import { subscribeToMatch } from '@/services/firebase/database';
import { startMatch as startMatchService } from '@/services/online/matchmaking';
import { useTheme } from '@/theme';
import { Button, Card, ScreenLayout } from '@/ui';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GameLobby'>;
type Route = RouteProp<RootStackParamList, 'GameLobby'>;

export function GameLobbyScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { profile } = useAuth();
  const [match, setMatch] = useState<Match | null>(null);
  const { matchId } = route.params;
  const roomCode = matchId.slice(0, 6).toUpperCase();

  useEffect(() => {
    const unsub = subscribeToMatch(matchId, (updatedMatch) => {
      if (!updatedMatch) return;
      setMatch(updatedMatch);

      // Si le match a commencé, on redirige
      if (updatedMatch.status === 'in_progress') {
        if (updatedMatch.settings.format === 'tournoi') {
          navigation.replace('TournamentBracket', { matchId });
        } else {
          navigation.replace('Duel', {
            duelId: uuidv4(),
            matchId: updatedMatch.id,
            local: updatedMatch.settings.connectionMode !== 'online',
            settings: updatedMatch.settings,
            players: updatedMatch.players,
          });
        }
      }
    });
    return unsub;
  }, [matchId, navigation]);

  const isHost = match?.hostId === profile?.id || !match; // Host par défaut si pas encore chargé (local)

  const handleStartMatch = async () => {
    if (match?.settings.connectionMode === 'online') {
      await startMatchService(matchId);
    } else {
      // Mode local/mono : navigation directe
      if (route.params.settings.format === 'tournoi') {
        navigation.navigate('TournamentBracket', { matchId });
      } else {
        navigation.navigate('Duel', {
          duelId: uuidv4(),
          matchId: route.params.matchId,
          local: true,
          settings: route.params.settings,
          players: route.params.players,
        });
      }
    }
  };

  if (!match && route.params.settings.connectionMode === 'online') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  const players = match?.players ?? route.params.players;

  return (
    <ScreenLayout showBack title="Lobby">
      <Card style={styles.codeCard}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Code de salle</Text>
        <Text style={[theme.typography.mono, { color: theme.colors.primary, fontSize: 40 }]}>{roomCode}</Text>
      </Card>

      <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginBottom: 12 }]}>Joueurs</Text>
      <Card>
        {players.map((p, idx) => (
          <Text key={p.id} style={[theme.typography.body, { color: theme.colors.text, marginTop: idx > 0 ? 8 : 0 }]}>
            👤 {p.pseudo} {p.id === match?.hostId ? '(Hôte)' : ''}
          </Text>
        ))}
      </Card>

      {isHost ? (
        <Button label="Lancer la partie" onPress={handleStartMatch} fullWidth style={{ marginTop: 24 }} />
      ) : (
        <Text style={[theme.typography.bodyMedium, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: 24 }]}>
          En attente de l'hôte...
        </Text>
      )}

      <Button
        label="Mode spectateur"
        variant="secondary"
        onPress={() => navigation.navigate('Spectator', { matchId })}
        fullWidth
        style={{ marginTop: 12 }}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  codeCard: { alignItems: 'center', marginVertical: 16 },
});

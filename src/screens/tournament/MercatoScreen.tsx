import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import type { Match, MercatoPlayer, Team } from '@/models';
import type { RootStackParamList } from '@/navigation/types';
import { subscribeToMatch, updateMatch } from '@/services/firebase/database';
import { useTheme } from '@/theme';
import { Button, Card, ScreenLayout, useToast } from '@/ui';

type Route = RouteProp<RootStackParamList, 'Mercato'>;

const MOCK_AVAILABLE: MercatoPlayer[] = [
  { playerId: 'p1', pseudo: 'Stratège', value: 6, formerTeamId: 'team-3', available: true },
  { playerId: 'p2', pseudo: 'Érudit', value: 4, formerTeamId: 'team-1', available: true },
  { playerId: 'p3', pseudo: 'Expert', value: 5, formerTeamId: 'team-4', available: true },
];

export function MercatoScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const { matchId } = route.params;
  const [match, setMatch] = useState<Match | null>(null);
  const [players, setPlayers] = useState<MercatoPlayer[]>(MOCK_AVAILABLE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToMatch(matchId, (m) => {
      setMatch(m);
      setLoading(false);
    });
    return unsub;
  }, [matchId]);

  const myTeam = match?.teams.find(t => t.playerIds.includes(profile?.id ?? ''));
  const tokens = myTeam?.tokens ?? 0;

  const handleRecruit = async (player: MercatoPlayer) => {
    if (!myTeam) {
      Alert.alert('Erreur', 'Vous devez faire partie d\'une équipe pour recruter.');
      return;
    }

    if (tokens < player.value) {
      Alert.alert('Tokens insuffisants', `Il vous manque ${player.value - tokens} jetons.`);
      return;
    }

    Alert.alert(
      'Confirmer le recrutement',
      `Recruter ${player.pseudo} pour ${player.value} jetons ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Confirmer', 
          onPress: async () => {
            try {
              // Logique de transfert
              const updatedTeams = match!.teams.map(t => {
                if (t.id === myTeam.id) {
                  return { 
                    ...t, 
                    tokens: t.tokens - player.value,
                    playerIds: [...t.playerIds, player.playerId]
                  };
                }
                if (t.id === player.formerTeamId) {
                  return { 
                    ...t, 
                    playerIds: t.playerIds.filter(id => id !== player.playerId)
                  };
                }
                return t;
              });

              await updateMatch(matchId, { teams: updatedTeams });
              setPlayers(prev => prev.filter(p => p.playerId !== player.playerId));
              showToast(`${player.pseudo} a rejoint votre équipe !`, 'success');
            } catch {
              showToast('Erreur lors du recrutement', 'error');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ScreenLayout showBack title="Mercato">
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 100 }} />
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBack title="Mercato">
      <Card accent="tokens" style={styles.tokenCard}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Vos Jetons</Text>
        <Text style={[theme.typography.title, { color: theme.colors.tokens, fontSize: 32 }]}>{tokens} 🟡</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Équipe: {myTeam?.name ?? 'Aucune'}</Text>
      </Card>

      <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginTop: 24, marginBottom: 8 }]}>
        Joueurs disponibles
      </Text>
      
      <FlatList
        data={players}
        keyExtractor={p => p.playerId}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 12 }}>
            <View style={styles.playerRow}>
              <View style={{ flex: 1 }}>
                <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{item.pseudo}</Text>
                <Text style={{ color: theme.colors.textSecondary }}>Ancienne équipe : {item.formerTeamId}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[theme.typography.bodyMedium, { color: theme.colors.tokens }]}>{item.value} 🟡</Text>
                <Button 
                  label="Recruter" 
                  variant="gold" 
                  onPress={() => handleRecruit(item)} 
                  style={{ marginTop: 8, paddingHorizontal: 12, minHeight: 36 }} 
                />
              </View>
            </View>
          </Card>
        )}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tokenCard: { alignItems: 'center', paddingVertical: 20 },
  playerRow: { flexDirection: 'row', alignItems: 'center' },
});

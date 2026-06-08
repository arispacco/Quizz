import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Button, Card } from '@/ui';

type Nav = NativeStackNavigationProp<RootStackParamList, 'GameLobby'>;
type Route = RouteProp<RootStackParamList, 'GameLobby'>;

export function GameLobbyScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const roomCode = route.params.matchId.slice(0, 6).toUpperCase();

  const startDuel = () => {
    navigation.navigate('Duel', {
      duelId: uuidv4(),
      matchId: route.params.matchId,
      local: true,
      settings: route.params.settings,
      players: route.params.players,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>Lobby</Text>
      <Card style={styles.codeCard}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Code de salle</Text>
        <Text style={[theme.typography.mono, { color: theme.colors.primary, fontSize: 40 }]}>{roomCode}</Text>
      </Card>
      <Card>
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>✅ Joueur A — Prêt</Text>
        <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 8 }]}>✅ Joueur B — Prêt</Text>
      </Card>
      <Button label="Lancer le duel" onPress={startDuel} fullWidth style={{ marginTop: 24 }} />
      <Button
        label="Mode spectateur"
        variant="secondary"
        onPress={() => navigation.navigate('Spectator', { matchId: route.params.matchId })}
        fullWidth
        style={{ marginTop: 8 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
  codeCard: { alignItems: 'center', marginVertical: 16 },
});

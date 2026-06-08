import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { MercatoPlayer } from '@/models';
import { useTheme } from '@/theme';
import { Button, Card } from '@/ui';

const AVAILABLE: MercatoPlayer[] = [
  { playerId: 'p1', pseudo: 'Stratège', value: 6, formerTeamId: 'team-3', available: true },
  { playerId: 'p2', pseudo: 'Érudit', value: 4, formerTeamId: 'team-1', available: true },
];

export function MercatoScreen() {
  const { theme } = useTheme();
  const [players] = useState(AVAILABLE);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>Mercato</Text>
      <Text style={{ color: theme.colors.textSecondary }}>Fenêtre avant les quarts de finale</Text>
      <FlatList
        data={players}
        keyExtractor={p => p.playerId}
        renderItem={({ item }) => (
          <Card accent="tokens" style={{ marginTop: 12 }}>
            <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{item.pseudo}</Text>
            <Text style={{ color: theme.colors.tokens }}>Valeur: {item.value} jetons</Text>
            <Button label="Recruter" variant="gold" onPress={() => {}} style={{ marginTop: 8 }} />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 56 },
});

import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import type { MatchHistoryEntry, Pack } from '@/models';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { getAllPacks, getMatchHistory } from '@/services/db/sqlite';
import { useTheme } from '@/theme';
import { Badge, Button, Card, ScreenLayout } from '@/ui';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Profile'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function ProfileScreen() {
  const { theme } = useTheme();
  const { profile, logout } = useAuth();
  const navigation = useNavigation<Nav>();
  const [tab, setTab] = useState<'stats' | 'history' | 'packs'>('stats');
  const [packs, setPacks] = useState<Pack[]>([]);
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);

  useEffect(() => {
    getAllPacks().then(setPacks);
    getMatchHistory().then(setHistory);
  }, []);

  if (!profile) return null;

  const ratio = profile.wins + profile.losses > 0
    ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100)
    : 0;

  return (
    <ScreenLayout scroll contentStyle={styles.container}>
      <View style={[styles.banner, { backgroundColor: theme.colors.primary }]} />
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>{profile.pseudo}</Text>
      <Badge label={profile.activeTitle ?? 'Novice'} color={theme.colors.xp} />

      <View style={styles.statsRow}>
        <StatBox label="ELO" value={String(profile.elo)} color={theme.colors.elo} />
        <StatBox label="Niveau" value={String(profile.xpLevel)} color={theme.colors.xp} />
        <StatBox label="Ratio" value={`${ratio}%`} color={theme.colors.success} />
      </View>

      <View style={styles.tabs}>
        {(['stats', 'history', 'packs'] as const).map(t => (
          <Pressable key={t} onPress={() => setTab(t)}>
            <Text style={{ color: tab === t ? theme.colors.primary : theme.colors.textSecondary }}>
              {t === 'stats' ? 'Stats' : t === 'history' ? 'Historique' : 'Packs'}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'stats' && (
        <Card>
          <Text style={{ color: theme.colors.text }}>Victoires: {profile.wins}</Text>
          <Text style={{ color: theme.colors.text }}>Défaites: {profile.losses}</Text>
          <Text style={{ color: theme.colors.text }}>XP: {profile.xp}</Text>
        </Card>
      )}

      {tab === 'history' && (
        history.length === 0 ? (
          <Card><Text style={{ color: theme.colors.textSecondary }}>Aucune partie enregistrée</Text></Card>
        ) : (
          history.map(h => (
            <Card key={h.id} style={{ marginBottom: 8 }}>
              <Text style={{ color: theme.colors.text }}>{h.opponentPseudo} — {h.result}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{h.score}</Text>
            </Card>
          ))
        )
      )}

      {tab === 'packs' && (
        packs.map(p => (
          <Card key={p.id} style={{ marginBottom: 8 }}>
            <Text style={{ color: theme.colors.text }}>{p.name}</Text>
            <Text style={{ color: theme.colors.textSecondary }}>{p.questionCount} questions</Text>
          </Card>
        ))
      )}

      <Button label="Paramètres" variant="secondary" onPress={() => navigation.navigate('Settings')} fullWidth style={{ marginTop: 20 }} />
      <Button label="Déconnexion" variant="ghost" onPress={logout} fullWidth />
    </ScreenLayout>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.statBox, { backgroundColor: theme.colors.surface }]}>
      <Text style={[theme.typography.caption, { color }]}>{label}</Text>
      <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  banner: { height: 80, borderRadius: 12, marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 8, marginVertical: 16 },
  statBox: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  tabs: { flexDirection: 'row', gap: 20, marginBottom: 16 },
});

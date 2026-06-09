import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { Pack } from '@/models';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { DEFAULT_PACKS } from '@/data/defaultPacks';
import { getAllPacks } from '@/services/db/sqlite';
import { useTheme } from '@/theme';
import { Badge, Button, Card, ScreenLayout } from '@/ui';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Explore'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type ExploreFilter = 'packs' | 'players' | 'clubs' | 'tournaments';

const MOCK_PLAYERS = [
  { id: 'u1', pseudo: 'Nova', elo: 1340, level: 12 },
  { id: 'u2', pseudo: 'Pixel', elo: 1180, level: 9 },
  { id: 'u3', pseudo: 'Echo', elo: 1520, level: 15 },
];

const MOCK_CLUBS = [
  { id: 'club-1', name: 'Quiz Masters', members: 24, activity: 'Tournoi hier' },
  { id: 'club-2', name: 'Culture Crew', members: 12, activity: 'Pack publié' },
];

export function ExploreScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const [packs, setPacks] = useState<Pack[]>(DEFAULT_PACKS);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<ExploreFilter>('packs');
  const [players, setPlayers] = useState<any[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  useEffect(() => {
    getAllPacks().then(local => {
      if (local.length > 0) setPacks(local);
    });
  }, []);

  const filteredPacks = packs.filter(
    p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.mainTheme.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredPlayers = MOCK_PLAYERS.filter(p =>
    p.pseudo.toLowerCase().includes(query.toLowerCase()),
  );

  const filteredClubs = MOCK_CLUBS.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()),
  );

  const filters: { key: ExploreFilter; label: string }[] = [
    { key: 'packs', label: 'Packs' },
    { key: 'players', label: 'Joueurs' },
    { key: 'clubs', label: 'Clubs' },
    { key: 'tournaments', label: 'Tournois' },
  ];

  return (
    <ScreenLayout title="Explorer" contentStyle={styles.container}>
      <TextInput
        placeholder="Rechercher packs, joueurs, clubs..."
        placeholderTextColor={theme.colors.textSecondary}
        value={query}
        onChangeText={setQuery}
        style={[
          styles.search,
          {
            backgroundColor: theme.colors.surface,
            color: theme.colors.text,
            borderColor: theme.colors.border,
          },
        ]}
      />
      <View style={styles.filters}>
        {filters.map(f => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.filterBtn,
              {
                backgroundColor: filter === f.key ? theme.colors.primary : theme.colors.surface,
                borderColor: theme.colors.border,
              },
            ]}>
            <Text style={{ color: filter === f.key ? '#fff' : theme.colors.textSecondary, fontSize: 13 }}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {filter === 'packs' && (
        <FlatList
          data={filteredPacks}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('PackDetail', { packId: item.id })}>
              <Card style={styles.card}>
                <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{item.name}</Text>
                <Badge label={item.mainTheme} />
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 6 }]}>
                  {item.questionCount} questions · ⭐ {item.rating}
                  {item.downloaded ? ' · Téléchargé' : ''}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      )}

      {filter === 'players' && (
        <>
          {loadingPlayers && <ActivityIndicator color={theme.colors.primary} style={{ marginBottom: 10 }} />}
          <FlatList
            data={players}
            keyExtractor={item => item.id}
            scrollEnabled={false}
            ListEmptyComponent={
              !loadingPlayers ? (
                <Card>
                  <Text style={{ color: theme.colors.textSecondary }}>
                    {query.length > 1 ? 'Aucun joueur trouvé' : 'Saisissez au moins 2 caractères'}
                  </Text>
                </Card>
              ) : null
            }
            renderItem={({ item }) => (
              <Card style={styles.card}>
                <View style={styles.playerRow}>
                  <View style={[styles.avatar, { backgroundColor: theme.colors.primary }]}>
                    <Text style={{ color: '#fff', fontWeight: '700' }}>{item.pseudo[0].toUpperCase()}</Text>
                  </View>
                  <View style={styles.playerInfo}>
                    <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>{item.pseudo}</Text>
                    <Text style={{ color: theme.colors.elo }}>ELO {item.elo} · Niv. {item.xpLevel}</Text>
                  </View>
                  <Button
                    label="Profil"
                    variant="secondary"
                    onPress={() => navigation.navigate('UserProfile', { userId: item.id })}
                    style={styles.followBtn}
                  />
                </View>
              </Card>
            )}
          />
        </>
      )}

      {filter === 'clubs' && (
        <FlatList
          data={filteredClubs}
          keyExtractor={item => item.id}
          scrollEnabled={false}
          ListEmptyComponent={
            <Card>
              <Text style={{ color: theme.colors.textSecondary }}>Aucun club trouvé</Text>
            </Card>
          }
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('ClubDetail', { clubId: item.id })}>
              <Card style={styles.card} accent="default">
                <Text style={[theme.typography.subtitle, { color: theme.colors.clubs }]}>{item.name}</Text>
                <Text style={{ color: theme.colors.textSecondary }}>{item.members} membres</Text>
                <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                  {item.activity}
                </Text>
              </Card>
            </Pressable>
          )}
        />
      )}

      {filter === 'tournaments' && (
        <Card>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>
            Tournois publics en cours
          </Text>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 8 }]}>
            Disponible en mode En ligne (Phase 2). Revenez bientôt pour rejoindre en spectateur.
          </Text>
        </Card>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  search: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  card: { marginBottom: 10 },
  playerRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInfo: { flex: 1, marginLeft: 12 },
  followBtn: { paddingVertical: 8, paddingHorizontal: 12, minHeight: 36 },
});

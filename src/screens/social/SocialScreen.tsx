import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ActivityItem, Club } from '@/models';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { createClub } from '@/services/social/clubs';
import { getFeed } from '@/services/social/activity';
import { followUser } from '@/services/social/friends';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme';
import { Button, Card, Input, ScreenLayout, useToast } from '@/ui';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Social'>,
  NativeStackNavigationProp<RootStackParamList>
>;

const MOCK_FRIENDS = [
  { id: 'u1', pseudo: 'Nova', elo: 1340, online: true },
  { id: 'u2', pseudo: 'Pixel', elo: 1180, online: false },
];

const INITIAL_CLUBS: Club[] = [
  {
    id: 'club-1',
    name: 'Quiz Masters',
    description: 'Club compétitif',
    color: '#84CC16',
    memberCount: 24,
    access: 'open',
    adminIds: ['admin1'],
    createdAt: new Date().toISOString(),
  },
];

const CLUB_COLORS = ['#84CC16', '#7C3AED', '#06B6D4', '#F97316'];

export function SocialScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [tab, setTab] = useState<'friends' | 'clubs' | 'activity'>('friends');
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [showCreateClub, setShowCreateClub] = useState(false);
  const [clubName, setClubName] = useState('');
  const [clubDescription, setClubDescription] = useState('');
  const [clubColor, setClubColor] = useState(CLUB_COLORS[0]);
  const [clubAccess, setClubAccess] = useState<Club['access']>('open');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const friendIds = MOCK_FRIENDS.map(f => f.id);
    getFeed(friendIds).then(feed => {
      if (feed.length > 0) {
        setActivities(feed);
      } else {
        setActivities([
          {
            id: 'a1',
            userId: 'u1',
            userPseudo: 'Nova',
            type: 'match_played',
            message: 'a joué un Face-to-face',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'a2',
            userId: 'u2',
            userPseudo: 'Pixel',
            type: 'pack_published',
            message: 'a publié un pack',
            createdAt: new Date().toISOString(),
          },
        ]);
      }
    });
  }, []);

  const handleCreateClub = async () => {
    if (!clubName.trim()) {
      showToast('Le nom du club est requis', 'error');
      return;
    }
    setCreating(true);
    try {
      const club = await createClub(
        profile?.id ?? 'local',
        clubName.trim(),
        clubDescription.trim(),
        clubColor,
        clubAccess,
      );
      setClubs(prev => [club, ...prev]);
      setShowCreateClub(false);
      setClubName('');
      setClubDescription('');
      showToast(`Club "${club.name}" créé`, 'success');
    } catch {
      showToast('Erreur lors de la création', 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleFollow = async (targetId: string) => {
    if (profile?.id) {
      await followUser(profile.id, targetId);
    }
    navigation.navigate('UserProfile', { userId: targetId });
  };

  return (
    <ScreenLayout title="Social">
      <View style={styles.tabs}>
        {(['friends', 'clubs', 'activity'] as const).map(t => (
          <Pressable
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tab, tab === t && { borderBottomColor: theme.colors.primary, borderBottomWidth: 2 }]}>
            <Text style={{ color: tab === t ? theme.colors.primary : theme.colors.textSecondary }}>
              {t === 'friends' ? 'Amis' : t === 'clubs' ? 'Clubs' : 'Activité'}
            </Text>
          </Pressable>
        ))}
      </View>

      {tab === 'friends' && (
        <FlatList
          data={MOCK_FRIENDS}
          keyExtractor={f => f.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 8 }}>
              <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>
                {item.pseudo} · ELO {item.elo}
              </Text>
                <Text style={{ color: item.online ? theme.colors.success : theme.colors.textSecondary }}>
                {item.online ? 'En ligne' : 'Hors ligne'}
              </Text>
              <Button label="Inviter" variant="secondary" onPress={() => handleFollow(item.id)} />
            </Card>
          )}
        />
      )}

      {tab === 'clubs' && (
        <>
          <View style={styles.clubActions}>
            <Button label="Créer un club" onPress={() => setShowCreateClub(true)} style={{ flex: 1 }} />
            <Button label="Rejoindre" variant="secondary" onPress={() => showToast('Recherche bientôt disponible', 'info')} style={{ flex: 1 }} />
          </View>
          <FlatList
            data={clubs}
            keyExtractor={c => c.id}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <Pressable onPress={() => navigation.navigate('ClubDetail', { clubId: item.id })}>
                <Card style={{ marginBottom: 8 }}>
                  <Text style={[theme.typography.subtitle, { color: item.color }]}>{item.name}</Text>
                  <Text style={{ color: theme.colors.textSecondary }}>{item.memberCount} membres</Text>
                  <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                    {item.access === 'open' ? 'Accès ouvert' : 'Sur invitation'}
                  </Text>
                </Card>
              </Pressable>
            )}
          />
        </>
      )}

      {tab === 'activity' && (
        <FlatList
          data={activities}
          keyExtractor={a => a.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Card style={{ marginBottom: 8 }}>
              <Text style={{ color: theme.colors.text }}>
                <Text style={{ color: theme.colors.primary }}>{item.userPseudo}</Text> {item.message}
              </Text>
            </Card>
          )}
        />
      )}

      <Modal visible={showCreateClub} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
            <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginBottom: 16 }]}>
              Créer un club
            </Text>
            <Input label="Nom du club" value={clubName} onChangeText={setClubName} />
            <Input label="Description" value={clubDescription} onChangeText={setClubDescription} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
              Couleur du club
            </Text>
            <View style={styles.colorRow}>
              {CLUB_COLORS.map(c => (
                <Pressable
                  key={c}
                  onPress={() => setClubColor(c)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c, borderColor: clubColor === c ? theme.colors.text : 'transparent' },
                  ]}
                />
              ))}
            </View>
            <View style={styles.accessRow}>
              <Button
                label="Ouvert"
                variant={clubAccess === 'open' ? 'primary' : 'secondary'}
                onPress={() => setClubAccess('open')}
                style={{ flex: 1 }}
              />
              <Button
                label="Sur invitation"
                variant={clubAccess === 'invite_only' ? 'primary' : 'secondary'}
                onPress={() => setClubAccess('invite_only')}
                style={{ flex: 1 }}
              />
            </View>
            <View style={styles.modalActions}>
              <Button label="Annuler" variant="ghost" onPress={() => setShowCreateClub(false)} style={{ flex: 1 }} />
              <Button label="Créer" onPress={handleCreateClub} loading={creating} style={{ flex: 1 }} />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  tab: { paddingBottom: 8 },
  clubActions: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modal: { padding: 24, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  colorRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  colorSwatch: { width: 36, height: 36, borderRadius: 18, borderWidth: 3 },
  accessRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  modalActions: { flexDirection: 'row', gap: 8 },
});

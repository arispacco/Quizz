import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, FlatList } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import type { Club } from '@/models';
import type { RootStackParamList } from '@/navigation/types';
import { getClub, getClubMembers, isClubMember, joinClub } from '@/services/social/clubs';
import { useTheme } from '@/theme';
import { Badge, Button, Card, ScreenLayout, useToast } from '@/ui';

type Route = RouteProp<RootStackParamList, 'ClubDetail'>;

export function ClubDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
  const { profile } = useAuth();
  const { showToast } = useToast();
  
  const { clubId } = route.params;
  const [club, setClub] = useState<Club | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const c = await getClub(clubId);
        if (c) {
          setClub(c);
          const m = await getClubMembers(clubId);
          setMembers(m);
          if (profile?.id) {
            const member = await isClubMember(clubId, profile.id);
            setIsMember(member);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [clubId, profile?.id]);

  const handleJoin = async () => {
    if (!profile?.id) return;
    setJoining(true);
    try {
      await joinClub(clubId, profile.id);
      setIsMember(true);
      showToast('Vous avez rejoint le club !', 'success');
      // Recharger les membres
      const m = await getClubMembers(clubId);
      setMembers(m);
    } catch {
      showToast('Erreur lors de l\'adhésion', 'error');
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <ScreenLayout showBack title="Club">
        <ActivityIndicator color={theme.colors.primary} style={{ marginTop: 100 }} />
      </ScreenLayout>
    );
  }

  if (!club) {
    return (
      <ScreenLayout showBack title="Erreur">
        <Text style={{ color: theme.colors.text, textAlign: 'center', marginTop: 100 }}>
          Club introuvable.
        </Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBack title={club.name} scroll>
      <View style={[styles.header, { backgroundColor: club.color }]}>
        <Text style={[theme.typography.title, { color: '#fff' }]}>{club.name}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)' }}>{club.memberCount} membres</Text>
      </View>

      <Card style={{ marginTop: 16 }}>
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>{club.description}</Text>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginBottom: 8 }]}>Membres</Text>
        {members.map(m => (
          <View key={m.userId} style={styles.memberRow}>
            <Text style={{ color: theme.colors.text }}>👤 Utilisateur {m.userId.slice(0, 4)}...</Text>
            <Badge label={m.role === 'admin' ? 'Admin' : 'Membre'} color={m.role === 'admin' ? theme.colors.primary : theme.colors.textSecondary} />
          </View>
        ))}
      </Card>

      {!isMember && (
        <Button
          label="Rejoindre le club"
          fullWidth
          onPress={handleJoin}
          loading={joining}
          style={{ marginTop: 20 }}
        />
      )}
      {isMember && (
        <Button
          label="Vous êtes membre"
          variant="secondary"
          disabled
          fullWidth
          style={{ marginTop: 20 }}
        />
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: { padding: 32, alignItems: 'center', borderRadius: 16 },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
});

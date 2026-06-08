import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { UserCircle } from 'phosphor-react-native';
import { useAuth } from '@/context/AuthContext';
import type { UserProfile } from '@/models';
import type { RootStackParamList } from '@/navigation/types';
import { getUserProfile } from '@/services/firebase/database';
import { followUser, isFollowing, unfollowUser } from '@/services/social/friends';
import { useTheme } from '@/theme';
import { Badge, Button, Card, ScreenLayout, useToast } from '@/ui';

type Route = RouteProp<RootStackParamList, 'UserProfile'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'UserProfile'>;

export function UserPublicProfileScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const typography = theme.typography;
  
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();
  const { profile: myProfile } = useAuth();
  const { showToast } = useToast();
  
  const [user, setUser] = useState<UserProfile | null>(null);
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const { userId } = route.params;

  useEffect(() => {
    async function load() {
      try {
        const p = await getUserProfile(userId);
        setUser(p);
        if (myProfile?.id) {
          const f = await isFollowing(myProfile.id, userId);
          setFollowing(f);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId, myProfile?.id]);

  const toggleFollow = async () => {
    if (!myProfile?.id) {
      Alert.alert('Erreur', 'Connectez-vous pour suivre des joueurs.');
      return;
    }
    setActionLoading(true);
    try {
      if (following) {
        await unfollowUser(myProfile.id, userId);
        setFollowing(false);
        showToast('Abonnement supprimé', 'info');
      } else {
        await followUser(myProfile.id, userId);
        setFollowing(true);
        showToast('Vous suivez maintenant ce joueur', 'success');
      }
    } catch {
      showToast('Une erreur est survenue', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenLayout showBack title="Profil">
        <ActivityIndicator color={colors.primary} style={{ marginTop: 100 }} />
      </ScreenLayout>
    );
  }

  if (!user) {
    return (
      <ScreenLayout showBack title="Erreur">
        <Text style={{ color: colors.text, textAlign: 'center', marginTop: 100 }}>
          Utilisateur introuvable.
        </Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBack title={user.pseudo}>
      <Card style={styles.headerCard}>
        <UserCircle size={80} color={colors.primary} weight="thin" />
        <Text style={[typography.title, { color: colors.text, marginTop: 12 }]}>{user.pseudo}</Text>
        {user.activeTitle && (
          <Badge label={user.activeTitle} color={colors.primary} style={{ marginTop: 4 }} />
        )}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={[typography.subtitle, { color: colors.text }]}>{user.elo}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>ELO</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[typography.subtitle, { color: colors.text }]}>{user.xpLevel}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Niveau</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[typography.subtitle, { color: colors.text }]}>{user.wins}</Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Victoires</Text>
          </View>
        </View>
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Valeur actuelle: <Text style={{ color: colors.tokens, fontWeight: 'bold' }}>{user.currentValue} 🟡</Text>
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
          Ratio: {user.wins + user.losses > 0 ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(1) : 0}%
        </Text>
      </Card>

      {myProfile?.id !== userId && (
        <>
          <Button
            label={following ? 'Ne plus suivre' : 'Suivre'}
            variant={following ? 'secondary' : 'primary'}
            fullWidth
            onPress={toggleFollow}
            loading={actionLoading}
            style={styles.btn}
          />
          <Button
            label="Défier (Face-to-face)"
            variant="gold"
            fullWidth
            style={styles.btn}
            onPress={() => navigation.navigate('MatchSetup', { format: 'face_to_face' })}
          />
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  headerCard: { alignItems: 'center', paddingVertical: 24 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginTop: 20 },
  statItem: { alignItems: 'center' },
  btn: { marginTop: 16 },
});

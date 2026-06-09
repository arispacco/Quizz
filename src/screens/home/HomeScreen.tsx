import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, UserCircle, Key } from 'phosphor-react-native';
import { useAuth } from '@/context/AuthContext';
import type { Pack } from '@/models';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { getAllPacks } from '@/services/db/sqlite';
import { joinMatch } from '@/services/online/matchmaking';
import { useTheme } from '@/theme';
import { Badge, Card, FormatCard, ScreenLayout, Button } from '@/ui';
import { DEFAULT_PACKS } from '@/data/defaultPacks';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const { theme } = useTheme();
  const { profile } = useAuth();
  const navigation = useNavigation<Nav>();
  const [packs, setPacks] = useState<Pack[]>(DEFAULT_PACKS);
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    getAllPacks().then(local => {
      if (local.length > 0) setPacks(local);
    });
  }, []);

  const handleJoinMatch = async () => {
    if (!roomCode || roomCode.length < 6) {
      Alert.alert('Erreur', 'Veuillez saisir un code valide (6 caractères).');
      return;
    }

    if (!profile) {
      Alert.alert('Erreur', 'Vous devez être connecté pour rejoindre une partie en ligne.');
      return;
    }

    setIsJoining(true);
    try {
      // Pour l'instant, on suppose que l'ID du match est lié au code (ou on le recherche)
      // En prod, il faudrait une table de correspondance code -> matchId
      // Ici on triche un peu : on utilise le code comme préfixe de l'ID ou on demande l'ID complet
      // Mais dans notre système simple, le code EST le matchId raccourci.
      // On va implémenter une recherche simple ou supposer que matchId = roomCode pour la démo
      // TODO: Implémenter la recherche de match par code
      Alert.alert('Info', 'La recherche par code arrive. Utilisez l\'ID complet pour le test.');
      
      await joinMatch(roomCode.toLowerCase(), profile.id, profile.pseudo);
      navigation.navigate('GameLobby', {
        matchId: roomCode.toLowerCase(),
        // Les paramètres suivants seront écrasés par la souscription dans GameLobby
        settings: {} as any,
        players: [],
      });
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de rejoindre la partie.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <ScreenLayout scroll contentStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
            Bonjour {profile?.pseudo ?? 'Joueur'} 👋
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable hitSlop={8} accessibilityLabel="Notifications">
            <Bell color={theme.colors.textSecondary} size={24} />
          </Pressable>
          <Pressable
            hitSlop={8}
            accessibilityLabel="Mon profil"
            onPress={() => navigation.navigate('Profile')}>
            <UserCircle color={theme.colors.primary} size={28} weight="fill" />
          </Pressable>
        </View>
      </View>

      <Text style={[theme.typography.bodyMedium, styles.sectionTitle, { color: theme.colors.text }]}>
        Jouer maintenant
      </Text>
      <View style={styles.formatRow}>
        <FormatCard
          label="Tournoi"
          subtitle="Bracket"
          color={theme.colors.primary}
          onPress={() => navigation.navigate('MatchSetup', { format: 'tournoi' })}
        />
        <FormatCard
          label="Face-to-face"
          subtitle="Duel"
          color={theme.colors.exchange}
          onPress={() => navigation.navigate('MatchSetup', { format: 'face_to_face' })}
        />
        <FormatCard
          label="All-team"
          subtitle="Équipes"
          color={theme.colors.clubs}
          onPress={() => navigation.navigate('MatchSetup', { format: 'all_team' })}
        />
      </View>

      <Card style={styles.joinCard}>
        <View style={styles.joinHeader}>
          <Key color={theme.colors.primary} size={20} weight="bold" />
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.text, marginLeft: 8 }]}>
            Rejoindre une partie
          </Text>
        </View>
        <View style={styles.joinInputRow}>
          <TextInput
            placeholder="Code de salle"
            placeholderTextColor={theme.colors.textSecondary}
            value={roomCode}
            onChangeText={setRoomCode}
            autoCapitalize="characters"
            style={[
              styles.input,
              {
                backgroundColor: theme.colors.surface,
                color: theme.colors.text,
                borderColor: theme.colors.border,
              },
            ]}
          />
          <Button
            label="OK"
            onPress={handleJoinMatch}
            loading={isJoining}
            style={styles.joinBtn}
          />
        </View>
      </Card>

      <Text style={[theme.typography.bodyMedium, styles.sectionTitle, { color: theme.colors.text }]}>
        Packs populaires
      </Text>
      {packs.slice(0, 3).map(pack => (
        <Pressable key={pack.id} onPress={() => navigation.navigate('PackDetail', { packId: pack.id })}>
          <Card style={styles.packCard} accent="default">
            <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{pack.name}</Text>
            <Badge label={pack.mainTheme} color={theme.colors.primary} />
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 6 }]}>
              {pack.questionCount} questions · {pack.authorPseudo}
              {pack.rating > 0 ? ` · ⭐ ${pack.rating}` : ''}
            </Text>
          </Card>
        </Pressable>
      ))}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  headerLeft: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sectionTitle: { marginBottom: 12, marginTop: 8 },
  formatRow: { flexDirection: 'row', gap: 10 },
  joinCard: { marginTop: 16, padding: 12 },
  joinHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  joinInputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: 'Inter-Medium',
  },
  joinBtn: { minWidth: 60, height: 44 },
  packCard: { marginBottom: 12 },
});

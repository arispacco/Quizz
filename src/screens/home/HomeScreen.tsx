import React, { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Bell, UserCircle } from 'phosphor-react-native';
import { useAuth } from '@/context/AuthContext';
import type { Pack } from '@/models';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import { getAllPacks } from '@/services/db/sqlite';
import { useTheme } from '@/theme';
import { Badge, Card, FormatCard, ScreenLayout } from '@/ui';
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

  useEffect(() => {
    getAllPacks().then(local => {
      if (local.length > 0) setPacks(local);
    });
  }, []);

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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerLeft: { flex: 1 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sectionTitle: { marginBottom: 12, marginTop: 8 },
  formatRow: { flexDirection: 'row', gap: 10 },
  packCard: { marginBottom: 12 },
});

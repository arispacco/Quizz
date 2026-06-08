import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Button, Card, ScreenLayout } from '@/ui';

type Route = RouteProp<RootStackParamList, 'UserProfile'>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'UserProfile'>;

export function UserPublicProfileScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation<Nav>();

  return (
    <ScreenLayout showBack title={`Joueur ${route.params.userId}`}>
      <Card>
        <Text style={{ color: theme.colors.elo }}>ELO: 1280</Text>
        <Text style={{ color: theme.colors.text }}>Victoires: 15 · Défaites: 10</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 8 }]}>
          Valeur actuelle: 120 🟡
        </Text>
      </Card>
      <Button label="Suivre" fullWidth style={styles.btn} />
      <Button
        label="Défier (Face-to-face)"
        variant="secondary"
        fullWidth
        style={styles.btn}
        onPress={() => navigation.navigate('MatchSetup', { format: 'face_to_face' })}
      />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  btn: { marginTop: 16 },
});

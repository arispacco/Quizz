import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GameController, Package } from 'phosphor-react-native';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Button, Card, ScreenLayout } from '@/ui';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export function CreateHubScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <ScreenLayout title="Créer">
      <Card style={styles.card} accent="echange">
        <View style={styles.cardHeader}>
          <GameController color={theme.colors.exchange} size={28} weight="fill" />
          <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginLeft: 12 }]}>
            Créer une partie
          </Text>
        </View>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginVertical: 8 }]}>
          Tournoi, Face-to-face ou All-team — en ligne, local ou mono-appareil
        </Text>
        <Button label="Configurer une partie" onPress={() => navigation.navigate('MatchSetup')} />
      </Card>

      <Card style={styles.card} accent="tokens">
        <View style={styles.cardHeader}>
          <Package color={theme.colors.tokens} size={28} weight="fill" />
          <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginLeft: 12 }]}>
            Créer un pack
          </Text>
        </View>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginVertical: 8 }]}>
          Éditeur manuel ou import IA depuis texte ou audio
        </Text>
        <Button label="Éditeur manuel" onPress={() => navigation.navigate('PackEditor')} />
        <View style={{ height: 8 }} />
        <Button label="Import IA (texte/audio)" variant="secondary" onPress={() => navigation.navigate('PackImport')} />
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: { marginTop: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
});

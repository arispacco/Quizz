import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import type { ConnectionMode, GameFormat, Match, MatchSettings } from '@/models';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Button, Card, FormatCard, ScreenLayout, Stepper } from '@/ui';

type Nav = NativeStackNavigationProp<RootStackParamList, 'MatchSetup'>;
type Route = RouteProp<RootStackParamList, 'MatchSetup'>;

const FORMAT_LABELS: Record<GameFormat, { label: string; subtitle: string; colorKey: 'primary' | 'exchange' | 'clubs' }> = {
  tournoi: { label: 'Tournoi', subtitle: 'Bracket', colorKey: 'primary' },
  face_to_face: { label: 'Face-to-face', subtitle: 'Duel', colorKey: 'exchange' },
  all_team: { label: 'All-team', subtitle: 'Équipes', colorKey: 'clubs' },
};

export function MatchSetupScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState<GameFormat>(route.params?.format ?? 'face_to_face');
  const [connectionMode, setConnectionMode] = useState<ConnectionMode>('mono_device');
  const [exchangeTime, setExchangeTime] = useState(30);
  const [enchereTime, setEnchereTime] = useState(60);
  const [teamCount, setTeamCount] = useState(2);

  const settings: MatchSettings = {
    format,
    connectionMode,
    teamCount,
    playersPerTeam: format === 'face_to_face' ? 1 : 3,
    themePhases: [
      { phase: 'groups', theme: 'Culture Générale', multiplier: 1 },
      { phase: 'quarters', theme: 'Informatique', multiplier: 1.5 },
      { phase: 'final', theme: 'Culture Générale', multiplier: 2 },
    ],
    exchangeTimeSeconds: exchangeTime,
    enchereTimeSeconds: enchereTime,
    spectatorsAllowed: connectionMode === 'online',
    packIds: ['pack-default-1'],
    tournamentFormat: 'groups_then_elimination',
  };

  const launchMatch = () => {
    const matchId = uuidv4();
    const match: Match = {
      id: matchId,
      hostId: profile?.id ?? 'local',
      status: 'lobby',
      settings,
      teams: [],
      players: [
        { id: 'playerA', pseudo: 'Joueur A', tokens: 0, duelsWon: 0, value: 0 },
        { id: 'playerB', pseudo: 'Joueur B', tokens: 0, duelsWon: 0, value: 0 },
      ],
      roomCode: connectionMode === 'local' ? matchId.slice(0, 6).toUpperCase() : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    navigation.navigate('GameLobby', {
      matchId,
      settings,
      players: match.players,
    });
  };

  return (
    <ScreenLayout showBack title={`Paramétrage — Étape ${step}/4`} scroll>
      {step === 1 && (
        <Card>
          <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginBottom: 12 }]}>Format</Text>
          <View style={styles.formatRow}>
            {(['tournoi', 'face_to_face', 'all_team'] as GameFormat[]).map(f => {
              const meta = FORMAT_LABELS[f];
              return (
                <FormatCard
                  key={f}
                  label={meta.label}
                  subtitle={meta.subtitle}
                  color={theme.colors[meta.colorKey]}
                  selected={format === f}
                  onPress={() => setFormat(f)}
                />
              );
            })}
          </View>
          <Text style={[theme.typography.bodyMedium, { color: theme.colors.text, marginTop: 20, marginBottom: 8 }]}>
            Connexion
          </Text>
          {(['mono_device', 'local', 'online'] as ConnectionMode[]).map(m => (
            <Button
              key={m}
              label={m === 'mono_device' ? 'Mono-appareil' : m === 'local' ? 'Local' : 'En ligne'}
              variant={connectionMode === m ? 'primary' : 'ghost'}
              onPress={() => setConnectionMode(m)}
              style={{ marginTop: 6 }}
            />
          ))}
        </Card>
      )}

      {step === 2 && (
        <Card>
          <Stepper label="Nombre d'équipes" value={teamCount} min={2} max={16} onChange={setTeamCount} />
        </Card>
      )}

      {step === 3 && (
        <Card>
          <Stepper label="Temps Échange (s)" value={exchangeTime} min={5} max={120} onChange={setExchangeTime} />
          <Stepper label="Temps Enchère (s)" value={enchereTime} min={15} max={300} onChange={setEnchereTime} />
        </Card>
      )}

      {step === 4 && (
        <Card>
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>
            Format: {FORMAT_LABELS[format].label}
          </Text>
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>
            Mode: {connectionMode === 'mono_device' ? 'Mono-appareil' : connectionMode === 'local' ? 'Local' : 'En ligne'}
          </Text>
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>
            Échange: {exchangeTime}s · Enchère: {enchereTime}s
          </Text>
          <Button label="Lancer la partie" onPress={launchMatch} fullWidth style={{ marginTop: 16 }} />
        </Card>
      )}

      <View style={styles.nav}>
        {step > 1 && <Button label="Précédent" variant="secondary" onPress={() => setStep(s => s - 1)} />}
        {step < 4 && <Button label="Suivant" onPress={() => setStep(s => s + 1)} />}
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  formatRow: { flexDirection: 'row', gap: 10 },
  nav: { flexDirection: 'row', gap: 12, marginTop: 16 },
});

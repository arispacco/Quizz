import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import type { Duel, GameMode } from '@/models';
import { DEFAULT_QUESTIONS } from '@/data/defaultPacks';
import {
  confirmStrategicChoice,
  createDuel as createDuelEngine,
  finishRound,
  handleEnchereAnswer,
  handleEnchereBid,
  handleEnchereFold,
  handleEnchereTimeout,
  handleExchangeAnswer,
  handleExchangeBuzz,
  handleExchangeTimeout,
  isRound3AutoMode,
  startNextRound,
  tickEnchereTimer,
  tickExchangeTimer,
} from '@/game';
import { calculateElo } from '@/services/online/elo';
import { updateProgressionAfterMatch } from '@/services/social/progression';
import { createDuel as createDuelRemote, subscribeToDuel, updateDuel, upsertUserProfile } from '@/services/firebase/database';
import { saveMatchHistory } from '@/services/db/sqlite';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Badge, Button, Card, Chrono, ScreenLayout, useToast } from '@/ui';

type Route = RouteProp<RootStackParamList, 'Duel'>;

function playerLabel(players: Route['params']['players'], id: string): string {
  return players.find(p => p.id === id)?.pseudo ?? id;
}

export function DuelScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { settings, players, local, duelId, matchId } = route.params;
  
  const playerAId = players[0]?.id ?? 'playerA';
  const playerBId = players[1]?.id ?? 'playerB';
  const exchangeTime = settings.exchangeTimeSeconds;
  const enchereTime = settings.enchereTimeSeconds;

  const [duel, setDuel] = useState<Duel | null>(local ? 
    createDuelEngine(duelId, matchId, playerAId, playerBId) : null
  );
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('Culture Générale');
  const [bidAmount, setBidAmount] = useState(1);
  const historySavedRef = useRef(false);

  // Synchronisation Firebase
  useEffect(() => {
    if (local) return;
    const isHost = profile?.id === players[0]?.id;
    const unsub = subscribeToDuel(duelId, (remoteDuel) => {
      if (remoteDuel) {
        setDuel(remoteDuel);
      } else if (isHost) {
        const newDuel = createDuelEngine(duelId, matchId, playerAId, playerBId);
        void createDuelRemote(newDuel);
        setDuel(newDuel);
      }
    });
    return unsub;
  }, [duelId, local, profile?.id, players, playerAId, playerBId, matchId]);

  const applyAction = useCallback(async (action: (prev: Duel) => Duel) => {
    if (!duel) return;
    const nextDuel = action(duel);
    if (local) {
      setDuel(nextDuel);
    } else {
      await updateDuel(duelId, nextDuel);
    }
  }, [duel, duelId, local]);

  const round3Auto = duel ? isRound3AutoMode(duel.currentRound) : false;
  const effectiveMode = round3Auto ? duel?.currentRound.mode! : selectedMode;

  useEffect(() => {
    if (round3Auto && duel?.currentRound.mode) {
      setSelectedMode(duel.currentRound.mode);
    }
  }, [round3Auto, duel?.currentRound.mode, duel?.currentRound.roundNumber]);

  const question = useMemo(
    () => DEFAULT_QUESTIONS.find(q => q.theme === selectedTheme) ?? DEFAULT_QUESTIONS[0],
    [selectedTheme],
  );

  const isTimerMaster = local || (profile?.id === players[0]?.id);

  const tick = useCallback(() => {
    if (!duel || !isTimerMaster || duel.status !== 'playing') return;
    if (duel.exchange) {
      const next = tickExchangeTimer(duel);
      if (next.exchange?.timeRemaining !== duel.exchange.timeRemaining || next.status !== duel.status) {
        applyAction(() => next);
      }
    } else if (duel.enchere?.phase === 'answering') {
      const next = tickEnchereTimer(duel);
      if (next.enchere?.timeRemaining !== duel.enchere.timeRemaining || next.status !== duel.status) {
        applyAction(() => next);
      }
    }
  }, [duel, isTimerMaster, applyAction]);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    if (!duel || duel.status !== 'finished' || historySavedRef.current) return;
    historySavedRef.current = true;

    const winsA = duel.roundWins[playerAId] ?? 0;
    const winsB = duel.roundWins[playerBId] ?? 0;
    const localPlayerId = profile?.id ?? playerAId;
    const opponentId = getOpponentId(duel, localPlayerId);
    const result = duel.winnerId === localPlayerId ? 'win' : duel.winnerId === opponentId ? 'loss' : 'draw';

    void saveMatchHistory({
      id: uuidv4(),
      format: settings.format,
      connectionMode: settings.connectionMode,
      opponentPseudo: playerLabel(players, opponentId),
      result,
      score: `${winsA}-${winsB}`,
      playedAt: new Date().toISOString(),
    });

    if (profile && !local) {
      async function updateStats() {
        try {
          const { leveledUp } = await updateProgressionAfterMatch(profile, result);
          if (leveledUp) showToast('Niveau supérieur ! 🏆', 'success');
          const opponent = players.find(p => p.id === opponentId);
          if (settings.connectionMode === 'online' && opponent) {
            const { delta } = calculateElo(profile.elo, 1200, result);
            await upsertUserProfile({ ...profile, elo: profile.elo + delta });
          }
        } catch (error) {
          console.error('Erreur stats:', error);
        }
      }
      updateStats();
    }
  }, [duel, playerAId, playerBId, players, settings, profile, local, showToast]);

  if (!duel) {
    return (
      <ScreenLayout title="Duel">
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 100 }} />
      </ScreenLayout>
    );
  }

  const isMyTurnToChoose = duel.status === 'choosing' && duel.currentRound.chooserId === profile?.id;
  const isReferee = local || (profile?.id === players[0]?.id);

  const confirmChoice = () => {
    const mode = effectiveMode;
    if (!mode) return;
    applyAction(prev => confirmStrategicChoice(prev, mode, selectedTheme, question, exchangeTime));
  };

  const renderScoreboard = () => {
    const winsA = duel.roundWins[playerAId] ?? 0;
    const winsB = duel.roundWins[playerBId] ?? 0;
    return (
      <Card style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreSide}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{playerLabel(players, playerAId)}</Text>
            <Text style={[theme.typography.title, { color: winsA > winsB ? theme.colors.success : theme.colors.text }]}>{winsA}</Text>
          </View>
          <Text style={[theme.typography.mono, { color: theme.colors.textSecondary }]}>—</Text>
          <View style={styles.scoreSide}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>{playerLabel(players, playerBId)}</Text>
            <Text style={[theme.typography.title, { color: winsB > winsA ? theme.colors.success : theme.colors.text }]}>{winsB}</Text>
          </View>
        </View>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
          Tour {duel.currentRound.roundNumber}/3
        </Text>
      </Card>
    );
  };

  const renderChoosing = () => (
    <Card>
      <Text style={[theme.typography.body, { color: theme.colors.text }]}>
        {round3Auto ? 'Tour décisif — mode imposé' : `Au tour de ${playerLabel(players, duel.currentRound.chooserId)} de choisir`}
      </Text>
      <View style={styles.modeRow}>
        <Button label="Échange" variant={effectiveMode === 'echange' ? 'primary' : 'secondary'} onPress={() => !round3Auto && setSelectedMode('echange')} disabled={round3Auto && duel.currentRound.mode !== 'echange'} />
        <Button label="Enchère" variant={effectiveMode === 'enchere' ? 'gold' : 'secondary'} onPress={() => !round3Auto && setSelectedMode('enchere')} disabled={round3Auto && duel.currentRound.mode !== 'enchere'} />
      </View>
      <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 12 }]}>Thème</Text>
      {['Culture Générale', 'Informatique', 'Alimentation'].map(t => (
        <Button key={t} label={t} variant={selectedTheme === t ? 'primary' : 'ghost'} onPress={() => setSelectedTheme(t)} />
      ))}
      {(isMyTurnToChoose || isReferee) ? (
        <Button label="Confirmer" onPress={confirmChoice} fullWidth style={{ marginTop: 12 }} disabled={!effectiveMode} />
      ) : (
        <Text style={{ color: theme.colors.textSecondary, textAlign: 'center', marginTop: 12 }}>Attente du choix...</Text>
      )}
    </Card>
  );

  const renderExchange = () => {
    const remaining = duel.exchange?.timeRemaining ?? 0;
    return (
      <Card accent="echange">
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{duel.currentRound.questionText}</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginVertical: 8 }]}>Joueur actif : {playerLabel(players, duel.exchange?.activePlayerId ?? '')}</Text>
        <View style={styles.chronoWrap}>
          <Chrono totalSeconds={exchangeTime} remainingSeconds={remaining} size={140} />
        </View>
        {isReferee && (
          <View style={styles.modeRow}>
            <Button label="Valide" onPress={() => applyAction(prev => handleExchangeAnswer(prev, 'réponse', true, exchangeTime))} />
            <Button label="Invalide" variant="secondary" onPress={() => applyAction(prev => handleExchangeAnswer(prev, 'réponse', false, exchangeTime))} />
            <Button label="Buzz" variant="gold" onPress={() => applyAction(prev => handleExchangeBuzz(prev))} />
          </View>
        )}
      </Card>
    );
  };

  const renderEnchere = () => {
    const e = duel.enchere!;
    if (e.phase === 'bidding') {
      const isMyTurnToBid = e.activeBidderId === profile?.id;
      return (
        <Card accent="enchere">
          <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>{duel.currentRound.questionText}</Text>
          <Text style={[theme.typography.mono, { color: theme.colors.tokens, textAlign: 'center', fontSize: 24, marginVertical: 12 }]}>Enchère : {e.currentBid}</Text>
          {(isMyTurnToBid || isReferee) && (
            <View style={styles.modeRow}>
              <Button label={`Surenchérir (${bidAmount})`} variant="gold" onPress={() => {
                const nextBid = Math.max(bidAmount, e.currentBid + 1);
                setBidAmount(nextBid + 1);
                applyAction(prev => handleEnchereBid(prev, nextBid));
              }} />
              <Button label="Se coucher" variant="danger" onPress={() => applyAction(prev => handleEnchereFold(prev, enchereTime))} />
            </View>
          )}
        </Card>
      );
    }
    return (
      <Card accent="enchere">
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>{playerLabel(players, e.winnerId ?? '')} doit donner {e.promisedCount} réponses</Text>
        <View style={styles.chronoWrap}>
          <Chrono totalSeconds={enchereTime} remainingSeconds={e.timeRemaining} size={140} />
        </View>
        {isReferee && (
          <View style={styles.modeRow}>
            <Button label="Réponse Valide" onPress={() => applyAction(prev => handleEnchereAnswer(prev, `réponse ${(prev.enchere?.answersGiven.length ?? 0) + 1}`))} />
            <Button label="Temps écoulé" variant="danger" onPress={() => applyAction(prev => handleEnchereTimeout(prev, true))} />
          </View>
        )}
      </Card>
    );
  };

  const renderFinished = () => (
    <Card>
      <Text style={[theme.typography.title, { color: theme.colors.primary }]}>FIN DU DUEL</Text>
      <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginTop: 8 }]}>{playerLabel(players, duel.winnerId ?? '')} gagne !</Text>
      <Button label="Retour au menu" variant="secondary" onPress={() => navigation.navigate('Main' as any)} style={{ marginTop: 16 }} />
    </Card>
  );

  return (
    <ScreenLayout scroll title="Duel">
      {renderScoreboard()}
      {duel.status === 'choosing' && renderChoosing()}
      {duel.status === 'playing' && duel.currentRound.mode === 'echange' && renderExchange()}
      {duel.status === 'playing' && duel.currentRound.mode === 'enchere' && renderEnchere()}
      {duel.status === 'round_result' && (
        <Card>
          <Text style={[theme.typography.title, { color: theme.colors.success }]}>Tour terminé !</Text>
          {isReferee && <Button label="Tour suivant" onPress={() => applyAction(prev => startNextRound(prev))} style={{ marginTop: 12 }} />}
        </Card>
      )}
      {duel.status === 'finished' && renderFinished()}
    </ScreenLayout>
  );
}

function getOpponentId(duel: Duel, playerId: string): string {
  return playerId === duel.playerAId ? duel.playerBId : duel.playerAId;
}

const styles = StyleSheet.create({
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  scoreCard: { marginBottom: 16 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginBottom: 8 },
  scoreSide: { alignItems: 'center', minWidth: 80 },
  chronoWrap: { alignItems: 'center', marginVertical: 12 },
});

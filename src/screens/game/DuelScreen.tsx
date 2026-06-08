import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import type { Duel, GameMode } from '@/models';
import { DEFAULT_QUESTIONS } from '@/data/defaultPacks';
import {
  confirmStrategicChoice,
  createDuel,
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
import { saveMatchHistory } from '@/services/db/sqlite';
import type { RootStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Badge, Button, Card, Chrono } from '@/ui';

type Route = RouteProp<RootStackParamList, 'Duel'>;

function playerLabel(players: Route['params']['players'], id: string): string {
  return players.find(p => p.id === id)?.pseudo ?? id;
}

export function DuelScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
  const { settings, players } = route.params;
  const playerAId = players[0]?.id ?? 'playerA';
  const playerBId = players[1]?.id ?? 'playerB';
  const exchangeTime = settings.exchangeTimeSeconds;
  const enchereTime = settings.enchereTimeSeconds;

  const [duel, setDuel] = useState<Duel>(() =>
    createDuel(route.params.duelId, route.params.matchId, playerAId, playerBId),
  );
  const [selectedMode, setSelectedMode] = useState<GameMode | null>(null);
  const [selectedTheme, setSelectedTheme] = useState('Culture Générale');
  const [bidAmount, setBidAmount] = useState(1);
  const historySavedRef = useRef(false);

  const round3Auto = isRound3AutoMode(duel.currentRound);
  const effectiveMode = round3Auto ? duel.currentRound.mode! : selectedMode;

  useEffect(() => {
    if (round3Auto && duel.currentRound.mode) {
      setSelectedMode(duel.currentRound.mode);
    }
  }, [round3Auto, duel.currentRound.mode, duel.currentRound.roundNumber]);

  const question = useMemo(
    () => DEFAULT_QUESTIONS.find(q => q.theme === selectedTheme) ?? DEFAULT_QUESTIONS[0],
    [selectedTheme],
  );

  const tick = useCallback(() => {
    setDuel(prev => {
      if (prev.exchange && prev.status === 'playing') {
        return tickExchangeTimer(prev);
      }
      if (prev.enchere?.phase === 'answering') {
        return tickEnchereTimer(prev);
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [tick]);

  useEffect(() => {
    if (duel.status !== 'finished' || historySavedRef.current) return;
    historySavedRef.current = true;

    const winsA = duel.roundWins[playerAId] ?? 0;
    const winsB = duel.roundWins[playerBId] ?? 0;
    const localPlayerId = playerAId;
    const opponentId = playerBId;
    const localWon = duel.winnerId === localPlayerId;

    void saveMatchHistory({
      id: uuidv4(),
      format: settings.format,
      connectionMode: settings.connectionMode,
      opponentPseudo: playerLabel(players, opponentId),
      result: localWon ? 'win' : duel.winnerId === opponentId ? 'loss' : 'draw',
      score: `${winsA}-${winsB}`,
      playedAt: new Date().toISOString(),
    });
  }, [duel.status, duel.winnerId, duel.roundWins, playerAId, playerBId, players, settings]);

  const confirmChoice = () => {
    const mode = effectiveMode;
    if (!mode) return;
    setDuel(prev =>
      confirmStrategicChoice(prev, mode, selectedTheme, question, exchangeTime),
    );
  };

  const renderScoreboard = () => {
    const winsA = duel.roundWins[playerAId] ?? 0;
    const winsB = duel.roundWins[playerBId] ?? 0;
    const leadingA = winsA > winsB;
    const leadingB = winsB > winsA;

    return (
      <Card style={styles.scoreCard}>
        <View style={styles.scoreRow}>
          <View style={styles.scoreSide}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {playerLabel(players, playerAId)}
            </Text>
            <Text
              style={[
                theme.typography.title,
                { color: leadingA ? theme.colors.success : theme.colors.text },
              ]}
            >
              {winsA}
            </Text>
          </View>
          <Text style={[theme.typography.mono, { color: theme.colors.textSecondary }]}>—</Text>
          <View style={styles.scoreSide}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {playerLabel(players, playerBId)}
            </Text>
            <Text
              style={[
                theme.typography.title,
                { color: leadingB ? theme.colors.success : theme.colors.text },
              ]}
            >
              {winsB}
            </Text>
          </View>
        </View>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
          Best of 3 · Tour {duel.currentRound.roundNumber}/3
        </Text>
      </Card>
    );
  };

  const renderChoosing = () => (
    <Card>
      <Text style={[theme.typography.body, { color: theme.colors.text }]}>
        {round3Auto
          ? 'Tour décisif — le système impose le mode'
          : `Au tour de ${playerLabel(players, duel.currentRound.chooserId)} de choisir`}
      </Text>
      <View style={styles.modeRow}>
        <Button
          label="Échange"
          variant={effectiveMode === 'echange' ? 'primary' : 'secondary'}
          onPress={() => !round3Auto && setSelectedMode('echange')}
          disabled={round3Auto && duel.currentRound.mode !== 'echange'}
        />
        <Button
          label="Enchère"
          variant={effectiveMode === 'enchere' ? 'gold' : 'secondary'}
          onPress={() => !round3Auto && setSelectedMode('enchere')}
          disabled={round3Auto && duel.currentRound.mode !== 'enchere'}
        />
      </View>
      {round3Auto && effectiveMode && (
        <Badge
          label={`Mode imposé : ${effectiveMode === 'echange' ? 'Échange' : 'Enchère'}`}
          color={effectiveMode === 'echange' ? theme.colors.exchange : theme.colors.enchere}
        />
      )}
      <Text style={[theme.typography.body, { color: theme.colors.text, marginTop: 12 }]}>Thème</Text>
      {['Culture Générale', 'Informatique', 'Alimentation'].map(t => (
        <Button
          key={t}
          label={t}
          variant={selectedTheme === t ? 'primary' : 'ghost'}
          onPress={() => setSelectedTheme(t)}
        />
      ))}
      <Button
        label="Confirmer"
        onPress={confirmChoice}
        fullWidth
        style={{ marginTop: 12 }}
        disabled={!effectiveMode}
      />
    </Card>
  );

  const renderExchange = () => {
    const remaining = duel.exchange?.timeRemaining ?? 0;
    const urgent = remaining <= Math.ceil(exchangeTime * 0.2);

    return (
      <Card accent="echange">
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
          {duel.currentRound.questionText}
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginVertical: 8 }]}>
          Joueur actif : {playerLabel(players, duel.exchange?.activePlayerId ?? '')}
          {duel.exchange?.buzzed ? ' · Buzz' : ''}
        </Text>
        <View style={styles.chronoWrap}>
          <Chrono totalSeconds={exchangeTime} remainingSeconds={remaining} size={urgent ? 160 : 140} />
          {urgent && (
            <Text style={[theme.typography.caption, { color: theme.colors.danger, marginTop: 8 }]}>
              Temps critique !
            </Text>
          )}
        </View>
        {duel.exchange?.answers.map((a, i) => (
          <Text key={i} style={{ color: a.valid ? theme.colors.success : theme.colors.danger }}>
            {playerLabel(players, a.playerId)} : {a.answer} {a.valid ? '✓' : '✗'}
          </Text>
        ))}
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 8 }]}>
          Arbitre
        </Text>
        <View style={styles.modeRow}>
          <Button
            label="Valide"
            onPress={() =>
              setDuel(prev => handleExchangeAnswer(prev, 'réponse', true, exchangeTime))
            }
          />
          <Button
            label="Invalide"
            variant="secondary"
            onPress={() =>
              setDuel(prev => handleExchangeAnswer(prev, 'réponse', false, exchangeTime))
            }
          />
          <Button
            label="Buzz"
            variant="gold"
            onPress={() => setDuel(prev => handleExchangeBuzz(prev))}
          />
        </View>
        <View style={styles.modeRow}>
          <Button
            label="Perd le tour"
            variant="danger"
            onPress={() =>
              setDuel(prev =>
                finishRound(
                  prev,
                  getOpponentForExchange(prev),
                ),
              )
            }
          />
          <Button
            label="Temps écoulé"
            variant="ghost"
            onPress={() => setDuel(prev => handleExchangeTimeout(prev, true))}
          />
        </View>
      </Card>
    );
  };

  const renderEnchere = () => {
    const e = duel.enchere!;
    if (e.phase === 'bidding') {
      return (
        <Card accent="enchere">
          <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
            {duel.currentRound.questionText}
          </Text>
          <Text style={[theme.typography.mono, { color: theme.colors.tokens, textAlign: 'center' }]}>
            Enchère : {e.currentBid}
          </Text>
          <Text style={{ color: theme.colors.textSecondary }}>
            À {playerLabel(players, e.activeBidderId)}
          </Text>
          <View style={styles.modeRow}>
            <Button
              label={`Surenchérir (${bidAmount})`}
              variant="gold"
              onPress={() => {
                const nextBid = Math.max(bidAmount, e.currentBid + 1);
                setBidAmount(nextBid + 1);
                setDuel(prev => handleEnchereBid(prev, nextBid));
              }}
            />
            <Button
              label="Se coucher"
              variant="danger"
              onPress={() => setDuel(prev => handleEnchereFold(prev, enchereTime))}
            />
          </View>
        </Card>
      );
    }

    const urgent = e.timeRemaining <= Math.ceil(enchereTime * 0.2);
    return (
      <Card accent="enchere">
        <Text style={[theme.typography.body, { color: theme.colors.text }]}>
          {playerLabel(players, e.winnerId ?? '')} doit donner {e.promisedCount} réponses
        </Text>
        <View style={styles.chronoWrap}>
          <Chrono totalSeconds={enchereTime} remainingSeconds={e.timeRemaining} size={urgent ? 160 : 140} />
        </View>
        <Text style={{ color: theme.colors.textSecondary }}>
          {e.answersGiven.length}/{e.promisedCount} réponses
        </Text>
        <Button
          label="Ajouter réponse"
          onPress={() =>
            setDuel(prev =>
              handleEnchereAnswer(prev, `réponse ${(prev.enchere?.answersGiven.length ?? 0) + 1}`),
            )
          }
        />
        <Button
          label="Fin du chrono"
          variant="danger"
          onPress={() => setDuel(prev => handleEnchereTimeout(prev, true))}
        />
      </Card>
    );
  };

  const renderRoundResult = () => (
    <Card>
      <Text style={[theme.typography.title, { color: theme.colors.success }]}>Tour terminé !</Text>
      <Text style={{ color: theme.colors.text }}>
        Vainqueur du tour : {playerLabel(players, duel.currentRound.winnerId ?? '')}
      </Text>
      <Button label="Tour suivant" onPress={() => setDuel(prev => startNextRound(prev))} />
    </Card>
  );

  const renderFinished = () => (
    <Card>
      <Text style={[theme.typography.decorative, { color: theme.colors.primary }]}>VICTOIRE</Text>
      <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
        {playerLabel(players, duel.winnerId ?? '')} remporte le duel !
      </Text>
      <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>
        Score final : {duel.roundWins[playerAId] ?? 0} - {duel.roundWins[playerBId] ?? 0}
      </Text>
      <Badge label="Historique enregistré" color={theme.colors.tokens} />
    </Card>
  );

  return (
    <ScrollView style={{ backgroundColor: theme.colors.background }} contentContainerStyle={styles.container}>
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>Duel</Text>
      <Text style={{ color: theme.colors.textSecondary, marginBottom: 12 }}>
        {duel.status === 'choosing' ? 'Choix stratégique' : duel.status}
      </Text>

      {renderScoreboard()}

      {duel.status === 'choosing' && renderChoosing()}
      {duel.status === 'playing' && duel.currentRound.mode === 'echange' && renderExchange()}
      {duel.status === 'playing' && duel.currentRound.mode === 'enchere' && renderEnchere()}
      {duel.status === 'round_result' && renderRoundResult()}
      {duel.status === 'finished' && renderFinished()}
    </ScrollView>
  );
}

function getOpponentForExchange(duel: Duel): string {
  const active = duel.exchange?.activePlayerId ?? duel.playerAId;
  return active === duel.playerAId ? duel.playerBId : duel.playerAId;
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 56 },
  modeRow: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  scoreCard: { marginBottom: 16 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  scoreSide: { alignItems: 'center', minWidth: 80 },
  chronoWrap: { alignItems: 'center', marginVertical: 12 },
});

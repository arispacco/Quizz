import React, { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { Pack, Question } from '@/models';
import type { RootStackParamList } from '@/navigation/types';
import { DEFAULT_PACKS, DEFAULT_QUESTIONS } from '@/data/defaultPacks';
import { getPackById, getPackQuestions } from '@/services/db/sqlite';
import { useTheme } from '@/theme';
import { Badge, Card, ScreenLayout } from '@/ui';

type Route = RouteProp<RootStackParamList, 'PackDetail'>;

export function PackDetailScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
  const [pack, setPack] = useState<Pack | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);

  useEffect(() => {
    getPackById(route.params.packId).then(p => {
      if (p) {
        setPack(p);
        getPackQuestions(p.id).then(setQuestions);
      } else {
        const def = DEFAULT_PACKS.find(dp => dp.id === route.params.packId);
        setPack(def ?? null);
        if (def) setQuestions(DEFAULT_QUESTIONS);
      }
    });
  }, [route.params.packId]);

  if (!pack) {
    return (
      <ScreenLayout showBack title="Pack">
        <Text style={{ color: theme.colors.textSecondary }}>Pack introuvable</Text>
      </ScreenLayout>
    );
  }

  return (
    <ScreenLayout showBack title={pack.name} scroll>
      <Badge label={pack.mainTheme} />
      <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginVertical: 12 }]}>
        {pack.description}
      </Text>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
        Par {pack.authorPseudo} · {pack.questionCount} questions · ⭐ {pack.rating}
      </Text>

      <Text style={[theme.typography.subtitle, { color: theme.colors.text, marginTop: 24 }]}>Aperçu</Text>
      {questions.slice(0, 5).map(q => (
        <Card key={q.id} style={{ marginTop: 8 }}>
          <Text style={[theme.typography.body, { color: theme.colors.text }]}>{q.intitule}</Text>
        </Card>
      ))}
    </ScreenLayout>
  );
}

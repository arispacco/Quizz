import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import type { Pack, PackVisibility, Question } from '@/models';
import type { RootStackParamList } from '@/navigation/types';
import { getPackById, getPackQuestions, savePack } from '@/services/db/sqlite';
import { useTheme } from '@/theme';
import { Button, Card, Input, ScreenLayout, useToast } from '@/ui';

type Route = RouteProp<RootStackParamList, 'PackEditor'>;

export function PackEditorScreen() {
  const { theme } = useTheme();
  const route = useRoute<Route>();
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [mainTheme, setMainTheme] = useState('Culture Générale');
  const [visibility, setVisibility] = useState<PackVisibility>('private');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [draftIntitule, setDraftIntitule] = useState('');
  const [draftReponses, setDraftReponses] = useState('');

  useEffect(() => {
    if (route.params?.packId) {
      getPackById(route.params.packId).then(pack => {
        if (pack) {
          setName(pack.name);
          setDescription(pack.description);
          setMainTheme(pack.mainTheme);
          setVisibility(pack.visibility);
        }
      });
      getPackQuestions(route.params.packId).then(setQuestions);
    }
  }, [route.params?.packId]);

  const addQuestion = () => {
    if (!draftIntitule.trim()) {
      showToast('L\'intitulé de la question est requis', 'error');
      return;
    }
    const q: Question = {
      id: uuidv4(),
      intitule: draftIntitule.trim(),
      theme: mainTheme,
      difficulty: 3,
      reponses: draftReponses.split(',').map(r => r.trim()).filter(Boolean),
      createdAt: new Date().toISOString(),
    };
    setQuestions(prev => [...prev, q]);
    setDraftIntitule('');
    setDraftReponses('');
  };

  const save = async () => {
    if (!name.trim()) {
      showToast('Le nom du pack est requis', 'error');
      return;
    }
    if (questions.length === 0) {
      showToast('Ajoutez au moins une question', 'error');
      return;
    }

    const now = new Date().toISOString();
    const pack: Pack = {
      id: route.params?.packId ?? uuidv4(),
      name: name.trim(),
      description,
      mainTheme,
      coverColor: '#7C3AED',
      authorId: profile?.id ?? 'local',
      authorPseudo: profile?.pseudo ?? 'Joueur',
      visibility,
      questionCount: questions.length,
      averageDifficulty: 3,
      rating: 0,
      downloaded: true,
      createdAt: now,
      updatedAt: now,
    };
    await savePack(pack, questions);
    showToast('Pack enregistré', 'success');
    navigation.goBack();
  };

  return (
    <ScreenLayout showBack title="Éditeur de pack" scroll>
      <Input label="Nom du pack" value={name} onChangeText={setName} />
      <Input label="Description" value={description} onChangeText={setDescription} />
      <Input label="Thème principal" value={mainTheme} onChangeText={setMainTheme} />
      <View style={styles.row}>
        <Button
          label="Privé"
          variant={visibility === 'private' ? 'primary' : 'secondary'}
          onPress={() => setVisibility('private')}
        />
        <Button
          label="Public"
          variant={visibility === 'public' ? 'primary' : 'secondary'}
          onPress={() => setVisibility('public')}
        />
      </View>

      <Card style={{ marginTop: 16 }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>
          Ajouter une question ({questions.length})
        </Text>
        <Input label="Intitulé" value={draftIntitule} onChangeText={setDraftIntitule} />
        <Input label="Réponses (séparées par virgule)" value={draftReponses} onChangeText={setDraftReponses} />
        <Button label="Ajouter" onPress={addQuestion} />
      </Card>

      <FlatList
        data={questions}
        keyExtractor={q => q.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Card style={{ marginTop: 8 }}>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.text }]}>{item.intitule}</Text>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {item.reponses.join(', ')}
            </Text>
          </Card>
        )}
      />

      <Button label="Enregistrer le pack" onPress={save} fullWidth style={{ marginTop: 20 }} />
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
});

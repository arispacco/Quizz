import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import DocumentPicker from 'react-native-document-picker';
import { useNavigation } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/context/AuthContext';
import type { Pack, Question } from '@/models';
import { generateQuestionsFromText } from '@/services/ai';
import { savePack } from '@/services/db/sqlite';
import { useTheme } from '@/theme';
import { Button, Card, Input, ScreenLayout, useToast } from '@/ui';

export function PackImportScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState<Omit<Question, 'id' | 'createdAt'>[]>([]);
  const [packName, setPackName] = useState('Pack IA');

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.plainText, DocumentPicker.types.allFiles],
      });
      if (result.uri) {
        const response = await fetch(result.uri);
        const content = await response.text();
        setText(content);
      }
    } catch (e) {
      if (!DocumentPicker.isCancel(e)) {
        showToast('Erreur lors de l\'import', 'error');
      }
    }
  };

  const analyze = async () => {
    if (!text.trim()) {
      showToast('Ajoutez du contenu source', 'error');
      return;
    }
    setLoading(true);
    try {
      const result = await generateQuestionsFromText({ text, count: 5 });
      setGenerated(result.questions);
      showToast(`${result.questions.length} questions générées`, 'success');
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : 'IA indisponible — vérifiez Firebase Functions',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  const validateAndSave = async () => {
    const now = new Date().toISOString();
    const packId = uuidv4();
    const questions: Question[] = generated.map(q => ({
      ...q,
      id: uuidv4(),
      createdAt: now,
    }));
    const pack: Pack = {
      id: packId,
      name: packName,
      description: 'Généré par IA',
      mainTheme: questions[0]?.theme ?? 'Culture Générale',
      coverColor: '#7C3AED',
      authorId: profile?.id ?? 'local',
      authorPseudo: profile?.pseudo ?? 'Joueur',
      visibility: 'private',
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
    <ScreenLayout showBack title="Import IA" scroll>
      <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
        Importez un fichier texte ou collez du contenu. L'IA génère des questions à valider.
      </Text>

      <Button label="Importer un fichier" variant="secondary" onPress={pickFile} fullWidth style={{ marginTop: 12 }} />
      <Input
        label="Contenu source"
        value={text}
        onChangeText={setText}
        multiline
        style={{ minHeight: 120, textAlignVertical: 'top' }}
      />

      {loading ? (
        <View style={styles.loading}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={{ color: theme.colors.textSecondary, marginTop: 8 }}>Analyse en cours...</Text>
        </View>
      ) : (
        <Button label="Générer les questions" onPress={analyze} fullWidth />
      )}

      {generated.length > 0 && (
        <>
          <Input label="Nom du pack" value={packName} onChangeText={setPackName} />
          {generated.map((q, i) => (
            <Card key={i} style={{ marginTop: 8 }}>
              <Input
                value={q.intitule}
                onChangeText={val => {
                  const copy = [...generated];
                  copy[i] = { ...copy[i], intitule: val };
                  setGenerated(copy);
                }}
              />
              <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
                Réponses: {q.reponses.join(', ')}
              </Text>
            </Card>
          ))}
          <Button label="Valider et enregistrer" onPress={validateAndSave} fullWidth style={{ marginTop: 16 }} />
        </>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  loading: { alignItems: 'center', marginVertical: 20 },
});

import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/theme';
import { Button, Input, useToast } from '@/ui';

export function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const { sendReset } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    setLoading(true);
    try {
      await sendReset(email);
      showToast('Email de réinitialisation envoyé', 'success');
      navigation.goBack();
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>Mot de passe oublié</Text>
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Button label="Envoyer le lien" onPress={handleReset} loading={loading} fullWidth />
      <Button label="Retour" variant="ghost" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, gap: 12 },
});

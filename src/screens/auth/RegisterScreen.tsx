import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import type { AuthStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Button, Input, useToast } from '@/ui';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export function RegisterScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { signUp } = useAuth();
  const { showToast } = useToast();
  const [pseudo, setPseudo] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirm) {
      showToast('Les mots de passe ne correspondent pas', 'error');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, pseudo);
      showToast('Compte créé avec succès', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur inscription', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}>
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>Inscription</Text>
      <Input label="Pseudo" value={pseudo} onChangeText={setPseudo} />
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      <Input label="Confirmation" value={confirm} onChangeText={setConfirm} secureTextEntry />
      <Button label="S'inscrire" onPress={handleRegister} loading={loading} fullWidth />
      <Button label="Déjà un compte ?" variant="ghost" onPress={() => navigation.navigate('Login')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, gap: 8 },
});

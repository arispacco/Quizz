import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import type { AuthStackParamList } from '@/navigation/types';
import { useTheme } from '@/theme';
import { Button, Input, useToast } from '@/ui';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export function LoginScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { signIn } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signIn(email, password);
      showToast('Connexion réussie', 'success');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur de connexion', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={styles.container}>
      <Text style={[theme.typography.title, { color: theme.colors.text }]}>Connexion</Text>
      <Input label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      <Button label="Mot de passe oublié" variant="ghost" onPress={() => navigation.navigate('ForgotPassword')} />
      <Button label="Se connecter" onPress={handleLogin} loading={loading} fullWidth />
      <Button label="Créer un compte" variant="secondary" onPress={() => navigation.navigate('Register')} fullWidth />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, gap: 8 },
});

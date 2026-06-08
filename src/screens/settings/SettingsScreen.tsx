import React from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useTheme } from '@/theme';
import { Card, ScreenLayout } from '@/ui';

export function SettingsScreen() {
  const { theme, mode, toggleTheme } = useTheme();

  return (
    <ScreenLayout showBack title="Paramètres" scroll>
      <Card style={{ marginTop: 8 }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>Apparence</Text>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.text }}>Thème sombre</Text>
          <Switch value={mode === 'dark'} onValueChange={toggleTheme} />
        </View>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>Notifications</Text>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.text }}>Invitations</Text>
          <Switch value={true} />
        </View>
        <View style={styles.row}>
          <Text style={{ color: theme.colors.text }}>Résultats de partie</Text>
          <Switch value={true} />
        </View>
      </Card>

      <Card style={{ marginTop: 12 }}>
        <Text style={[theme.typography.subtitle, { color: theme.colors.text }]}>À propos</Text>
        <Text style={{ color: theme.colors.textSecondary }}>Le Jeu v0.0.1</Text>
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 },
});

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { DEFAULT_PACKS, DEFAULT_QUESTIONS } from '@/data/defaultPacks';
import { AuthProvider } from '@/context/AuthContext';
import { RootNavigator } from '@/navigation';
import { getAllPacks, initDatabase, savePack } from '@/services/db/sqlite';
import { ThemeProvider, useTheme } from '@/theme';
import { ToastProvider } from '@/ui';

function AppShell() {
  const { mode } = useTheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar barStyle={mode === 'dark' ? 'light-content' : 'dark-content'} />
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Bootstrap({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function bootstrap() {
      try {
        await initDatabase();
        const packs = await getAllPacks();
        if (packs.length === 0) {
          await savePack(DEFAULT_PACKS[0], DEFAULT_QUESTIONS);
        }
      } catch {
        // SQLite peut échouer en tests — l'app reste utilisable
      } finally {
        setReady(true);
      }
    }
    void bootstrap();
  }, []);

  if (!ready) {
    return (
      <View style={[styles.loader, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <Bootstrap>
            <AppShell />
          </Bootstrap>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  loader: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

export default App;

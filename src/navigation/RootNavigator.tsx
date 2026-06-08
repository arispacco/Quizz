import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/context/AuthContext';
import { ClubDetailScreen } from '@/screens/social/ClubDetailScreen';
import { DuelScreen } from '@/screens/game/DuelScreen';
import { GameLobbyScreen } from '@/screens/game/GameLobbyScreen';
import { MatchSetupScreen } from '@/screens/create/MatchSetupScreen';
import { MercatoScreen } from '@/screens/tournament/MercatoScreen';
import { PackDetailScreen } from '@/screens/create/PackDetailScreen';
import { PackEditorScreen } from '@/screens/create/PackEditorScreen';
import { PackImportScreen } from '@/screens/create/PackImportScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { SpectatorScreen } from '@/screens/game/SpectatorScreen';
import { TournamentBracketScreen } from '@/screens/tournament/TournamentBracketScreen';
import { UserPublicProfileScreen } from '@/screens/profile/UserPublicProfileScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabs } from './MainTabs';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { profile, loading, isDemoMode } = useAuth();

  if (loading) {
    return null;
  }

  const isAuthenticated = Boolean(profile) || isDemoMode;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabs} />
          <Stack.Screen name="MatchSetup" component={MatchSetupScreen} />
          <Stack.Screen name="PackEditor" component={PackEditorScreen} />
          <Stack.Screen name="PackDetail" component={PackDetailScreen} />
          <Stack.Screen name="PackImport" component={PackImportScreen} />
          <Stack.Screen name="GameLobby" component={GameLobbyScreen} />
          <Stack.Screen name="Duel" component={DuelScreen} />
          <Stack.Screen name="TournamentBracket" component={TournamentBracketScreen} />
          <Stack.Screen name="Mercato" component={MercatoScreen} />
          <Stack.Screen name="Spectator" component={SpectatorScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="ClubDetail" component={ClubDetailScreen} />
          <Stack.Screen name="UserProfile" component={UserPublicProfileScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

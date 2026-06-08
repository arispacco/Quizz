import type { GameFormat, MatchSettings, PlayerRef } from '@/models';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Explore: undefined;
  Create: undefined;
  Social: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  MatchSetup: { format?: GameFormat } | undefined;
  PackEditor: { packId?: string } | undefined;
  PackDetail: { packId: string };
  PackImport: undefined;
  GameLobby: { matchId: string; settings: MatchSettings; players: PlayerRef[] };
  Duel: {
    duelId: string;
    matchId: string;
    local?: boolean;
    settings: MatchSettings;
    players: PlayerRef[];
  };
  TournamentBracket: { matchId: string };
  Mercato: { matchId: string };
  Spectator: { matchId: string };
  Settings: undefined;
  ClubDetail: { clubId: string };
  UserProfile: { userId: string };
};

export type PackEditorParams = { packId?: string };
export type PackDetailParams = { packId: string };

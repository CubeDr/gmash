import { Unsubscribe, User } from 'firebase/auth';
import { DatabaseReference } from 'firebase/database';

import { Googler } from '../data/googler';
import Member from '../data/member';
import { IDBySessionMember } from '../data/sessionMember';

export interface GameResult {
  win: GameResultTeam;
  lose: GameResultTeam;
}
export interface GameResultTeam {
  playersId: string[];
  score: number;
}

export interface SessionHistory {
  players: string[];
  timestamp: number;
  id: string;
}
export default interface Firebase {
  signIn: () => void;
  signOut: () => void;
  onAuthStateChanged: (callback: (user: User | null) => void) => Unsubscribe;
  register: (id: string, name: string) => Promise<void>;
  getGoogler: (user: User) => Promise<Googler>;
  updateGoogler: (id: string, elo: number) => Promise<void>;
  getAllMembers: () => Promise<Member[]>;
  getMembersById: (ids: string[]) => Promise<Member[]>;

  getSessionMembersMap: () => Promise<IDBySessionMember>;
  updateSessionMembers: (ids: string[]) => Promise<void>;
  listenToSessionMembers: (
    listener: (sessionMembers: IDBySessionMember) => void
  ) => Unsubscribe;

  isSessionOpen: () => Promise<boolean>;
  createSession: () => Promise<void>;
  closeSession: () => Promise<void>;

  addUpcomingGame: (team1: string[], team2: string[]) => Promise<void>;
  listenToUpcomingGames: (
    listener: (
      games: { team1: string[]; team2: string[]; ref: DatabaseReference }[]
    ) => void
  ) => Unsubscribe;

  addPlayingGame: (team1: string[], team2: string[]) => Promise<void>;
  listenToPlayingGames: (
    listener: (
      games: { team1: string[]; team2: string[]; ref: DatabaseReference }[]
    ) => void
  ) => Unsubscribe;

  addGameResult: (win: GameResultTeam, lose: GameResultTeam) => Promise<void>;
  listenToGameResults: (
    listener: (
      gameResults: { win: GameResultTeam; lose: GameResultTeam }[]
    ) => void
  ) => Unsubscribe;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  update: (ref: DatabaseReference, value: any) => Promise<void>;
  delete: (ref: DatabaseReference) => Promise<void>;

  getGameResultsForSession: (sessionId: string) => Promise<GameResult[]>;
  // TODO: support pagination
  getSessionHistoryList: () => Promise<SessionHistory[]>;
}

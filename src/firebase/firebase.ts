import { Unsubscribe, User } from 'firebase/auth';
import { Googler } from '../data/googler';
import Member from '../data/member';
import {IDBySessionMember} from '../data/sessionMember';
import { DatabaseReference } from 'firebase/database';

interface GameResultTeam {
    playersId: string[];
    score: number;
}
export default interface Firebase {
    signIn: () => void;
    signOut: () => void;
    onAuthStateChanged: (callback: (user: User | null) => void) => Unsubscribe;
    register: (id: string, name: string) => Promise<void>;
    getGoogler: (user: User) => Promise<Googler>;
    getAllMembers: () => Promise<Member[]>;
    getMembersById: (ids: string[]) => Promise<Member[]>;
    
    updateSessionMembers: (ids: string[]) => Promise<void>;
    listenToSessionMembers: (listener: (sessionMembers: IDBySessionMember) => void) => Unsubscribe;

    isSessionOpen: () => Promise<boolean>;
    createSession: () => Promise<void>;
    closeSession: () => Promise<void>;

    addUpcomingGame: (team1: string[], team2: string[]) => Promise<void>;
    listenToUpcomingGames: (listener: (games: {team1: string[], team2: string[], ref: DatabaseReference}[]) => void) => Unsubscribe;

    addPlayingGame: (team1: string[], team2: string[]) => Promise<void>;
    listenToPlayingGames: (listener: (games: {team1: string[], team2: string[], ref: DatabaseReference}[]) => void) => Unsubscribe;

    addGameResult: (win: GameResultTeam, lose: GameResultTeam) => Promise<void>;

    update: (ref: DatabaseReference, value: any) => Promise<void>;
    delete: (ref: DatabaseReference) => Promise<void>;
}
import {Unsubscribe, User} from 'firebase/auth';
import Firebase from './firebase';
import { Member } from '../data/member';

const user: User = {
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => { },
    getIdToken: async (forceRefresh) => '',
    getIdTokenResult: async (forceRefresh) => ({
        authTime: '',
        expirationTime: '',
        issuedAtTime: '',
        signInProvider: '',
        claims: {},
        signInSecondFactor: '',
        token: '',
    }),
    reload: async () => { },
    toJSON: () => ({}),
    displayName: 'Hyuni Kim',
    email: 'hyuni@google.com',
    phoneNumber: null,
    photoURL: null,
    providerId: '',
    uid: 'hyuni-id',
};

let authStateChangeCallback: ((user: User | null) => void) | null = null;
let sessionMemberIdsUpdateCallback: ((ids: string[]) => void) | null = null;
let upcomingGamesUpdateCallback: ((games: {team1: string[], team2: string[]}[]) => void) | null = null;

const firebaseFake: Firebase = {
    signIn() {
        if (authStateChangeCallback) {
            authStateChangeCallback(user);
        }
    },

    signOut() {
        if (authStateChangeCallback) {
            authStateChangeCallback(null);
        }
    },

    onAuthStateChanged(callback: (user: User | null) => void) {
        callback(user);
        authStateChangeCallback = callback;
        return () => {
            authStateChangeCallback = null;
        };
    },

    async register(id: string, name: string) { /* no-op */ },

    async getGoogler(user: User) {
        await new Promise(resolve => {
            setTimeout(resolve, 500);
        });
        return {
            user,
            name: 'Hyuni Kim',
            elo: 1200,
            role: 'organizer',
        };
    },

    async getAllMembers() {
        const members: Member[] = [{
            id: 'hyuni-id',
            name: 'Hyuni Kim',
            elo: 1200,
            role: 'organizer',
        }];

        for (let elo = 100; elo <= 1300; elo += 50) {
            members.push({
                id: `test-${elo}-id`,
                name: 'Test ' + elo,
                elo,
                role: 'member',
            });
        }

        return members;
    },

    async getMembersById(ids: string[]) {
        return ids.map(id => {
            if (id === 'hyuni-id') {
                return {
                    id: 'hyuni-id',
                    name: 'Hyuni Kim',
                    elo: 1200,
                    role: 'organizer',
                };
            }

            const elo = Number(id.substring(5, 8));
            return {
                id: `test-${elo}-id`,
                name: 'Test ' + elo,
                elo,
                role: 'member',
            };
        });
    },

    async updateSessionMemberIds(ids: string[]) {
        localStorage.setItem('sessionMemberIds', JSON.stringify(ids));
        if (sessionMemberIdsUpdateCallback) {
            sessionMemberIdsUpdateCallback(ids);
        }
    },

    listenToSessionMemberIds(listener: (ids: string[]) => void) {
        sessionMemberIdsUpdateCallback = listener;
        const ids = JSON.parse(localStorage.getItem('sessionMemberIds') ?? '[]') as string[];
        listener(ids);

        return () => {
            sessionMemberIdsUpdateCallback = null;
        };
    },

    async addUpcomingGame(team1: string[], team2: string[]) {
        const upcomingGames = JSON.parse(localStorage.getItem('upcoming') ?? '[]');
        upcomingGames.push({team1, team2});
        localStorage.setItem('upcoming', JSON.stringify(upcomingGames));

        if (upcomingGamesUpdateCallback) {
            upcomingGamesUpdateCallback(upcomingGames);
        }
    },

    listenToUpcomingGames(listener: (games: {team1: string[], team2: string[]}[]) => void) {
        upcomingGamesUpdateCallback = listener;
        listener(JSON.parse(localStorage.getItem('upcoming') ?? '[]'));

        return () => {
            upcomingGamesUpdateCallback = null;
        };
    }
};

export default firebaseFake;
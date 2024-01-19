import { User } from 'firebase/auth';
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
    }
};

export default firebaseFake;
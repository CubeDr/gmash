import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signOut,
} from 'firebase/auth';
import {
  getDatabase,
  onValue,
  ref,
  get,
  set,
  push,
  DatabaseReference,
  remove,
  Unsubscribe,
} from 'firebase/database';
import {
  addDoc,
  QuerySnapshot,
  collection,
  doc,
  documentId,
  getDoc,
  getDocs,
  getFirestore,
  query,
  setDoc,
  where,
} from 'firebase/firestore';

import Member from '../data/member';
import { IDBySessionMember } from '../data/sessionMember';

import Firebase, { GameResultTeam } from './firebase';

const firebaseConfig = {
  apiKey: 'AIzaSyDaVS0MghioqcmFTBdwNrdV9P5Zpu2ilUs',
  authDomain: 'gmash-496a9.firebaseapp.com',
  projectId: 'gmash-496a9',
  storageBucket: 'gmash-496a9.appspot.com',
  messagingSenderId: '131659335029',
  appId: '1:131659335029:web:d675ce7e9cbe1dba753f3c',
  measurementId: 'G-X17ZEEE5DZ',
  databaseURL:
    'https://gmash-496a9-default-rtdb.asia-southeast1.firebasedatabase.app',
};

const GAME_RESULT_KEY = 'gameResult';

let isInitialized = false;

let sessionId: string | null = null;

function snapshotToMembers(snapshot: QuerySnapshot) {
  const members: Member[] = [];
  snapshot.forEach((doc) => {
    members.push({
      id: doc.id,
      ...doc.data(),
    } as Member);
  });

  return members;
}

type GameCategory = 'upcoming' | 'playing';

function addGame(
  category: GameCategory,
  game: { team1: string[]; team2: string[] }
): Promise<void> {
  return set(push(ref(getDatabase(), category)), game);
}

function listenToGames(
  category: GameCategory,
  listener: (
    games: { team1: string[]; team2: string[]; ref: DatabaseReference }[]
  ) => void
): Unsubscribe {
  return onValue(ref(getDatabase(), category), (snapshot) => {
    const upcomingGames: {
      team1: string[];
      team2: string[];
      ref: DatabaseReference;
    }[] = [];
    snapshot.forEach((gameSnapshot) => {
      upcomingGames.push({
        ...gameSnapshot.val(),
        ref: gameSnapshot.ref,
      });
    });
    listener(upcomingGames);
  });
}

function maybeInitialize() {
  if (isInitialized) return;

  initializeApp(firebaseConfig);
  isInitialized = true;
}

const firebaseImpl: Firebase = {
  signIn() {
    maybeInitialize();
    const auth = getAuth();
    if (auth.currentUser != null) {
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
    signInWithPopup(auth, provider);
  },

  signOut() {
    maybeInitialize();
    signOut(getAuth());
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    maybeInitialize();
    return onAuthStateChanged(getAuth(), (user) => callback(user));
  },

  register(id: string, name: string) {
    maybeInitialize();
    return setDoc(doc(getFirestore(), 'googlers', id), {
      name,
      elo: 1000,
      role: 'member',
    });
  },

  async getGoogler(user: User) {
    maybeInitialize();
    const snapshot = await getDoc(doc(getFirestore(), 'googlers', user.uid));
    return {
      user,
      ...snapshot.data(),
    };
  },

  async getAllMembers() {
    maybeInitialize();
    const snapshot = await getDocs(collection(getFirestore(), 'googlers'));
    return snapshotToMembers(snapshot);
  },

  async getMembersById(ids: string[]) {
    maybeInitialize();
    const snapshot = await getDocs(
      query(
        collection(getFirestore(), 'googlers'),
        where(documentId(), 'in', ids)
      )
    );
    return snapshotToMembers(snapshot);
  },

  async updateSessionMembers(ids: string[]) {
    maybeInitialize();

    const existingMembers =
      (await get(ref(getDatabase(), 'members'))).val() ?? {};
    const newMemberIds = ids.filter((id) => !(id in existingMembers));
    let newMembers = {};

    if (newMemberIds.length > 0) {
      const newMemberList = await this.getMembersById(newMemberIds);
      newMembers = newMemberList.reduce((result, member) => {
        result[member.id] = { played: 0, upcoming: 0, elo: member.elo };
        return result;
      }, {} as IDBySessionMember);
    }

    try {
      await set(ref(getDatabase(), 'members'), {
        ...existingMembers,
        ...newMembers,
      });
    } catch (e) {
      console.error(e);
    }
  },

  async getSessionMembersMap() {
    maybeInitialize();
    const members: IDBySessionMember =
      (await get(ref(getDatabase(), 'members'))).val() ?? {};

    return members;
  },

  listenToSessionMembers(
    listener: (sessionMembers: IDBySessionMember) => void
  ) {
    maybeInitialize();
    return onValue(ref(getDatabase(), 'members'), (snapshot) => {
      listener(snapshot.val());
    });
  },

  async isSessionOpen() {
    maybeInitialize();
    const val = (await get(ref(getDatabase(), 'sessionId'))).val();
    if (val == null) {
      sessionId = null;
      return false;
    }

    sessionId = val;
    return true;
  },

  async createSession() {
    maybeInitialize();
    sessionId = Date.now().toString();
    await set(ref(getDatabase(), 'sessionId'), sessionId);
  },

  async closeSession() {
    maybeInitialize();
    const members: IDBySessionMember = (
      await get(ref(getDatabase(), 'members'))
    ).val();
    const gameResult = (await get(ref(getDatabase(), GAME_RESULT_KEY))).val();
    await addDoc(collection(getFirestore(), 'session'), {
      id: sessionId,
      members: Object.keys(members),
      gameResult,
    });
    await remove(ref(getDatabase(), 'sessionId'));
    await remove(ref(getDatabase(), 'members'));
    await remove(ref(getDatabase(), 'upcoming'));
    await remove(ref(getDatabase(), 'playing'));
    await remove(ref(getDatabase(), GAME_RESULT_KEY));
    sessionId = null;
  },

  addUpcomingGame(team1: string[], team2: string[]) {
    maybeInitialize();
    return addGame('upcoming', { team1, team2 });
  },

  listenToUpcomingGames(
    listener: (
      games: { team1: string[]; team2: string[]; ref: DatabaseReference }[]
    ) => void
  ) {
    maybeInitialize();
    return listenToGames('upcoming', listener);
  },

  addPlayingGame(team1: string[], team2: string[]) {
    maybeInitialize();
    return addGame('playing', { team1, team2 });
  },

  listenToPlayingGames(
    listener: (
      games: { team1: string[]; team2: string[]; ref: DatabaseReference }[]
    ) => void
  ) {
    maybeInitialize();
    return listenToGames('playing', listener);
  },

  async addGameResult(win, lose) {
    maybeInitialize();
    set(push(ref(getDatabase(), GAME_RESULT_KEY)), { win, lose });
    // TODO: should be remove after migration.
    await addDoc(collection(getFirestore(), 'gameResult'), {
      win,
      lose,
      sessionId,
    });
  },
  
  listenToGameResults(listener: (gameResults: {win: GameResultTeam, lose: GameResultTeam}[]) => void) {
    return onValue(ref(getDatabase(), GAME_RESULT_KEY), (snapshot) => {
      const gameResults: {win: GameResultTeam, lose: GameResultTeam}[] = [];
      snapshot.forEach((gameResultSnapshot) => {
        gameResults.push({
          win: gameResultSnapshot.val().win,
          lose: gameResultSnapshot.val().lose,
        });
      });
      listener(gameResults);
    });
  },

  update(ref, value) {
    maybeInitialize();
    return set(ref, value);
  },

  delete(ref) {
    maybeInitialize();
    return remove(ref);
  },
};

export default firebaseImpl;

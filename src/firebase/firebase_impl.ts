import { QuerySnapshot, collection, doc, documentId, getDoc, getDocs, getFirestore, query, setDoc, where } from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, User, onAuthStateChanged, signOut } from 'firebase/auth';
import Firebase from './firebase';
import { Member } from '../data/member';

function snapshotToMembers(snapshot: QuerySnapshot) {
    const members: Member[] = [];
    snapshot.forEach(doc => {
        members.push({
            id: doc.id,
            ...doc.data(),
        } as Member);
    });

    return members;
}

const firebaseImpl: Firebase = {
    signIn() {
        const auth = getAuth();
        if (auth.currentUser != null) {
            return;
        }

        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
            prompt: 'select_account'
        });
        signInWithPopup(auth, provider);
    },

    signOut() {
        signOut(getAuth());
    },

    onAuthStateChanged(callback: (user: User | null) => void) {
        return onAuthStateChanged(getAuth(), user => callback(user));
    },

    register(id: string, name: string) {
        return setDoc(doc(getFirestore(), 'googlers', id), {
            name,
            elo: 1000,
            role: 'member',
        });
    },

    async getGoogler(user: User) {
        const snapshot = await getDoc(doc(getFirestore(), 'googlers', user.uid));
        return {
            user,
            ...snapshot.data(),
        };
    },

    async getAllMembers() {
        const snapshot = await getDocs(collection(getFirestore(), 'googlers'));
        return snapshotToMembers(snapshot);
    },

    async getMembersById(ids: string[]) {
        const snapshot = await getDocs(query(collection(getFirestore(), 'googlers'),
            where(documentId(), 'in', ids)));
        return snapshotToMembers(snapshot);
    }
};

export default firebaseImpl;
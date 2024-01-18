import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { useEffect, useState } from 'react';

interface Googler {
  user: User;
  name?: string;
  elo?: number;
}

export default function useGoogler() {
  const [user, setUser] = useState<User | null>(null);
  const [googler, setGoogler] = useState<Googler | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user != null) {
        if (!user.email?.endsWith('google.com')) {
          alert('Only google.com emails are available.');
          signOut(auth);
          return;
        }
      }
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    fetch();
  }, [user]);

  function fetch() {
    if (user == null) {
      setGoogler(null);
      return;
    }

    getDoc(doc(getFirestore(), 'googlers', user.uid)).then(snapshot => {
      setGoogler({ user, ...snapshot.data() });
    });
  }

  return { googler, refetch: fetch };
}
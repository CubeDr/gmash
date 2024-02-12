import { User } from 'firebase/auth';
import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

import { Googler } from '../data/googler';
import firebase from '../firebase';

interface GooglerContextProviderProps {
  children: ReactNode;
}

interface GooglerContextType {
  googler: Googler | null;
  refetch: () => void;
}

export const GooglerContext = createContext({
  googler: null,

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  refetch: () => {},
} as GooglerContextType);

export function GooglerContextProvider({
  children,
}: GooglerContextProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [googler, setGoogler] = useState<Googler | null>(null);
  const fetch = useCallback(() => {
    if (user == null) {
      setGoogler(null);
      return;
    }

    firebase.getGoogler(user).then((googler) => {
      setGoogler(googler);
    });
  }, [user]);

  useEffect(() => {
    const unsubscribe = firebase.onAuthStateChanged((user) => {
      // if (user != null) {
      //     if (!user.email?.endsWith('google.com')) {
      //         alert('Only google.com emails are available.');
      //         firebase.signOut();
      //         return;
      //     }
      // }
      setUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => fetch(), [fetch]);

  return (
    <GooglerContext.Provider value={{ googler, refetch: fetch }}>
      {children}
    </GooglerContext.Provider>
  );
}

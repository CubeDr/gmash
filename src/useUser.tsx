import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useEffect, useState } from 'react';

export default function useUser() {
    const [user, setUser] = useState<User | null>(null);

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

    return user;
}
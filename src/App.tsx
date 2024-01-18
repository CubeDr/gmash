import { useEffect, useState } from 'react';
import styles from './App.module.css';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, User, onAuthStateChanged } from 'firebase/auth';
import googleSignIn from './google_signin.png';

function App() {
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

  async function signIn() {
    const auth = getAuth();
    if (auth.currentUser != null) {
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
  }

  return (
    <div className={styles.App}>
      <div className={styles.Title}>GMASH</div>
      {!user && <img className={styles.GoogleSignIn} src={googleSignIn} onClick={signIn} />}
      {user && <button className={styles.Button}>Start session</button>}
    </div>
  );
}

export default App;

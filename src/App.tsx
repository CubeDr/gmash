import styles from './App.module.css';
import { getAuth, signInWithPopup, signOut, GoogleAuthProvider } from 'firebase/auth';
import googleSignIn from './google_signin.png';
import useUser from './useUser';
import Members from './components/members/Members';

function App() {
  const user = useUser();

  function signIn() {
    const auth = getAuth();
    if (auth.currentUser != null) {
      return;
    }

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    signInWithPopup(auth, provider);
  }

  return (
    <div className={styles.App}>
      <div className={styles.Title}>GMASH</div>
      {user && <Members />}
      {!user && <img className={styles.GoogleSignIn} src={googleSignIn} onClick={signIn} />}
      {user && <button className={styles.Button} onClick={(e) => signOut(getAuth())}>Register</button>}
    </div>
  );
}

export default App;

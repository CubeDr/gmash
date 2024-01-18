import styles from './App.module.css';
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import googleSignIn from './google_signin.png';
import useGoogler from './useGoogler';
import Members from './components/members/Members';
import { doc, getFirestore, setDoc } from 'firebase/firestore';

function App() {
  const { googler, refetch } = useGoogler();

  function showMembers() {
    return googler != null;
  }

  function showSignInButton() {
    return googler == null;
  }

  function showRegisterButton() {
    return googler != null && googler.name == null;
  }

  function showStartSessionButton() {
    return googler?.role === 'organizer';
  }

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

  function register() {
    if (googler == null) {
      return;
    }

    setDoc(doc(getFirestore(), 'googlers', googler.user.uid), {
      name: googler.user.displayName,
      elo: 1000,
      role: 'member',
    }).then(() => {
      refetch();
    });
  }

  return (
    <div className={styles.App}>
      <div className={styles.Title}>GMASH</div>
      {showMembers() && <Members />}
      {showSignInButton() && <img className={styles.GoogleSignIn} src={googleSignIn} onClick={signIn} />}
      {showRegisterButton() && <button className={styles.Button} onClick={(e) => register()}>Register</button>}
      {showStartSessionButton() && <button className={styles.Button} onClick={(e) => {}}>Start Session</button>}
    </div>
  );
}

export default App;

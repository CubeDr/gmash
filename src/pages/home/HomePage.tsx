import { Button } from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Members from '../../components/members/Members';
import firebase from '../../firebase';
import { GooglerContext } from '../../providers/GooglerContext';

import styles from './HomePage.module.css';
import googleSignIn from './google_signin.png';

export default function HomePage() {
  const { googler, refetch } = useContext(GooglerContext);
  const [isSelectingMember, setIsSelectingMember] = useState(false);
  const [selectedMembersCount, setSelectedMembersCount] = useState(0);
  const [isSessionOpen, setIsSessionOpen] = useState<boolean | null>(null);
  const selectedMemberIds = useRef(new Set<string>());
  const navigate = useNavigate();

  useEffect(() => {
    firebase.isSessionOpen().then(isOpen => setIsSessionOpen(isOpen));
  }, []);

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
    return googler?.role === 'organizer' && !isSelectingMember && isSessionOpen === false;
  }

  function showProceedButton() {
    return googler?.role === 'organizer' && isSelectingMember && isSessionOpen === false;
  }

  function showViewSessionButton() {
    return googler != null && isSessionOpen;
  }

  function signIn() {
    firebase.signIn();
  }

  function register() {
    if (googler == null) {
      return;
    }

    firebase.register(googler.user.uid, googler.user.displayName!).then(() => {
      refetch();
    });
  }

  function startSession() {
    firebase.createSession();
    setIsSelectingMember(true);
  }

  function onSelectedMemberIdsChange(newSelectedMemberIds: Set<string>) {
    selectedMemberIds.current = newSelectedMemberIds;
    setSelectedMembersCount(newSelectedMemberIds.size);
  }

  function proceed() {
    firebase
      .updateSessionMembers(Array.from(selectedMemberIds.current))
      .then(() => {
        navigate('/session');
      });
  }

  return (
    <div className={styles.HomePage}>
      <div className={styles.Title}>GMASH</div>
      {showMembers() && (
        <div className={styles.MembersContainer}>
          <Members
            mode={isSelectingMember ? 'select' : 'view'}
            onSelectedMemberIdsChange={onSelectedMemberIdsChange}
          />
        </div>
      )}
      {showSignInButton() && (
        <img
          alt="Sign in"
          className={styles.GoogleSignIn}
          src={googleSignIn}
          onClick={signIn}
        />
      )}
      {showRegisterButton() && (
        <button className={styles.Button} onClick={() => register()}>
          Register
        </button>
      )}
      <div className={styles.ButtonGroup}>
        {showViewSessionButton() && (
          <Button
            className={styles.Button}
            variant="outlined"
            size="large"
            href="/gmash/session"
          >
            View Session
          </Button>
        )}
        {showStartSessionButton() && (
          <Button
            className={styles.Button}
            variant="contained"
            size="large"
            onClick={() => startSession()}
          >
            Start Session
          </Button>
        )}
        {showProceedButton() && (
          <Button
            className={styles.Button}
            variant="contained"
            size="large"
            disabled={selectedMembersCount === 0}
            onClick={() => {
              proceed();
            }}
          >
            Proceed with {selectedMembersCount} members
          </Button>
        )}
      </div>
    </div>
  );
}

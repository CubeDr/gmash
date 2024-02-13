import { Button } from '@mui/material';
import { useContext, useRef, useState } from 'react';
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
  const selectedMemberIds = useRef(new Set<string>());
  const navigate = useNavigate();

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
    return googler?.role === 'organizer' && !isSelectingMember;
  }

  function showProceedButton() {
    return googler?.role === 'organizer' && isSelectingMember;
  }

  function showViewSessionButton() {
    // TODO: show this button only if the session exists
    return googler != null;
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
      .updateSessionMemberIds(Array.from(selectedMemberIds.current))
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
            href="/session"
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

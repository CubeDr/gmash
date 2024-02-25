import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Members from '../../components/members/Members';
import { Googler } from '../../data/googler';
import firebase from '../../firebase';
import googlerService from '../../services/googlerService';

import styles from './HomePage.module.css';
import googleSignIn from './google_signin.png';

const EDIT_SESSION_QUERY_PARAM = 'edit_session';

export default function HomePage() {
  const queryParams = new URLSearchParams(useLocation().search);
  const [googler, setGoogler] = useState<Googler | null>(null);
  const [isSelectingMember, setIsSelectingMember] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState<boolean | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    new Set()
  );
  const [showElo, setShowElo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    firebase.isSessionOpen().then((isOpen) => {
      setIsSessionOpen(isOpen);
    });

    googlerService.googlerStream.on(googler => setGoogler(googler));
  }, []);

  useEffect(() => {
    if (isSessionOpen) {
      firebase.getSessionMembers().then((members) => {
        setSelectedMemberIds(new Set(members));
        if (
          googler?.role === 'organizer' &&
          queryParams.get(EDIT_SESSION_QUERY_PARAM) === 'true'
        ) {
          setIsSelectingMember(true);
        }
      });
    }
  }, [isSessionOpen]);

  function showMembers() {
    return googler != null;
  }

  function showSignInButton() {
    return googler == null;
  }

  function showRegisterButton() {
    return googler != null && googler.name == null;
  }

  function showEloToggle() {
    return googler?.role === 'organizer';
  }

  function showStartSessionButton() {
    return (
      googler?.role === 'organizer' &&
      !isSelectingMember &&
      isSessionOpen === false
    );
  }

  function showProceedButton() {
    return googler?.role === 'organizer' && isSelectingMember;
  }

  function showViewSessionButton() {
    return googler != null && isSessionOpen;
  }

  function showEditSessionButton() {
    return googler?.role === 'organizer' && isSessionOpen && !isSelectingMember;
  }

  function signIn() {
    firebase.signIn();
  }

  function register() {
    if (googler == null) {
      return;
    }

    googlerService.register();
  }

  function startSession() {
    firebase.createSession();
    setIsSelectingMember(true);
  }

  function editSession() {
    setIsSelectingMember(true);
  }

  function onSelectedMemberIdsChange(memberId: string) {
    setSelectedMemberIds((prev) => {
      const ids = new Set(prev);
      if (ids.has(memberId)) {
        ids.delete(memberId);
      } else {
        ids.add(memberId);
      }
      return ids;
    });
  }

  function proceed() {
    firebase.updateSessionMembers(Array.from(selectedMemberIds)).then(() => {
      navigate('/session');
    });
  }

  return (
    <div className={styles.HomePage}>
      <div className={styles.Title}>GMASH</div>
      {showEloToggle() && (
        <div className={styles.EloToggle + (showElo ? ' ' + styles.EloToggleOff : '')}
          onClick={() => setShowElo(showElo => !showElo)}>Toggle Elo</div>
      )}
      {showMembers() && (
        <div className={styles.MembersContainer}>
          <Members
            mode={isSelectingMember ? 'select' : 'view'}
            onSelectedMemberIdsChange={onSelectedMemberIdsChange}
            selectedMemberIds={selectedMemberIds}
            showElo={showElo}
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
            onClick={() => {
              navigate('/session');
            }}
          >
            View Session
          </Button>
        )}
        {showStartSessionButton() && (
          <Button
            className={styles.Button}
            variant="contained"
            size="large"
            onClick={() => {
              startSession();
            }}
          >
            Start Session
          </Button>
        )}
        {showEditSessionButton() && (
          <Button
            className={styles.Button}
            variant="contained"
            size="large"
            onClick={() => {
              editSession();
            }}
          >
            Edit Session
          </Button>
        )}
        {showProceedButton() && (
          <Button
            className={styles.Button}
            variant="contained"
            size="large"
            disabled={selectedMemberIds.size === 0}
            onClick={() => {
              proceed();
            }}
          >
            Proceed with {selectedMemberIds.size} members
          </Button>
        )}
      </div>
    </div>
  );
}

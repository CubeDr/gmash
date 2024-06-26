import { Button } from '@mui/material';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Members from '../../components/members/Members';
import Member from '../../data/member';
import firebase from '../../firebase';
import googlerService from '../../services/googlerService';
import membersService from '../../services/membersService';
import useStream from '../../useStream';

import styles from './HomePage.module.css';
import googleSignIn from './google_signin.png';
import MemberDialog from './memberDialog/memberDialog';

const EDIT_SESSION_QUERY_PARAM = 'edit_session';

export default function HomePage() {
  const queryParams = new URLSearchParams(useLocation().search);
  const googler = useStream(googlerService.googlerStream);
  const members = useStream(membersService.membersStream);
  const [isSelectingMember, setIsSelectingMember] = useState(false);
  const [isSessionOpen, setIsSessionOpen] = useState<boolean | null>(null);
  const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(
    new Set()
  );
  // TODO: update with playing info.
  // Participant IDs for SessionMembers involved in upcoming games.
  const [participantIds, setParticipantIds] = useState<Set<string>>(new Set());
  const [showElo, setShowElo] = useState(false);
  const [ranking, setRanking] = useState<Member[]>([]);
  const [isMemberDialogShown, setIsMemberDialogShown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    firebase.isSessionOpen().then((isOpen) => {
      setIsSessionOpen(isOpen);
    });
  }, []);

  useEffect(() => {
    if (isSessionOpen) {
      firebase.getSessionMembersMap().then((membersMap) => {
        const canPlayMemberList = Object.keys(membersMap).filter(
          (key) => membersMap[key].canPlay
        );
        setSelectedMemberIds(new Set(canPlayMemberList));
        if (
          googler?.role === 'organizer' &&
          queryParams.get(EDIT_SESSION_QUERY_PARAM) === 'true'
        ) {
          const players = Object.keys(membersMap).filter((key) => {
            const { upcoming = 0 } = membersMap[key];
            return upcoming > 0;
          });
          setParticipantIds(new Set(players));
          setIsSelectingMember(true);
        }
      });
    }
  }, [isSessionOpen]);

  useEffect(() => {
    if (members) {
      setRanking(
        Array.from(members)
          .sort((a, b) => b.elo - a.elo)
          .slice(0, 5)
      );
    }
  }, [members]);

  function showMembers() {
    return googler != null;
  }

  function showSignInButton() {
    return googler == null;
  }

  function showRegisterButton() {
    return googler != null && googler.name == null;
  }

  function isOrganizer() {
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
      {isOrganizer() && (
        <div
          className={classNames(`${styles.EloToggle}`, {
            [`${styles.EloToggleOff}`]: showElo,
          })}
          onClick={() => {
            setShowElo((showElo) => !showElo);
          }}
        >
          Toggle Elo
        </div>
      )}
      {showMembers() && ranking && (
        <div className={styles.Ranking}>
          <span className={styles.RankingTitle}>Ranking</span>
          {ranking?.map((member, i) => (
            <span className={styles.RankingItem} key={member.id + ':' + i}>
              {i + 1}. {member.name}
            </span>
          ))}
        </div>
      )}
      {isOrganizer() && (
        <div className={styles.NewMemberButtonWrapper}>
          <Button
            size="small"
            className={styles.NewMemberButton}
            onClick={() => {
              setIsMemberDialogShown(true);
            }}
          >
            Add New Member
          </Button>
        </div>
      )}

      {showMembers() && (
        <div className={styles.MembersContainer}>
          <Members
            mode={isSelectingMember ? 'select' : 'view'}
            onSelectedMemberIdsChange={onSelectedMemberIdsChange}
            selectedMemberIds={selectedMemberIds}
            showElo={showElo}
            disabledMemberIds={participantIds}
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
      <MemberDialog
        open={isMemberDialogShown}
        onClose={() => {
          setIsMemberDialogShown(false);
        }}
      ></MemberDialog>
    </div>
  );
}

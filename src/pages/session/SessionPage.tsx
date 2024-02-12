import useSessionMembers from './useSessionMembers';
import styles from './SessionPage.module.css';
import {useContext, useEffect, useState} from 'react';
import {Member} from '../../data/member';
import GameDialog from './GameDialog/GameDialog';
import MemberItem from './memberItem/MemberItem';
import UpcomingGames from "./upcomingGames/UpcomingGames";
import PlayingGames from './playingGames/PlayingGames';
import {GooglerContext} from '../../providers/GooglerContext';
import firebase from '../../firebase';
import {useNavigate} from "react-router-dom";

export default function SessionPage() {
  const {googler} = useContext(GooglerContext);
  const {members} = useSessionMembers();
  const [selectedMembers, setSelectedMembers] = useState<Set<Member>>(new Set());
  const [openMakeGameDialog, setOpenMakeGameDialog] = useState(false);
  const navigate = useNavigate();

  function makeGameFromSelectedMembers() {
    const sorted = Array.from(selectedMembers).sort((a, b) => b.elo - a.elo);

    return {
      team1: [...sorted.slice(0, 1), ...sorted.slice(3)],
      team2: sorted.slice(1, 3),
    };
  }

  function onMemberClick(member: Member) {
    if (googler?.role !== 'organizer') {
      return;
    }

    const newSet = new Set(selectedMembers);
    if (selectedMembers.has(member)) {
      newSet.delete(member);
    } else if (selectedMembers.size < 4) {
      newSet.add(member);
    }

    if (newSet.size !== selectedMembers.size) {
      setSelectedMembers(newSet);
    }
  }

  function closeSession() {
    firebase.closeSession().then(() => {
      navigate('/');
    });
  }

  function showSessionCloseButton() {
    return googler?.role === 'organizer';
  }

  useEffect(() => {
    firebase.isSessionOpen().then(isOpen => {
      if (!isOpen) {
        navigate('/');
      }
    });
  }, [navigate]);

  return (
    <div className={selectedMembers.size > 0 ? styles.PaddingBottom : ''}>
      <h4 className={styles.SectionTitle}>Now playing</h4>
      <PlayingGames/>
      <h4 className={styles.SectionTitle}>Upcoming</h4>
      <UpcomingGames/>
      <h4 className={styles.SectionTitle}>Members</h4>
      <div className={styles.Members}>
        {
          members.map(member => (
            <MemberItem key={member.id}
                        member={member}
                        isSelected={selectedMembers.has(member)}
                        onClick={onMemberClick}/>
          ))
        }
      </div>
      {selectedMembers.size > 0 &&
        <button
          className={styles.Button}
          onClick={() => setOpenMakeGameDialog(true)}
          disabled={selectedMembers.size % 2 === 1}>
          Make a game ({selectedMembers.size})
        </button>
      }
      {showSessionCloseButton() &&
        <button
          className={styles.Button}
          onClick={() => closeSession()}>
          Close Session
        </button>
      }
      <GameDialog
        title='Make a new game'
        open={openMakeGameDialog}
        onClose={(success) => {
          if (success) {
            setSelectedMembers(new Set());
          }
          setOpenMakeGameDialog(false);
        }}
        game={makeGameFromSelectedMembers()}/>
    </div>
  );
}
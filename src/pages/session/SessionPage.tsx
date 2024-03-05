import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Member from '../../data/member';
import firebase from '../../firebase';
import gameService from '../../services/gameService';
import googlerService from '../../services/googlerService';
import useStream from '../../useStream';

import GameDialog from './GameDialog/GameDialog';
import styles from './SessionPage.module.css';
import MemberItem from './memberItem/MemberItem';
import PlayingGames from './playingGames/PlayingGames';
import RecommendedGames from './recommendedGames/RecommendedGames';
import UpcomingGames from './upcomingGames/UpcomingGames';
import useSessionMembers from './useSessionMembers';

export default function SessionPage() {
  const googler = useStream(googlerService.googlerStream);
  const { members } = useSessionMembers();
  const [selectedMembers, setSelectedMembers] = useState<Set<Member>>(
    new Set()
  );
  const [openMakeGameDialog, setOpenMakeGameDialog] = useState(false);
  const [openCloseSessionDialog, setOpenCloseSessionDialog] = useState(false);
  const navigate = useNavigate();

  const playingGames = useStream(gameService.playingGamesStream);
  const [playingMemberIds, setPlayingMemberIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (playingGames == null) return;

    setPlayingMemberIds(new Set(
      playingGames.flatMap(game => ([...game.team1.map(member => member.id), ...game.team2.map(member => member.id)]))
    ));
  }, [playingGames]);

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

  function showControlSection() {
    return googler?.role === 'organizer';
  }

  function showSessionEditButton() {
    return googler?.role === 'organizer';
  }

  useEffect(() => {
    firebase.isSessionOpen().then((isOpen) => {
      if (!isOpen) {
        navigate('/');
      }
    });
  }, [navigate]);

  return (
    <div className={selectedMembers.size > 0 ? styles.PaddingBottom : ''}>
      <h4 className={styles.SectionTitle}>Now playing</h4>
      <PlayingGames />
      <h4 className={styles.SectionTitle}>Upcoming</h4>
      <UpcomingGames playingMemberIds={playingMemberIds} />
      <h4 className={styles.SectionTitle}>Recommended</h4>
      <RecommendedGames  playingMemberIds={playingMemberIds} />
      <div className={styles.MembersTab}>
        <h4 className={styles.SectionTitle}>Members</h4>
        {showSessionEditButton() && (
          <Button
            variant="text"
            size="small"
            className={styles.EditMembersButton}
            onClick={() => {
              navigate('/?edit_session=true');
            }}
          >
            Edit members
          </Button>
        )}
      </div>
      <div className={styles.Members}>
        {members.map((member) => (
          <MemberItem
            key={member.id}
            member={member}
            isSelected={selectedMembers.has(member)}
            isPlaying={playingMemberIds.has(member.id)}
            onClick={onMemberClick}
          />
        ))}
      </div>
      {selectedMembers.size > 0 && (
        <Button
          className={styles.MakeGameButton}
          variant="contained"
          onClick={() => {
            setOpenMakeGameDialog(true);
          }}
          disabled={selectedMembers.size < 2 || selectedMembers.size % 2 === 1}
        >
          Make a game ({selectedMembers.size})
        </Button>
      )}
      {showControlSection() && (
        <>
          <h4 className={styles.SectionTitle}>Control</h4>
          <Button
            variant="outlined"
            className={styles.Button}
            onClick={() => {
              setOpenCloseSessionDialog(true);
            }}
          >
            Close Session
          </Button>
        </>
      )}
      <GameDialog
        title="Make a new game"
        open={openMakeGameDialog}
        onClose={(success) => {
          if (success) {
            setSelectedMembers(new Set());
          }
          setOpenMakeGameDialog(false);
        }}
        game={makeGameFromSelectedMembers()}
      />
      <Dialog
        open={openCloseSessionDialog}
        onClose={() => setOpenCloseSessionDialog(false)}
      >
        <DialogTitle>{'Close ongoing session?'}</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenCloseSessionDialog(false)}>
            Cancel
          </Button>
          <Button onClick={() => closeSession()} autoFocus>
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

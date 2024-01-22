import useSessionMembers from './useSessionMembers';
import Court from './court/Court';
import styles from './SessionPage.module.css';
import {useState} from 'react';
import {Member} from '../../data/member';
import GameDialog from './GameDialog/GameDialog';
import MemberItem from './memberItem/MemberItem';
import UpcomingGames from "./upcomingGames/UpcomingGames";

export default function SessionPage() {
  const {members} = useSessionMembers();
  const [selectedMembers, setSelectedMembers] = useState<Set<Member>>(new Set());
  const [openMakeGameDialog, setOpenMakeGameDialog] = useState(false);

  function makeGameFromSelectedMembers() {
    const sorted = Array.from(selectedMembers).sort((a, b) => b.elo - a.elo);

    return {
        team1: [...sorted.slice(0, 1), ...sorted.slice(3)],
        team2: sorted.slice(1, 3),
    };
  }

  function onMemberClick(member: Member) {
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

  return (
    <div className={selectedMembers.size > 0 ? styles.PaddingBottom : ''}>
      <h4 className={styles.SectionTitle}>Now playing</h4>
      <Court game={{
        team1: members.slice(0, 2),
        team2: members.slice(2, 4),
      }}/>
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
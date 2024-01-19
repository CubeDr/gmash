import useSessionMembers from './useSessionMembers';
import Court from './court/Court';
import styles from './SessionPage.module.css';
import {useState} from 'react';
import {Member} from '../../data/member';
import MakeGameDialog from './makeGameDialog/MakeGameDialog';
import MemberItem from './memberItem/MemberItem';
import UpcomingGames from "./upcomingGames/UpcomingGames";

export default function SessionPage() {
  const {members} = useSessionMembers();
  const [selectedMembers, setSelectedMembers] = useState<Set<Member>>(new Set());
  const [openMakeGameDialog, setOpenMakeGameDialog] = useState(false);

  function onMemberClick(member: Member) {
    const newSet = new Set(selectedMembers);
    if (selectedMembers.has(member)) {
      newSet.delete(member);
    } else if (selectedMembers.size < 4) {
      newSet.add(member);
    }

    if (newSet.size != selectedMembers.size) {
      setSelectedMembers(newSet);
    }
  }

  return (
    <div className={selectedMembers.size > 0 ? styles.PaddingBottom : ''}>
      <h4 className={styles.SectionTitle}>Now playing</h4>
      <Court team1={members.slice(0, 2)} team2={members.slice(2, 4)}/>
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
      <MakeGameDialog
        open={openMakeGameDialog}
        onClose={(success) => {
          if (success) {
            setSelectedMembers(new Set());
          }
          setOpenMakeGameDialog(false);
        }}
        members={selectedMembers}/>
    </div>
  );
}
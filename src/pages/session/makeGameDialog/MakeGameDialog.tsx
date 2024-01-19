import {Button, Dialog, DialogActions, DialogTitle} from '@mui/material'
import {Member} from '../../../data/member';
import {useEffect, useState} from 'react';
import MemberItem from '../memberItem/MemberItem';
import styles from './MakeGameDialog.module.css';

interface MakeGameDialogProps {
  open: boolean;
  onClose: () => void;
  members: Set<Member>;
}

function replace(team: Member[], before: Member, after: Member) {
  const newTeam = Array.from(team);
  const index = newTeam.indexOf(before);
  newTeam[index] = after;
  return newTeam;
}

export default function MakeGameDialog({open, onClose: onCancel, members}: MakeGameDialogProps) {
  const [team1, setTeam1] = useState<Member[]>([]);
  const [team2, setTeam2] = useState<Member[]>([]);

  const [team1SelectedMember, setTeam1SelectedMember] = useState<Member | null>(null);
  const [team2SelectedMember, setTeam2SelectedMember] = useState<Member | null>(null);

  useEffect(() => {
    const sorted = Array.from(members).sort((a, b) => b.elo - a.elo);

    const newTeam1: Member[] = [...sorted.slice(0, 1), ...sorted.slice(3)];
    const newTeam2: Member[] = sorted.slice(1, 3);

    setTeam1(newTeam1);
    setTeam2(newTeam2);
  }, [members]);

  useEffect(() => {
    if (team1SelectedMember == null || team2SelectedMember == null) {
      return;
    }

    setTeam1(team1 => replace(team1, team1SelectedMember, team2SelectedMember));
    setTeam2(team2 => replace(team2, team2SelectedMember, team1SelectedMember));
    setTeam1SelectedMember(null);
    setTeam2SelectedMember(null);
  }, [team1SelectedMember, team2SelectedMember]);

  return (
    <Dialog open={open} onClose={(_, reason) => {
      if (reason === 'backdropClick') return;
      onCancel();
    }}>
      <DialogTitle>Make a new game</DialogTitle>
      <span className={styles.Hint}>Tap two players to switch team</span>
      {
        team1.map(member => (
          <MemberItem
            key={member.id}
            member={member}
            isSelected={team1SelectedMember === member}
            onClick={() => {
              if (team1SelectedMember === member) {
                setTeam1SelectedMember(null);
              } else {
                setTeam1SelectedMember(member);
              }
            }}/>))
      }
      <span className={styles.Versus}>vs</span>
      {
        team2.map(member => (
          <MemberItem
            key={member.id}
            member={member}
            isSelected={team2SelectedMember === member}
            onClick={() => {
              if (team2SelectedMember === member) {
                setTeam2SelectedMember(null);
              } else {
                setTeam2SelectedMember(member);
              }
            }}/>))
      }
      <DialogActions>
        <Button onClick={() => onCancel()}>Cancel</Button>
        <Button>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}
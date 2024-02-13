import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { useEffect, useState } from 'react';

import Game from '../../../data/game';
import Member from '../../../data/member';
import firebase from '../../../firebase';
import MemberItem from '../memberItem/MemberItem';

import styles from './GameDialog.module.css';

export interface GameDialogAction {
  text: string;
  action: (game: Game) => Promise<void>;
}

interface GameDialogProps {
  title: string;
  open: boolean;
  onClose: (success?: boolean) => void;
  game: Game;
  actions?: GameDialogAction[];
}

function replace(team: Member[], before: Member, after: Member) {
  const newTeam = Array.from(team);
  const index = newTeam.indexOf(before);
  newTeam[index] = after;
  return newTeam;
}

export default function GameDialog({
  title,
  open,
  onClose,
  game: initialGame,
  actions,
}: GameDialogProps) {
  const [game, setGame] = useState(initialGame);
  const [team1SelectedMember, setTeam1SelectedMember] = useState<Member | null>(
    null
  );
  const [team2SelectedMember, setTeam2SelectedMember] = useState<Member | null>(
    null
  );

  // Initially set to updated when the game is newly creating.
  const [isUpdated, setIsUpdated] = useState(game.ref == null);

  useEffect(() => {
    setGame(initialGame);
  }, [initialGame]);

  useEffect(() => {
    if (team1SelectedMember == null || team2SelectedMember == null) {
      return;
    }

    setGame((game) => ({
      ref: game.ref,
      team1: replace(game.team1, team1SelectedMember, team2SelectedMember),
      team2: replace(game.team2, team2SelectedMember, team1SelectedMember),
    }));

    setTeam1SelectedMember(null);
    setTeam2SelectedMember(null);
    setIsUpdated(true);
  }, [team1SelectedMember, team2SelectedMember]);

  function onConfirm() {
    if (game.ref == null) {
      firebase
        .addUpcomingGame(
          game.team1.map((member) => member.id),
          game.team2.map((member) => member.id)
        )
        .then(() => onClose(true));
    } else {
      firebase
        .update(game.ref, {
          team1: game.team1.map((member) => member.id),
          team2: game.team2.map((member) => member.id),
        })
        .then(() => onClose(true));
    }
  }

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <span className={styles.Hint}>Tap two players to switch team</span>
      {game.team1.map((member) => (
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
          }}
        />
      ))}
      <span className={styles.Versus}>vs</span>
      {game.team2.map((member) => (
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
          }}
        />
      ))}
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        {isUpdated && (
          <Button onClick={() => onConfirm()}>
            {game.ref ? 'Update' : 'Create'}
          </Button>
        )}
        {!isUpdated &&
          actions?.map((action, idx) => (
            <Button
              key={`${action.text}-${idx}`}
              onClick={async () => {
                await action.action(game);
                onClose(true);
              }}
            >
              {action.text}
            </Button>
          ))}
      </DialogActions>
    </Dialog>
  );
}

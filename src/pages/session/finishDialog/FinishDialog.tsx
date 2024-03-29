import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import { useRef } from 'react';

import Game from '../../../data/game';
import gameService from '../../../services/gameService';

import styles from './FinishDialog.module.css';

interface FinishDialogProps {
  game: Game;
  open: boolean;
  onClose: (success?: boolean) => void;
}

export default function FinishDialog({
  game,
  open,
  onClose,
}: FinishDialogProps) {
  const team1ScoreInputRef = useRef<HTMLInputElement | null>(null);
  const team2ScoreInputRef = useRef<HTMLInputElement | null>(null);

  function finish() {
    if (
      team1ScoreInputRef.current == null ||
      team2ScoreInputRef.current == null
    ) {
      return;
    }

    const team1Score = Number(team1ScoreInputRef.current.value);
    const team2Score = Number(team2ScoreInputRef.current.value);

    gameService.recordPlayedGame(game, team1Score, team2Score);

    onClose(true);
  }

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
    >
      <DialogTitle>Finish game</DialogTitle>

      <div className={styles.ScoreContainer}>
        <div className={styles.Row}>
          <div className={styles.Players}>
            {game.team1.map((member) => (
              <span key={member.id} className={styles.PlayerName}>
                {member.name}
              </span>
            ))}
          </div>
          <input
            ref={team1ScoreInputRef}
            className={styles.Score}
            type="number"
            min={0}
          />
        </div>
        <div className={styles.Row}>
          <div className={styles.Players}>
            {game.team2.map((member) => (
              <span key={member.id} className={styles.PlayerName}>
                {member.name}
              </span>
            ))}
          </div>
          <input
            ref={team2ScoreInputRef}
            className={styles.Score}
            type="number"
            min={0}
          />
        </div>
      </div>
      <DialogActions>
        <Button onClick={() => onClose()}>Cancel</Button>
        <Button onClick={() => finish()}>Finish</Button>
      </DialogActions>
    </Dialog>
  );
}

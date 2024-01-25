import { Button, Dialog, DialogActions, DialogTitle } from '@mui/material';
import Game from '../../../data/game';
import styles from './FinishDialog.module.css';
import { useRef } from 'react';
import firebase from '../../../firebase';
import { Member } from '../../../data/member';

interface FinishDialogProps {
    game: Game,
    open: boolean,
    onClose: (success?: boolean) => void;
}

function toTeam(team: Member[], score: number) {
    return {
        playersId: team.map(member => member.id),
        score,
    };
}

export default function FinishDialog({ game, open, onClose }: FinishDialogProps) {
    const team1ScoreInputRef = useRef<HTMLInputElement|null>(null);
    const team2ScoreInputRef = useRef<HTMLInputElement|null>(null);

    function finish() {
        if (team1ScoreInputRef.current == null || team2ScoreInputRef.current == null) {
            return;
        }

        const team1Score = Number(team1ScoreInputRef.current.value);
        const team2Score = Number(team2ScoreInputRef.current.value);

        const team1 = toTeam(game.team1, team1Score);
        const team2 = toTeam(game.team2, team2Score);

        const win = team1Score > team2Score ? team1 : team2;
        const lose = team1Score > team2Score ? team2 : team1;

        firebase.delete(game.ref!);
        firebase.addGameResult(win, lose);

        onClose(true);
    }

    return (
        <Dialog open={open} onClose={(_, reason) => {
            if (reason === 'backdropClick') return;
            onClose();
        }}>
            <DialogTitle>Finish game</DialogTitle>
            <div className={styles.ScoreContainer}>
                <div className={styles.Row}>
                    <div className={styles.Players}>
                        {
                            game.team1.map(member => <span className={styles.PlayerName}>{member.name}</span>)
                        }
                    </div>
                    <input ref={team1ScoreInputRef} className={styles.Score} type='number' min={0} />
                </div>
                <div className={styles.Row}>
                    <div className={styles.Players}>
                        {
                            game.team2.map(member => <span className={styles.PlayerName}>{member.name}</span>)
                        }
                    </div>
                    <input ref={team2ScoreInputRef} className={styles.Score} type='number' min={0} />
                </div>
            </div>
            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
                <Button onClick={() => finish()}>Finish</Button>
            </DialogActions>
        </Dialog>
    );
}

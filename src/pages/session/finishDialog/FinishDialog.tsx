import { Button, Dialog, DialogActions } from '@mui/material';
import Game from '../../../data/game';

interface FinishDialogProps {
    game: Game,
    open: boolean,
    onClose: (success?: boolean) => void;
}

export default function FinishDialog({ game, open, onClose }: FinishDialogProps) {
    return (
        <Dialog open={open} onClose={(_, reason) => {
            if (reason === 'backdropClick') return;
            onClose();
        }}>
            <DialogActions>
                <Button onClick={() => onClose()}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import { useRef } from 'react';

import firebase from '../../../firebase';

import styles from './memberDialog.module.css';

interface memberDialogProps {
  open: boolean;
  onClose: (success?: boolean) => void;
}

export default function MemberDialog({ open, onClose }: memberDialogProps) {
  const nameRef = useRef<HTMLInputElement | null>(null);
  const eloRef = useRef<HTMLInputElement | null>(null);

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'backdropClick') return;
        onClose();
      }}
      PaperProps={{
        component: 'form',
        onSubmit: (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault();
          const name = nameRef?.current?.value;
          const elo = Number(eloRef?.current?.value);
          if (name && elo) {
            firebase.addNewGoogler(name, elo);
          }
          onClose();
        },
      }}
    >
      <DialogTitle>Add New Member</DialogTitle>
      <DialogContent>
        <TextField
          required
          id="name"
          label="Name"
          variant="standard"
          fullWidth
          margin="dense"
          inputRef={nameRef}
        ></TextField>
        <TextField
          required
          id="elo"
          label="Initial elo"
          type="number"
          variant="standard"
          fullWidth
          margin="normal"
          inputRef={eloRef}
        />
        <TextField
          id="email"
          label="Email Address"
          type="email"
          variant="standard"
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
          }}
        >
          Cancel
        </Button>
        <Button type="submit" autoFocus>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

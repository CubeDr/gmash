import { useEffect, useState } from 'react';

import Game from '../../../data/game';
import { Googler } from '../../../data/googler';
import googlerService from '../../../services/googlerService';
import GameDialog, { GameDialogAction } from '../GameDialog/GameDialog';
import Court from '../court/Court';

import styles from './GameRow.module.css';

interface GameRowProps {
  games: Game[];
  dialog?: {
    title: string;
    actions?: GameDialogAction[];
  };
}

export default function GameRow({ games, dialog }: GameRowProps) {
  const [googler, setGoogler] = useState<Googler | null>(null);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  function onGameClick(game: Game) {
    if (googler?.role !== 'organizer') {
      return;
    }
    setSelectedGame(game);
  }

  useEffect(() => {
    googlerService.googlerStream.on(googler => setGoogler(googler));
  }, []);

  return (
    <div className={styles.GameRow}>
      {games.map((game, i) => (
        <Court
          key={'upcoming-' + i}
          game={game}
          onClick={() => onGameClick(game)}
        />
      ))}
      {selectedGame && dialog && (
        <GameDialog
          title={dialog.title}
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          open={selectedGame != null}
          actions={dialog.actions}
        />
      )}
    </div>
  );
}

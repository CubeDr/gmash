import { useState } from 'react';

import Game from '../../../data/game';
import googlerService from '../../../services/googlerService';
import useStream from '../../../useStream';
import GameDialog, { GameDialogAction } from '../GameDialog/GameDialog';
import Court from '../court/Court';

import styles from './GameRow.module.css';

interface GameRowProps {
  games: Game[];
  playingMemberIds?: Set<string>;
  dialog?: {
    title: string;
    actions?: GameDialogAction[];
  };
}

export default function GameRow({
  games,
  playingMemberIds,
  dialog,
}: GameRowProps) {
  const googler = useStream(googlerService.googlerStream);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  function onGameClick(game: Game) {
    if (googler?.role !== 'organizer') {
      return;
    }
    setSelectedGame(game);
  }

  return (
    <div className={styles.GameRow}>
      {games.map((game, i) => (
        <Court
          key={'upcoming-' + i}
          game={game}
          playingMemberIds={playingMemberIds}
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

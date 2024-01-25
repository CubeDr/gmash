import {useContext, useState} from 'react';
import Court from '../court/Court';
import styles from './GameRow.module.css';
import Game from '../../../data/game';
import GameDialog, { GameDialogAction } from '../GameDialog/GameDialog';
import { GooglerContext } from '../../../providers/GooglerContext';

interface GameRowProps {
    games: Game[],
    dialog?: {
        title: string,
        actions?: GameDialogAction[];
    },
}

export default function GameRow({games, dialog} : GameRowProps) {
  const {googler} = useContext(GooglerContext);
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
        <Court key={'upcoming-' + i} game={game} onClick={() => onGameClick(game)}/>
      ))}
      {selectedGame && dialog &&
        <GameDialog
          title={dialog.title}
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          open={selectedGame != null}
          actions={dialog.actions}/>
      }
    </div>
  );
}
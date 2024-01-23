import {useState} from 'react';
import Court from '../court/Court';
import styles from './GameRow.module.css';
import Game from '../../../data/game';
import GameDialog, { GameDialogAction } from '../GameDialog/GameDialog';
import FinishDialog from '../finishDialog/FinishDialog';

interface GameRowProps {
    games: Game[],
    dialog?: {
        type: 'game'|'finish',
        title: string,
        actions?: GameDialogAction[];
    },
}

export default function GameRow({games, dialog} : GameRowProps) {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  return (
    <div className={styles.GameRow}>
      {games.map((game, i) => (
        <Court key={'upcoming-' + i} game={game} onClick={() => setSelectedGame(game)}/>
      ))}
      {selectedGame && dialog && dialog.type === 'game' &&
        <GameDialog
          title={dialog.title}
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          open={selectedGame != null}
          actions={dialog.actions}/>
      }
      {selectedGame && dialog && dialog.type === 'finish' &&
        <FinishDialog
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          open={selectedGame != null}/>
      }
    </div>
  );
}
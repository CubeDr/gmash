import { useState } from 'react';

import Game from '../../../data/game';
import gameService from '../../../services/gameService';
import useStream from '../../../useStream';
import FinishDialog from '../finishDialog/FinishDialog';
import GameRow from '../gameRow/GameRow';

export default function PlayingGames() {
  const games = useStream(gameService.playingGamesStream);
  const [finishingGame, setFinishingGame] = useState<Game | null>(null);

  return (
    <>
      <GameRow
        games={games ?? []}
        dialog={{
          title: 'Update a playing game',
          actions: [
            {
              text: 'Finish',
              action: async (game) => {
                setFinishingGame(game);
              },
            },
          ],
        }}
      />
      {finishingGame && (
        <FinishDialog
          game={finishingGame}
          open={finishingGame != null}
          onClose={() => {
            setFinishingGame(null);
          }}
        />
      )}
    </>
  );
}

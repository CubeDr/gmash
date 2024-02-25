import { useEffect, useState } from 'react';

import Game from '../../../data/game';
import firebase from '../../../firebase';
import membersService from '../../../services/membersService';
import FinishDialog from '../finishDialog/FinishDialog';
import GameRow from '../gameRow/GameRow';

export default function PlayingGames() {
  const [games, setGames] = useState<Game[]>([]);
  const [finishingGame, setFinishingGame] = useState<Game | null>(null);

  useEffect(() => {
    if (!membersService.isLoaded) {
      return;
    }
    
    const unsubscribe = firebase.listenToPlayingGames((playingGames) => {
      const games: Game[] = playingGames.map((game) => ({
        team1: game.team1.map((id) => membersService.getMemberById(id)!),
        team2: game.team2.map((id) => membersService.getMemberById(id)!),
        ref: game.ref,
      }));
      setGames(games);
    });
    return () => unsubscribe();
  }, [membersService.isLoaded]);

  return (
    <>
      <GameRow
        games={games}
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

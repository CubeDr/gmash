import Game from '../../../data/game';
import firebase from '../../../firebase';
import gameService from '../../../services/gameService';
import useStream from '../../../useStream';
import GameRow from '../gameRow/GameRow';

export default function UpcomingGames() {
  const games = useStream(gameService.upcomingGamesStream);

  async function playGame(game: Game) {
    if (game.ref == null) throw new Error('Game is not registered correctly.');

    await firebase.delete(game.ref);
    await firebase.addPlayingGame(
      game.team1.map((member) => member.id),
      game.team2.map((member) => member.id)
    );
  }

  async function deleteGame(game: Game) {
    if (game.ref == null) throw new Error('Game is not registered correctly.');

    await firebase.delete(game.ref);
  }

  return (
    <GameRow
      games={games ?? []}
      dialog={{
        title: 'Update an upcoming game',
        actions: [
          {
            text: 'Delete',
            action: deleteGame,
          },
          {
            text: 'Play',
            action: playGame,
          },
        ],
      }}
    />
  );
}

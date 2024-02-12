import {useCallback, useEffect, useState} from 'react';
import firebase from '../../../firebase';
import Game from '../../../data/game';
import GameRow from '../gameRow/GameRow';
import Member from '../../../data/member';

interface Props {
  members: Member[]
}

export default function UpcomingGames({ members }: Props) {
  const [games, setGames] = useState<Game[]>([]);

  const getMemberById = useCallback((id: string) => {
    return members.find(member => member.id === id)!;
  }, [members]);

  async function playGame(game: Game) {
    if (game.ref == null) throw new Error('Game is not registered correctly.');

    await firebase.delete(game.ref);
    await firebase.addPlayingGame(game.team1.map(member => member.id), game.team2.map(member => member.id));
  }

  async function deleteGame(game: Game) {
    if (game.ref == null) throw new Error('Game is not registered correctly.');

    await firebase.delete(game.ref);
  }

  useEffect(() => {
    const unsubscribe = firebase.listenToUpcomingGames(upcomingGames => {
      if (members.length === 0) return;

      const games: Game[] = upcomingGames.map(game => ({
        team1: game.team1.map(id => getMemberById(id)),
        team2: game.team2.map(id => getMemberById(id)),
        ref: game.ref,
      }));
      setGames(games);
    });
    return () => unsubscribe();
  }, [members, getMemberById]);

  return (
    <GameRow
      games={games}
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
import {useContext, useEffect, useState} from 'react';
import firebase from '../../../firebase';
import {MembersContext} from '../../../providers/MembersContext';
import Game from '../../../data/game';
import GameRow from '../gameRow/GameRow';

export default function PlayingGames() {
  const {members} = useContext(MembersContext);
  const [games, setGames] = useState<Game[]>([]);

  function getMemberById(id: string) {
    return members.find(member => member.id === id)!;
  }

  useEffect(() => {
    const unsubscribe = firebase.listenToPlayingGames(playingGames => {
      if (members.length === 0) return;

      const games: Game[] = playingGames.map(game => ({
        team1: game.team1.map(id => getMemberById(id)),
        team2: game.team2.map(id => getMemberById(id)),
        ref: game.ref,
      }));
      setGames(games);
    });
    return () => unsubscribe();
  }, [members]);

  return (
    <GameRow
      games={games}
      dialog={{
        type: 'game',
        title: 'Update a playing game',
        actions: [
          {
            text: 'Finish',
            action: async () => {},
          }
        ],
      }}
    />
  );
}
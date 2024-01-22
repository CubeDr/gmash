import {useContext, useEffect, useState} from 'react';
import firebase from '../../../firebase';
import {MembersContext} from '../../../providers/MembersContext';
import Court from '../court/Court';
import styles from './UpcomingGames.module.css';
import Game from '../../../data/game';
import GameDialog from '../GameDialog/GameDialog';

export default function UpcomingGames() {
  const {members} = useContext(MembersContext);
  const [games, setGames] = useState<Game[]>([]);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  function getMemberById(id: string) {
    return members.find(member => member.id === id)!;
  }

  async function playGame(game: Game) {
    if (game.ref == null) throw new Error('Game is not registered correctly.');

    await firebase.delete(game.ref);
    await firebase.addPlayingGame(game.team1.map(member => member.id), game.team2.map(member => member.id));
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
  }, [members]);

  return (
    <div className={styles.UpcomingGames}>
      {games.map((game, i) => (
        <Court key={'upcoming-' + i} game={game} onClick={() => setSelectedGame(game)}/>
      ))}
      {selectedGame &&
        <GameDialog
          title='Update an upcoming game'
          game={selectedGame}
          onClose={() => setSelectedGame(null)}
          open={selectedGame != null}
          actions={[
            {
              text: 'Play',
              action: playGame,
            }
          ]}/>
      }
    </div>
  );
}
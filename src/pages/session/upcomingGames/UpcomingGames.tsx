import {useContext, useEffect, useState} from 'react';
import firebase from '../../../firebase';
import {MembersContext} from '../../../providers/MembersContext';
import Court from '../court/Court';
import styles from './UpcomingGames.module.css';
import Game from '../../../data/game';

export default function UpcomingGames() {
  const {members} = useContext(MembersContext);
  const [games, setGames] = useState<Game[]>([]);

  function getMemberById(id: string) {
    return members.find(member => member.id === id)!;
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
      {games.map(game => (
        <Court game={game}/>
      ))}
    </div>
  );
}
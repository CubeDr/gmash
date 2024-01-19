import {useContext, useEffect, useState} from 'react';
import firebase from '../../../firebase';
import {Member} from '../../../data/member';
import {MembersContext} from '../../../providers/MembersContext';
import Court from '../court/Court';
import styles from './UpcomingGames.module.css';

export default function UpcomingGames() {
  const {members} = useContext(MembersContext);
  const [games, setGames] = useState<{
    team1: Member[],
    team2: Member[],
  }[]>([]);

  function getMemberById(id: string) {
    return members.find(member => member.id === id)!;
  }

  useEffect(() => {
    const unsubscribe = firebase.listenToUpcomingGames(upcomingGames => {
      if (members.length === 0) return;

      const games = upcomingGames.map(game => ({
        team1: game.team1.map(id => getMemberById(id)),
        team2: game.team2.map(id => getMemberById(id)),
      }));
      setGames(games);
    });
    return () => unsubscribe();
  }, [members]);

  return (
    <div className={styles.UpcomingGames}>
      {games.map(game => (
        <Court team1={game.team1} team2={game.team2}/>
      ))}
    </div>
  );
}
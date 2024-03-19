import { useEffect, useState } from 'react';

import Member from '../../../data/member';
import firebase from '../../../firebase';
import { GameResult } from '../../../firebase/firebase';
import membersService from '../../../services/membersService';

import styles from './GameHistory.module.css';

interface Props {
  sessionId: string;
}

interface GameItem {
  win: Member[];
  lose: Member[];
  winScore: number;
  loseScore: number;
}

function gameResultToGameItem(gameResult: GameResult): GameItem {
  return {
    win: gameResult.win.playersId.map(id => membersService.getMemberById(id)!),
    lose: gameResult.lose.playersId.map(id => membersService.getMemberById(id)!),
    winScore: gameResult.win.score,
    loseScore: gameResult.lose.score,
  };
}

export default function GameHistory({ sessionId }: Props) {
  const [gameItems, setGameItems] = useState<GameItem[]>([]);

  useEffect(() => {
    firebase.getGameResultsForSession(sessionId).then(gameResults => {
      setGameItems(gameResults.map(gameResultToGameItem));
    });
  }, [sessionId]);
  return <>
    {gameItems.map((gameItem, i) => (
      <div key={'gameItem:' + i} className={styles.GameItem}>
        <div className={styles.Members + ' ' + styles.Win}>
          {gameItem.win.map(member => <div key={`gameItem:${i},member:${member.name}`}>{member.name}</div>)}
        </div>
        <div className={styles.Score + ' ' + styles.Win}>{gameItem.winScore}</div>
        <div className={styles.Score + ' ' + styles.Lose}>{gameItem.loseScore}</div>
        <div className={styles.Members + ' ' + styles.Lose}>
          {gameItem.lose.map(member => <div key={`gameItem:${i},member:${member.name}`}>{member.name}</div>)}
        </div>
      </div>
    ))}
  </>;
}
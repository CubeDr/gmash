import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Member from '../../data/member';
import firebase from '../../firebase';
import { SessionHistory } from '../../firebase/firebase';
import membersService from '../../services/membersService';

import styles from './SessionHistoryPage.module.css';

interface HistoryItem {
  timestamp: number;
  id: string;
  players: Member[];
}

export default function SessionHistoryPage() {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);

  function convertToHistoryItem(history: SessionHistory): HistoryItem | null {
    // TODO: remove after cleaning
    if (
      !history.id ||
      !history.timestamp ||
      !history.players ||
      typeof history.players[0] !== 'string'
    ) {
      return null;
    }
    return {
      ...history,
      players: history.players.map((id) =>
        membersService.getMemberById(id)
      ) as Member[],
    };
  }

  useEffect(() => {
    firebase.getSessionHistoryList().then((history) => {
      setHistoryItems(
        history.map(convertToHistoryItem).filter((v) => v) as HistoryItem[]
      );
    });
  }, []);

  return (
    <>
      <h1 className={styles.Title}>Session History</h1>
      {historyItems.map((item) => {
        return (
          <div className={styles.Block} key={item.id}>
            <h3>
              <Link to={item.id}>
                {new Date(item.timestamp).toDateString()}
              </Link>
            </h3>

            <div>
              {item.players.map((member) => (
                <div key={member.id}>{member.name}</div>
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
}

import { useParams } from 'react-router-dom';

import styles from './SessionHistoryDetailPage.module.css';
import GameHistory from './gameHistory/GameHistory';

export default function SessionHistoryDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className={styles.Title}>Session History Detail Page of {id} </h1>
      <h2 className={styles.Title}>Game History</h2>
      {id && <GameHistory sessionId={id} />}
    </div>
  );
}

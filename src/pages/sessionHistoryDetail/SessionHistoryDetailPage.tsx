import { useParams } from 'react-router-dom';

import styles from './SessionHistoryDetailPage.module.css';
import GameHistory from './gameHistory/GameHistory';

export default function SessionHistoryDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className={styles.Title}>Game History</h1>
      {id && <GameHistory sessionId={id} />}
    </div>
  );
}

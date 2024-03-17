import { useParams } from 'react-router-dom';

import styles from './SessionHistoryDetailPage.module.css';

export default function SessionHistoryDetailPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className={styles.Title}>Session History Detail Page of {id} </h1>
    </div>
  );
}

import { Link } from 'react-router-dom';

import styles from './SessionHistoryPage.module.css';

export default function SessionHistoryPage() {
  return (
    <div>
      <h1 className={styles.Title}>Session History</h1>
      {/* show session history list */}
      <div>
        <Link to={'123'}> session1</Link>
      </div>
      <div>
        <Link to={'456'}> session2 </Link>
      </div>
    </div>
  );
}

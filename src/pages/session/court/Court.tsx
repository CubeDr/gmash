import {Member} from '../../../data/member';
import styles from './Court.module.css';

interface CourtProps {
  team1: Member[];
  team2: Member[];
}

export default function Court({team1, team2}: CourtProps) {
  return (
    <div className={styles.Court}>
      <div className={styles.CourtContent}>
        <div className={styles.Team}>
          {team1.map(member => (<span key={member.id} className={styles.Player}>{member.name}</span>))}
        </div>
        <hr className={styles.Divider}/>
        <div className={styles.Team}>
          {team2.map(member => (<span key={member.id} className={styles.Player}>{member.name}</span>))}
        </div>
      </div>
    </div>
  );
}
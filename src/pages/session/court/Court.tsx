import Game from '../../../data/game';

import styles from './Court.module.css';

interface CourtProps {
  game: Game;
  onClick?: (game: Game) => void;
}

export default function Court({ game, onClick }: CourtProps) {
  return (
    <div
      className={styles.Court}
      onClick={(e) => (onClick ? onClick(game) : {})}
    >
      <div className={styles.CourtContent}>
        <div className={styles.Team}>
          {game.team1.map((member) => (
            <span key={member.id} className={styles.Player}>
              {member.name}
            </span>
          ))}
        </div>
        <hr className={styles.Divider} />
        <div className={styles.Team}>
          {game.team2.map((member) => (
            <span key={member.id} className={styles.Player}>
              {member.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

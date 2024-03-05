import Game from '../../../data/game';

import styles from './Court.module.css';

interface CourtProps {
  game: Game;
  playingMemberIds?: Set<string>;
  onClick?: (game: Game) => void;
}

export default function Court({ game, playingMemberIds, onClick }: CourtProps) {
  return (
    <div
      className={styles.Court}
      onClick={() => (onClick ? onClick(game) : {})}
    >
      <div className={styles.CourtContent}>
        <div className={styles.Team}>
          {game.team1.map((member) => (
            <span key={member.id} className={styles.Player + (playingMemberIds?.has(member.id) ? (' ' + styles.Playing) : '')}>
              {member.name}
            </span>
          ))}
        </div>
        <hr className={styles.Divider} />
        <div className={styles.Team}>
          {game.team2.map((member) => (
            <span key={member.id} className={styles.Player + (playingMemberIds?.has(member.id) ? (' ' + styles.Playing) : '')}>
              {member.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

import Member from '../../../data/member';

import styles from './MemberItem.module.css';

interface MemberItemProps {
  member: Member;
  isSelected: boolean;
  isPlaying?: boolean;
  onClick: (member: Member) => void;
}

export default function MemberItem({
  member,
  isSelected,
  isPlaying,
  onClick,
}: MemberItemProps) {
  return (
    <div
      className={styles.Member + ' ' + (isSelected ? styles.Selected : '')}
      onClick={() => onClick(member)}
    >
      <div
        className={styles.MemberRow + (isPlaying ? ' ' + styles.Playing : '')}
      >
        <span>{member.name}</span>
        {/* <span>{member.elo}</span> */}
      </div>
      <span className={styles.GamesToday}>
        {member.played} played / {member.upcoming} upcoming
      </span>
    </div>
  );
}

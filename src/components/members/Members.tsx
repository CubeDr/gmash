import membersService from '../../services/membersService';
import useStream from '../../useStream';

import styles from './Members.module.css';

interface MembersProps {
  mode: 'view' | 'select';
  onSelectedMemberIdsChange: (memberId: string) => void;
  selectedMemberIds: Set<string>;
  showElo: boolean;
  disabledMemberIds: Set<string>;
}

export default function Members({
  mode,
  onSelectedMemberIdsChange,
  selectedMemberIds,
  showElo,
  disabledMemberIds,
}: MembersProps) {
  const members = useStream(membersService.membersStream);

  return (
    <div className={styles.Members}>
      <span className={styles.TotalMembers}>
        Total {members?.length ?? '-'} Members
      </span>
      <ol className={styles.MemberList}>
        {members?.map((member) => (
          <li key={member.id} className={styles.MemberListItem}>
            {mode === 'select' && (
              <input
                type="checkbox"
                id={member.id}
                className={styles.Checkbox}
                defaultChecked={selectedMemberIds.has(member.id)}
                disabled={disabledMemberIds.has(member.id)}
                onChange={() => {
                  onSelectedMemberIdsChange(member.id);
                }}
              />
            )}
            <label className={styles.Label} htmlFor={member.id}>
              {member.name + (showElo ? ' (' + member.elo + ')' : '')}
            </label>
            {disabledMemberIds.has(member.id) && (
              <span className={styles.MemberText}>(in-game)</span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

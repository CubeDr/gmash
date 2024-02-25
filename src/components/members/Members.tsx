import membersService from '../../services/membersService';
import useStream from '../../useStream';

import styles from './Members.module.css';

interface MembersProps {
  mode: 'view' | 'select';
  onSelectedMemberIdsChange: (memberId: string) => void;
  selectedMemberIds: Set<string>;
  showElo: boolean;
}

export default function Members({
  mode,
  onSelectedMemberIdsChange,
  selectedMemberIds,
  showElo,
}: MembersProps) {
  const members = useStream(membersService.membersStream);

  return (
    <div className={styles.Members}>
      <span className={styles.TotalMembers}>
        Total {members?.length ?? '-'} Members
      </span>
      <ol className={styles.MemberList}>
        {members?.map((member) => (
          <li key={member.id}>
            {mode === 'select' && (
              <input
                type="checkbox"
                id={member.id}
                className={styles.Checkbox}
                defaultChecked={selectedMemberIds.has(member.id)}
                onChange={() => {
                  onSelectedMemberIdsChange(member.id);
                }}
              />
            )}
            <label className={styles.Label} htmlFor={member.id}>
              {member.name + (showElo ? ' (' + member.elo + ')' : '')}
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}

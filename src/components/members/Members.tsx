import { useContext } from 'react';

import { MembersContext } from '../../providers/MembersContext';

import styles from './Members.module.css';

interface MembersProps {
  mode: 'view' | 'select';
  onSelectedMemberIdsChange: (memberId: string) => void;
  selectedMemberIds: Set<string>;
}

export default function Members({
  mode,
  onSelectedMemberIdsChange,
  selectedMemberIds,
}: MembersProps) {
  const { members } = useContext(MembersContext);

  return (
    <div className={styles.Members}>
      <span className={styles.TotalMembers}>
        Total {members.length} Members
      </span>
      <ol className={styles.MemberList}>
        {members.map((member) => (
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
              {member.name}
            </label>
          </li>
        ))}
      </ol>
    </div>
  );
}

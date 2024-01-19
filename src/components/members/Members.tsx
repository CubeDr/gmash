import { useContext, useRef } from 'react';
import styles from './Members.module.css';
import { MembersContext } from '../../providers/MembersContext';

interface MembersProps {
    mode: 'view' | 'select';
    onSelectedMemberIdsChange?: (selectedMemberIds: Set<string>) => void;
}

export default function Members({ mode, onSelectedMemberIdsChange }: MembersProps) {
    const { members } = useContext(MembersContext);
    const selectedMemberIds = useRef(new Set<string>());

    return (
        <div className={styles.Members}>
            <span className={styles.TotalMembers}>Total {members.length} Members</span>
            <ol className={styles.MemberList}>
                {
                    members.map(member => (
                        <li key={member.id}>
                            {mode === 'select' &&
                                <input type='checkbox' id={member.id} className={styles.Checkbox} onChange={(e) => {
                                    if (e.target.checked) {
                                        selectedMemberIds.current.add(member.id);
                                    } else {
                                        selectedMemberIds.current.delete(member.id);
                                    }

                                    if (onSelectedMemberIdsChange) {
                                        onSelectedMemberIdsChange(selectedMemberIds.current);
                                    }
                                }} />
                            }
                            <label className={styles.Label} htmlFor={member.id}>{member.name} - {member.elo}</label>
                        </li>
                    ))
                }
            </ol>
        </div>
    );
}
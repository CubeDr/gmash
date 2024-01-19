import useSessionMembers from './useSessionMembers';
import Court from './court/Court';
import styles from './SessionPage.module.css';
import { useRef, useState } from 'react';
import { Member } from '../../data/member';

export default function SessionPage() {
    const { members } = useSessionMembers();
    const [selectedMemberIdsCount, setSelectedMemberIdsCount] = useState(0);
    const selectedMemberIdsRef = useRef(new Set<String>());

    function onMemberClick(element: HTMLElement, member: Member) {
        if (element.classList.contains(styles.SelectedMember)) {
            element.classList.remove(styles.SelectedMember);
            selectedMemberIdsRef.current.delete(member.id);
        } else if (selectedMemberIdsRef.current.size < 4) {
            element.classList.add(styles.SelectedMember);
            selectedMemberIdsRef.current.add(member.id);
        }
        setSelectedMemberIdsCount(selectedMemberIdsRef.current.size);
    }

    return (
        <div className={selectedMemberIdsCount > 0 ? styles.PaddingBottom : ''}>
            <h4 className={styles.SectionTitle}>Now playing</h4>
            <Court team1={members.slice(0, 2)} team2={members.slice(2, 4)} />
            <h4 className={styles.SectionTitle}>Upcoming</h4>
            <Court team1={members.slice(0, 2)} team2={members.slice(2, 4)} />
            <h4 className={styles.SectionTitle}>Members</h4>
            <div className={styles.Members}>
                {
                    members.map(member => (
                        <div key={member.id} className={styles.Member} onClick={e => onMemberClick(e.target as HTMLElement, member)}>
                            <div className={styles.MemberRow}>
                                <span>{member.name}</span>
                                <span>{member.elo}</span>
                            </div>
                            <span className={styles.GamesToday}>0 games played today</span>
                        </div>
                    ))
                }
            </div>
            {selectedMemberIdsCount > 0 &&
                <button className={styles.Button}>
                    Make a game ({selectedMemberIdsCount})
                </button>
            }
        </div>
    );
}
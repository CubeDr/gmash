import { useEffect } from 'react';
import useSelectedMembers from './useSelectedMembers';
import Court from './court/Court';
import styles from './SessionPage.module.css';

export default function SessionPage() {
    const { members } = useSelectedMembers();

    useEffect(() => {
        console.log(members);
    }, [members]);

    return (
        <div>
            <h4 className={styles.SectionTitle}>Now playing</h4>
            <Court team1={members.slice(0, 2)} team2={members.slice(2, 4)} />
            <h4 className={styles.SectionTitle}>Upcoming</h4>
            <Court team1={members.slice(0, 2)} team2={members.slice(2, 4)} />
            <h4 className={styles.SectionTitle}>Members</h4>
        </div>
    );
}
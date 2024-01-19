import useSelectedMembers from './useSelectedMembers';
import Court from './court/Court';
import styles from './SessionPage.module.css';

export default function SessionPage() {
    const { members } = useSelectedMembers();

    return (
        <div>
            <h4 className={styles.SectionTitle}>Now playing</h4>
            <Court team1={members.slice(0, 2)} team2={members.slice(2, 4)} />
            <h4 className={styles.SectionTitle}>Upcoming</h4>
            <Court team1={members.slice(0, 2)} team2={members.slice(2, 4)} />
            <h4 className={styles.SectionTitle}>Members</h4>
            <div className={styles.Members}>
                {
                    members.map(member => (
                        <div className={styles.Member}>
                            <div className={styles.MemberRow}>
                                <span>{member.name}</span>
                                <span>{member.elo}</span>
                            </div>
                            <span className={styles.GamesToday}>0 games played today</span>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}
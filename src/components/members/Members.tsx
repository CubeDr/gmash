import { useEffect, useState } from 'react';
import useGoogler from '../../useGoogler';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import styles from './Members.module.css';

interface Member {
    id: string;
    name: string;
    elo: number;
}

export default function Members() {
    const user = useGoogler();
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        if (user == null) {
            setMembers([]);
            return;
        }

        getDocs(collection(getFirestore(), 'googlers')).then(snapshot => {
            const members: Member[] = [];
            snapshot.forEach(doc => {
                members.push({
                    id: doc.id,
                    ...doc.data(),
                } as Member);
            });
            setMembers(members);
        });
    }, [user]);

    return (
        <div className={styles.Members}>
            <span className={styles.TotalMembers}>Total {members.length} Members</span>
            <ol className={styles.MemberList}>
                {
                    members.map(member => (
                        <li>{member.name} - {member.elo}</li>
                    ))
                }
            </ol>
        </div>
    );
}
import { useEffect, useState } from 'react';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import useGoogler from './useGoogler';
import { Member } from './member';

export default function useMembers() {
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

    return members;
}
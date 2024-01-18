import { useEffect, useState } from 'react';
import { collection, documentId, getDocs, getFirestore, where, query } from 'firebase/firestore';
import useGoogler from './useGoogler';
import { Member } from './member';

interface UseMembersProps {
    selectedMemberIds?: Set<string>;
}

export default function useMembers({ selectedMemberIds }: UseMembersProps = {}) {
    const { googler } = useGoogler();
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        if (googler == null) {
            setMembers([]);
            return;
        }

        const c = collection(getFirestore(), 'googlers');
        const q = selectedMemberIds ?
            query(collection(getFirestore(), 'googlers'), where(documentId(), 'in', Array.from(selectedMemberIds))) :
            c;
        getDocs(q).then(snapshot => {
            const members: Member[] = [];
            snapshot.forEach(doc => {
                members.push({
                    id: doc.id,
                    ...doc.data(),
                } as Member);
            });
            setMembers(members);
        });
    }, [googler, selectedMemberIds]);

    return members;
}
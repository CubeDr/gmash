import { useContext, useEffect, useState } from 'react';
import { MembersContext } from '../../providers/MembersContext';
import { Member } from '../../data/member';
import firebase from '../../firebase';

export default function useSelectedMembers() {
    const { members } = useContext(MembersContext);
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);

    useEffect(() => {
        const unsubscribe = firebase.listenToSessionMemberIds(ids => {
            const idSet = new Set(ids);
            const selected = members.filter(member => idSet.has(member.id));
            setSelectedMembers(selected);
        });
        return () => unsubscribe();
    }, [members]);

    return { members: selectedMembers };
}
import { useContext, useEffect, useState } from 'react';
import { MembersContext } from '../../providers/MembersContext';
import { Member } from '../../data/member';

interface UseSelectedMembersProps {
    selectedMemberIds: Set<string>;
}

export default function useSelectedMembers({ selectedMemberIds }: UseSelectedMembersProps) {
    const { members } = useContext(MembersContext);
    const [selectedMembers, setSelectedMembers] = useState<Member[]>([]);

    useEffect(() => {
        const selected = members.filter(member => selectedMemberIds.has(member.id));
        setSelectedMembers(selected);
    }, [members, selectedMemberIds]);

    return { members: selectedMembers };
}
import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useSelectedMembers from './useSelectedMembers';

export default function SessionPage() {
    const location = useLocation();
    const [selectedMemberIds, setSelectedMemberIds] = useState<Set<string>>(location.state);
    const { members } = useSelectedMembers({selectedMemberIds});

    useEffect(() => {
        console.log(members);
    }, [members]);

    return (
        <div>Session Page</div>
    );
}
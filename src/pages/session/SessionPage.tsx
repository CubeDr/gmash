import { useLocation } from 'react-router-dom';
import useMembers from '../../useMembers';
import { useEffect } from 'react';

export default function SessionPage() {
    const location = useLocation();
    const members = useMembers({
        selectedMemberIds: location.state,
    });

    useEffect(() => {
        console.log(members);
    }, [members]);

    return (
        <div>Session Page</div>
    );
}
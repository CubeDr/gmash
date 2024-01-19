import { useLocation } from 'react-router-dom';
import { useContext, useEffect } from 'react';
import { MembersContext } from '../../providers/MembersContext';

export default function SessionPage() {
    const location = useLocation();
    const members = useContext(MembersContext);

    useEffect(() => {
        console.log(members);
    }, [members]);

    return (
        <div>Session Page</div>
    );
}
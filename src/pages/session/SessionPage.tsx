import { useEffect } from 'react';
import useSelectedMembers from './useSelectedMembers';
import Court from './court/Court';

export default function SessionPage() {
    const { members } = useSelectedMembers();

    useEffect(() => {
        console.log(members);
    }, [members]);

    return (
        <div>
            <Court team1={[members[0], members[1]]} team2={[members[2], members[3]]} />
        </div>
    );
}
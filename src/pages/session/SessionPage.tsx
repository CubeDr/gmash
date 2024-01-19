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
            <Court team1={members.slice(0, 2)} team2={members.slice(2, 4)} />
        </div>
    );
}
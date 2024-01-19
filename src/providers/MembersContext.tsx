import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { Member } from '../data/member';
import firebase from '../firebase';
import { GooglerContext } from './GooglerContext';

interface MembersContextProviderProps {
    selectedMemberIds?: Set<string>;
    children: ReactNode;
}

interface MembersContextTypes {
    members: Member[];
}

export const MembersContext = createContext({
    members: []
} as MembersContextTypes);

export function MembersContextProvider({ selectedMemberIds, children }: MembersContextProviderProps) {
    const { googler } = useContext(GooglerContext);
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        if (googler == null) {
            setMembers([]);
            return;
        }

        if (selectedMemberIds == null) {
            firebase.getAllMembers().then(members => {
                setMembers(members);
            });
        } else {
            firebase.getMembersById(Array.from(selectedMemberIds)).then(members => {
                setMembers(members);
            });
        }
    }, [googler, selectedMemberIds]);

    return (
        <MembersContext.Provider value={{ members }}>
            {children}
        </MembersContext.Provider>
    );
}
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import Member from '../data/member';
import firebase from '../firebase';
import { GooglerContext } from './GooglerContext';

interface MembersContextProviderProps {
    children: ReactNode;
}

interface MembersContextTypes {
    members: Member[];
}

export const MembersContext = createContext({
    members: []
} as MembersContextTypes);

export function MembersContextProvider({ children }: MembersContextProviderProps) {
    const { googler } = useContext(GooglerContext);
    const [members, setMembers] = useState<Member[]>([]);

    useEffect(() => {
        if (googler == null) {
            setMembers([]);
            return;
        }

        firebase.getAllMembers().then(members => {
            setMembers(members);
        });
    }, [googler]);

    return (
        <MembersContext.Provider value={{ members }}>
            {children}
        </MembersContext.Provider>
    );
}
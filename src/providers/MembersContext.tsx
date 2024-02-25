import {
  ReactNode,
  createContext,
  useCallback,
  useEffect,
  useState,
} from 'react';

import Member from '../data/member';
import firebase from '../firebase';

interface MembersContextProviderProps {
  children: ReactNode;
}

interface MembersContextTypes {
  isLoaded: boolean;
  members: Member[];
  getMemberById: (id: string) => Member | undefined;
}

export const MembersContext = createContext({
  isLoaded: false,
  members: [],
  getMemberById: () => undefined,
} as MembersContextTypes);

export function MembersContextProvider({
  children,
}: MembersContextProviderProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [idToMemberMap, setIdToMemberMap] = useState<Map<string, Member>>(new Map());
  const [isLoaded, setIsLoaded] = useState(false);

  const getMemberById = useCallback((id: string) => {
    return idToMemberMap.get(id);
  }, [idToMemberMap]);

  useEffect(() => {
    firebase.getAllMembers().then((members) => {
      setMembers(members);

      const map = new Map<string, Member>();
      for (const member of members) {
        map.set(member.id, member);
      }
      setIdToMemberMap(map);

      setIsLoaded(true);
    });
  }, []);

  return (
    <MembersContext.Provider value={{ isLoaded, members, getMemberById }}>
      {children}
    </MembersContext.Provider>
  );
}

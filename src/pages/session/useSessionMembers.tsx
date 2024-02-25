import { useEffect, useState } from 'react';

import Member from '../../data/member';
import firebase from '../../firebase';
import membersService from '../../services/membersService';

export default function useSelectedMembers() {
  const [members, setMembers] = useState<Member[]>([]);
  const [sessionMembers, setSessionMembers] = useState<Member[]>([]);

  useEffect(() => {
    membersService.membersStream.on(members => setMembers(members));
  }, []);

  useEffect(() => {
    const unsubscribe = firebase.listenToSessionMembers((sessionMemberMap) => {
      const selected = sessionMemberMap
        ? members
            .filter((member) => member.id in sessionMemberMap)
            .map((member) => {
              const sessionInfo = sessionMemberMap[member.id];
              return { ...member, ...sessionInfo };
            })
        : [];

      setSessionMembers(selected);
    });
    return () => unsubscribe();
  }, [members]);

  return { members: sessionMembers };
}

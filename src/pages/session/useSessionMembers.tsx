import { useEffect, useState } from 'react';

import Member from '../../data/member';
import firebase from '../../firebase';
import membersService from '../../services/membersService';
import useStream from '../../useStream';

export default function useSelectedMembers() {
  const members = useStream(membersService.membersStream);
  const [sessionMembers, setSessionMembers] = useState<Member[]>([]);

  useEffect(() => {
    const unsubscribe = firebase.listenToSessionMembers((sessionMemberMap) => {
      const selected =
        sessionMemberMap && members
          ? members
              .filter(
                (member) =>
                  member.id in sessionMemberMap &&
                  sessionMemberMap[member.id].canPlay
              )
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

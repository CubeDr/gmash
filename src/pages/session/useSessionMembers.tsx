import { useEffect, useState } from 'react';

import Member from '../../data/member';
import firebase from '../../firebase';
import membersService from '../../services/membersService';
import useStream from '../../useStream';

export default function useSessionMembers() {
  const members = useStream(membersService.membersStream);
  const [sessionMembers, setSessionMembers] = useState<Member[]>([]);

  useEffect(() => {
    const unsubscribe = firebase.listenToSessionMembers((sessionMembersMap) => {
      const selected =
        sessionMembersMap && members
          ? members
              .filter(
                (member) =>
                  member.id in sessionMembersMap &&
                  sessionMembersMap[member.id].canPlay
              )
              .map((member) => {
                const sessionInfo = sessionMembersMap[member.id];
                // To use real time data, it must be overwritten with the sessionInfo value.
                return { ...member, ...sessionInfo };
              })
          : [];

      setSessionMembers(selected);
    });
    return () => unsubscribe();
  }, [members]);

  return { members: sessionMembers };
}

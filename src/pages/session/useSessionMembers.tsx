import { useContext, useEffect, useState } from 'react';

import { Member } from '../../data/member';
import firebase from '../../firebase';
import { MembersContext } from '../../providers/MembersContext';

export default function useSelectedMembers() {
  const { members } = useContext(MembersContext);
  const [sessionMembers, setSessionMembers] = useState<Member[]>([]);

  useEffect(() => {
    const unsubscribe = firebase.listenToSessionMemberIds((ids) => {
      const idSet = new Set(ids);
      const selected = members.filter((member) => idSet.has(member.id));
      setSessionMembers(selected);
    });
    return () => unsubscribe();
  }, [members]);

  return { members: sessionMembers };
}

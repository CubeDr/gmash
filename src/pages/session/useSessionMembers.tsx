import {useContext, useEffect, useState} from 'react';
import {MembersContext} from '../../providers/MembersContext';
import {Member} from '../../data/member';
import firebase from '../../firebase';

export default function useSelectedMembers() {
  const {members} = useContext(MembersContext);
  const [sessionMembers, setSessionMembers] = useState<Member[]>([]);

  useEffect(() => {
    const unsubscribe = firebase.listenToSessionMembers(sessionMemberMap => {
      const selected = members
        .filter(member => member.id in sessionMemberMap)
        .map(member => {
          const sessionInfo = sessionMemberMap[member.id];
          return {...member, ...sessionInfo}
        });

      setSessionMembers(selected);
    });
    return () => unsubscribe();
  }, [members]);

  return {members: sessionMembers};
}
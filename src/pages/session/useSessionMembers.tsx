import {useContext, useEffect, useState} from 'react';
import {MembersContext} from '../../providers/MembersContext';
import {Member} from '../../data/member';
import firebase from '../../firebase';

export default function useSelectedMembers() {
  const {members} = useContext(MembersContext);
  const [sessionMembers, setSessionMembers] = useState<Member[]>([]);

  useEffect(() => {
    const unsubscribe = firebase.listenToSessionMembers(sessionMembers => {
      const idSet = new Set(sessionMembers.map(sessionMember => sessionMember.id));
      const selected = members.filter(member => idSet.has(member.id));
      setSessionMembers(selected);
    });
    return () => unsubscribe();
  }, [members]);

  return {members: sessionMembers};
}
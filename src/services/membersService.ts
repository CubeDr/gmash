import Member from '../data/member';
import firebase from '../firebase';
import TypedStream from '../typedStream';

class MembersService {
  private readonly idToMemberMap = new Map<string, Member>();
  private loaded = false;

  get isLoaded() {
    return this.loaded;
  }

  readonly membersStream = new TypedStream<Member[]>();

  constructor() {
    firebase.getAllMembers().then((members) => {
      this.membersStream.write(members);
      for (const member of members) {
        this.idToMemberMap.set(member.id, member);
      }
      this.loaded = true;
    });
  }

  getMemberById(id: string) {
    return this.idToMemberMap.get(id);
  }
}

export default new MembersService();

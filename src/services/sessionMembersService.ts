import Game from '../data/game';
import Member from '../data/member';
import { IDBySessionMember } from '../data/sessionMember';
import firebase from '../firebase';
import TypedStream from '../typedStream';

import gameService from './gameService';
import membersService from './membersService';

class SessionMembersService {
  private readonly idToMemberMap = new Map<string, Member>();
  readonly sessionMembersStream = new TypedStream<Member[]>();
  readonly playingMembersIdsStream = new TypedStream<Set<string>>();
  private members: Member[] = [];
  private sessionMembersMap: IDBySessionMember = {};

  constructor() {
    membersService.membersStream.on((members) => {
      this.members = members;
      this.setSessionMembers();
    });

    firebase.listenToSessionMembers((sessionMembersMap) => {
      this.sessionMembersMap = sessionMembersMap;
      this.setSessionMembers();
    });

    gameService.playingGamesStream.on((playingGames) => {
      const playingMemberIds = this.getMemberIdsFromGames(playingGames);
      this.playingMembersIdsStream.write(new Set(playingMemberIds));
    });

    gameService.playedGamesStream.on((playedGames) => {
      const playedMemberCounts = this.getMemberIdsCountfromGames(playedGames);
      Object.entries(playedMemberCounts).map(([id, count]) => {
        this.setMemberById(id, 'played', count);
      });
      this.sessionMembersStream.write(this.getConvertedMap());
    });

    gameService.upcomingGamesStream.on((upcomingGames) => {
      const upcomingMemberCounts =
        this.getMemberIdsCountfromGames(upcomingGames);
      Object.entries(upcomingMemberCounts).map(([id, count]) => {
        this.setMemberById(id, 'upcoming', count);
      });
      this.sessionMembersStream.write(this.getConvertedMap());
    });
  }

  private setSessionMembers() {
    if (!this.members || !this.sessionMembersMap) {
      return;
    }
    const sessionMembers = this.members
      .filter(
        (member) =>
          member.id in this.sessionMembersMap &&
          this.sessionMembersMap[member.id].canPlay
      )
      .map((member) => {
        const sessionInfo = this.sessionMembersMap[member.id];
        const prevMember = this.idToMemberMap.get(member.id);
        // To use real time data, it must be overwritten with the sessionInfo value.
        const updatedMember = {
          ...member,
          ...sessionInfo,
          played: prevMember?.played ?? 0,
          upcoming: prevMember?.upcoming ?? 0,
        };
        this.idToMemberMap.set(updatedMember.id, updatedMember);

        return updatedMember;
      });
    this.sessionMembersStream.write(sessionMembers);
  }

  getMemberById(id: string) {
    return this.idToMemberMap.get(id);
  }

  private setMemberById(
    id: string,
    gameProperty: 'played' | 'upcoming',
    count: number
  ) {
    const prev = this.getMemberById(id);
    this.idToMemberMap.set(id, {
      ...prev,
      [gameProperty]: count,
    } as Member);
  }

  private compareById(a: Member, b: Member) {
    if (!a || !b) {
      return 0;
    }
    const aId = a.id;
    const bId = b.id;
    if (aId < bId) {
      return -1;
    } else if (aId > bId) {
      return 1;
    }
    return 0;
  }

  private getConvertedMap() {
    return Array.from(this.idToMemberMap.values()).sort(this.compareById);
  }

  private getMemberIdsFromGames(games: Game[] = []): string[] {
    return games
      .flatMap((game) => [...game.team1, ...game.team2])
      .map((member) => member.id);
  }

  private getMemberIdsCountfromGames(games: Game[] = []): {
    [key: string]: number;
  } {
    return this.counter(this.getMemberIdsFromGames(games));
  }

  private counter(array: string[]) {
    const count: { [key: string]: number } = {};
    array.forEach((val) => (count[val] = (count[val] || 0) + 1));
    return count;
  }
}

export default new SessionMembersService();

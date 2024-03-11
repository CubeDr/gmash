import Game from '../data/game';
import Member from '../data/member';
import firebase from '../firebase';
import TypedStream from '../typedStream';

import gameService from './gameService';
import membersService from './membersService';

class SessionMembersService {
  private readonly idToMemberMap = new Map<string, Member>();
  readonly sessionMembersStream = new TypedStream<Member[]>();
  readonly playingMembersIdsStream = new TypedStream<Set<string>>();
  private members: Member[] = [];

  constructor() {
    membersService.membersStream.on((members) => {
      this.members = members;
    });

    firebase.listenToSessionMembers((sessionMembersMap) => {
      const sessionMembers =
        sessionMembersMap && this.members
          ? this.members
              .filter(
                (member) =>
                  member.id in sessionMembersMap &&
                  sessionMembersMap[member.id].canPlay
              )
              .map((member) => {
                const sessionInfo = sessionMembersMap[member.id];
                // To use real time data, it must be overwritten with the sessionInfo value.
                const updatedMember = { ...member, ...sessionInfo };
                this.idToMemberMap.set(updatedMember.id, updatedMember);

                return updatedMember;
              })
          : [];

      this.sessionMembersStream.write(sessionMembers);
    });

    gameService.playingGamesStream.on((playingGames) => {
      const playingMemberIds = this.getMemberIdsFromGames(playingGames);
      this.playingMembersIdsStream.write(new Set(playingMemberIds));
    });

    gameService.playedGamesStream.on((playedGames) => {
      const playedMemberIds = this.getMemberIdsFromGames(playedGames);
      playedMemberIds.map((id) => {
        this.setMemberById(id, 'played');
      });
      this.sessionMembersStream.write(this.getConvertedMap());
    });

    gameService.upcomingGamesStream.on((upcomingGames) => {
      const upcomingMemberIds = this.getMemberIdsFromGames(upcomingGames);
      upcomingMemberIds.map((id) => {
        this.setMemberById(id, 'upcoming');
      });
      this.sessionMembersStream.write(this.getConvertedMap());
    });
  }

  getMemberById(id: string) {
    return this.idToMemberMap.get(id);
  }

  setMemberById(id: string, gameProperty: 'played' | 'upcoming') {
    const prev = this.getMemberById(id);
    this.idToMemberMap.set(id, {
      ...prev,
      [gameProperty]: prev?.[gameProperty] ?? 0 + 1,
    } as Member);
  }

  getConvertedMap() {
    return Object.values(this.idToMemberMap);
  }

  getMemberIdsFromGames(games: Game[] = []): string[] {
    return games
      .flatMap((game) => [...game.team1, ...game.team2])
      .map((member) => member.id);
  }
}

export default new SessionMembersService();

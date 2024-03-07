import Game from '../../../data/game';
import Member from '../../../data/member';

interface ScoredGame {
  game: Game;
  score: number;
}

function getGameCount(member: Member, playingMemberIds: Set<string>) {
  const played = member.played ?? 0;
  const upcoming = member.upcoming ?? 0;
  const playing = playingMemberIds.has(member.id) ? 1 : 0;
  return played + upcoming + playing;
}

function getMaxGameCount(members: Member[], playingMemberIds: Set<string>) {
  return Math.max(...members.map(member => getGameCount(member, playingMemberIds)));
}

function generateAllPossiblePlayers(members: Member[]): Member[][] {
  if (members.length < 4) {
    return [];
  }

  const players = [];
  for (let p1 = 0; p1 < members.length; p1++) {
    for (let p2 = p1 + 1; p2 < members.length; p2++) {
      for (let p3 = p2 + 1; p3 < members.length; p3++) {
        for (let p4 = p3 + 1; p4 < members.length; p4++) {
          players.push([members[p1], members[p2], members[p3], members[p4]]);
        }
      }
    }
  }
  return players;
}

function generateAllPossibleGames(members: Member[]): Game[] {
  return generateAllPossiblePlayers(members).flatMap(([a, b, c, d]) => [
    {
      team1: [a, b],
      team2: [c, d],
    },
    {
      team1: [a, c],
      team2: [b, d],
    },
    {
      team1: [a, d],
      team2: [b, c],
    },
  ]);
}

function getTeamElo(team: Member[]) {
  const elos = team.map((player) => player.elo!);
  const low = Math.min(...elos);
  const high = Math.max(...elos);
  return low * 0.6 + high * 0.4;
}

function getTeamEloDiff(game: Game) {
  return Math.abs(getTeamElo(game.team1) - getTeamElo(game.team2));
}

function getInsufficientGames(game: Game, maxPlayedCount: number, playingMemberIds: Set<string>) {
  return [...game.team1, ...game.team2]
    .map(member => maxPlayedCount - getGameCount(member, playingMemberIds))
    .reduce((a, b) => a + b, 0);
}

function getTeamIdentifier(team: Member[]) {
  return team.map(m => m.id).sort().join();
}

function isSameGame(game1: Game, game2: Game) {
  if (game1 === game2) return true;
  const team11 = getTeamIdentifier(game1.team1);
  const team12 = getTeamIdentifier(game1.team2);
  const team21 = getTeamIdentifier(game2.team1);
  const team22 = getTeamIdentifier(game2.team2);

  return (team11 === team21 && team12 === team22) || (team11 === team22 && team12 === team21);
}

function isExactDuplicate(game: Game, allGames: Game[]) {
  for (const g of allGames) {
    if (isSameGame(game, g)) return true;
  }
  return false;
}

function getIdentifier(ids: string[]) {
  return ids.sort().join();
}

function toTeamIdentifiers(game: Game) {
  return [
    getTeamIdentifier(game.team1),
    getTeamIdentifier(game.team2),
  ];
}

function toThreeIdentifiers(game: Game) {
  const ids = [...game.team1, ...game.team2].flatMap(member => member.id);
  const identifiers = [];
  for (let i = 0; i < ids.length; i++) {
    identifiers.push(getIdentifier([...ids.slice(0, i), ...ids.slice(i + 1, ids.length)]));
  }
  return identifiers;
}

function generateIdentifiersCountMap(games: Game[], identifierFunction: (game: Game) => string[]) {
  const map = new Map<string, number>();
  for (const game of games) {
    for (const identifier of identifierFunction(game)) {
      map.set(identifier, (map.get(identifier) ?? 0) + 1);
    }
  }
  return map;
}

function countIdentifierDuplicates(game: Game, identifierFunction: (game: Game) => string[], countMap: Map<string, number>) {
  return identifierFunction(game)
    .map(identifier => countMap.get(identifier) ?? 0)
    .reduce((a, b) => a + b, 0);
}

function scoreGame(game: Game, maxPlayedCount: number,
  playingMemberIds: Set<string>,
  allGames: Game[],
  twoIdentifiersCountMap: Map<string, number>,
  threeIdentifiersCountMap: Map<string, number>): ScoredGame {
  const eloDiff = getTeamEloDiff(game);
  const insufficientGames = getInsufficientGames(game, maxPlayedCount, playingMemberIds);
  const exactDupe = isExactDuplicate(game, allGames) ? 1 : 0;
  const teamDupes = countIdentifierDuplicates(game, toTeamIdentifiers, twoIdentifiersCountMap);
  const threeDupes = countIdentifierDuplicates(game, toThreeIdentifiers, threeIdentifiersCountMap);

  const score = eloDiff * -1 + insufficientGames * 350 + exactDupe * -800 + teamDupes * -100 + threeDupes * -80;

  return { game, score };
}

export default function generateRecommendedGames(members: Member[], playingMemberIds: Set<string>, allGames: Game[]): Game[] {
  const maxPlayedCount = getMaxGameCount(members, playingMemberIds);
  const teamIdentifiersCountMap = generateIdentifiersCountMap(allGames, toTeamIdentifiers);
  const threeIdentifiersCountMap = generateIdentifiersCountMap(allGames, toThreeIdentifiers);

  return generateAllPossibleGames(members)
    .map(game => scoreGame(game, maxPlayedCount, playingMemberIds, allGames, teamIdentifiersCountMap, threeIdentifiersCountMap))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(scoredGame => scoredGame.game);
}

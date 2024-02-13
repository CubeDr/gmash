import Game from '../../../data/game';
import Member from '../../../data/member';

interface ScoredGame {
    game: Game;
    score: number;
}

function getGameCount(member: Member) {
    return (member.played ?? 0) + (member.upcoming ?? 0);
}

function getMaxGameCount(members: Member[]) {
    return Math.max(...members.map(getGameCount));
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
    return generateAllPossiblePlayers(members)
        .flatMap(([a, b, c, d]) => [
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
    const elos = team.map(player => player.elo!);
    const low = Math.min(...elos);
    const high = Math.max(...elos);
    return low * 0.6 + high * 0.4;
}

function getTeamEloDiff(game: Game) {
    return Math.abs(getTeamElo(game.team1) - getTeamElo(game.team2));
}

function getInsufficientGames(game: Game, maxPlayedCount: number) {
    return [...game.team1, ...game.team2]
        .map(member => maxPlayedCount - getGameCount(member))
        .reduce((a, b) => a + b, 0);
}

function scoreGame(game: Game, maxPlayedCount: number): ScoredGame {
    const eloDiff = getTeamEloDiff(game);
    const insufficientGames = getInsufficientGames(game, maxPlayedCount);

    const score = eloDiff * -1 + insufficientGames * -350;

    return { game, score };
}

export default function generateRecommendedGames(members: Member[]): Game[] {
    const maxPlayedCount = getMaxGameCount(members);
    const games = generateAllPossibleGames(members);
    return games
        .map(game => scoreGame(game, maxPlayedCount))
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map(scoredGame => scoredGame.game);
}

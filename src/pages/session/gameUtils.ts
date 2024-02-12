import Game from '../../data/game';
import Member from '../../data/member';

export function makeGameFromMembers(members: Set<Member>): Game {
    const sorted = Array.from(members).sort((a, b) => b.elo - a.elo);

    return {
        team1: [...sorted.slice(0, 1), ...sorted.slice(3)],
        team2: sorted.slice(1, 3),
    };
}
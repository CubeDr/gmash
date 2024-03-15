import Game from '../data/game';
import Member from '../data/member';
import firebase from '../firebase';
import TypedStream from '../typedStream';

import membersService from './membersService';

function toTeam(team: Member[], score: number) {
  return {
    playersId: team.map((member) => member.id),
    score,
  };
}

class GameService {
  readonly allGamesStream = new TypedStream<Game[]>();

  readonly playedGamesStream = new TypedStream<Game[]>();
  readonly playingGamesStream = new TypedStream<Game[]>();
  readonly upcomingGamesStream = new TypedStream<Game[]>();

  constructor() {
    firebase.listenToGameResults((gameResults) => {
      const games: Game[] = gameResults.map((gameResult) => ({
        team1: gameResult.win.playersId.map(
          (id) => membersService.getMemberById(id)!
        ),
        team2: gameResult.lose.playersId.map(
          (id) => membersService.getMemberById(id)!
        ),
      }));
      this.playedGamesStream.write(games);
      this.onGamesUpdated();
    });

    firebase.listenToPlayingGames((playingGames) => {
      const games: Game[] = playingGames.map((game) => ({
        team1: game.team1.map((id) => membersService.getMemberById(id)!),
        team2: game.team2.map((id) => membersService.getMemberById(id)!),
        ref: game.ref,
      }));
      this.playingGamesStream.write(games);
      this.onGamesUpdated();
    });

    firebase.listenToUpcomingGames((upcomingGames) => {
      const games: Game[] = upcomingGames.map((game) => ({
        team1: game.team1.map((id) => membersService.getMemberById(id)!),
        team2: game.team2.map((id) => membersService.getMemberById(id)!),
        ref: game.ref,
      }));
      this.upcomingGamesStream.write(games);
      this.onGamesUpdated();
    });
  }

  recordPlayedGame(game: Game, team1Score: number, team2Score: number) {
    const team1 = toTeam(game.team1, team1Score);
    const team2 = toTeam(game.team2, team2Score);

    const win = team1Score > team2Score ? team1 : team2;
    const lose = team1Score > team2Score ? team2 : team1;

    firebase.delete(game.ref!);
    firebase.addGameResult(win, lose);

    this.onGamesUpdated();
  }

  private onGamesUpdated() {
    const allGames = [
      ...(this.playedGamesStream.value ?? []),
      ...(this.playingGamesStream.value ?? []),
      ...(this.upcomingGamesStream.value ?? []),
    ];
    this.allGamesStream.write(allGames);
  }
}

export default new GameService();

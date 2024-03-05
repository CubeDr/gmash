import { useEffect, useState } from 'react';

import Game from '../../../data/game';
import gameService from '../../../services/gameService';
import useStream from '../../../useStream';
import GameRow from '../gameRow/GameRow';
import useSessionMembers from '../useSessionMembers';

import generateRecommendedGames from './generateRecommendedGames';

interface Props {
  playingMemberIds: Set<string>;
}

export default function RecommendedGames({ playingMemberIds }: Props) {
  const { members } = useSessionMembers();
  const playingGames = useStream(gameService.playingGamesStream);
  const allGames = useStream(gameService.allGamesStream);
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);

  useEffect(() => {
    const playingMemberIds = new Set((playingGames ?? [])
      .flatMap(game => [...game.team1, ...game.team2])
      .map(member => member.id));
    setRecommendedGames(generateRecommendedGames(members, playingMemberIds, allGames ?? []));
  }, [members, playingGames, allGames]);

  return (
    <GameRow
      games={recommendedGames}
      playingMemberIds={playingMemberIds}
      dialog={{
        title: 'Recommended game',
        actions: [],
      }}
    />
  );
}

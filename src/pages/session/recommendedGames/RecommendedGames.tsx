import { useEffect, useState } from 'react';

import Game from '../../../data/game';
import gameService from '../../../services/gameService';
import sessionMembersService from '../../../services/sessionMembersService';
import useStream from '../../../useStream';
import GameRow from '../gameRow/GameRow';

import generateRecommendedGames from './generateRecommendedGames';

interface Props {
  playingMemberIds: Set<string>;
}

export default function RecommendedGames({ playingMemberIds }: Props) {
  const members = useStream(sessionMembersService.sessionMembersStream);
  const allGames = useStream(gameService.allGamesStream);
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);

  useEffect(() => {
    setRecommendedGames(
      generateRecommendedGames(members ?? [], playingMemberIds, allGames ?? [])
    );
  }, [members, playingMemberIds, allGames]);

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

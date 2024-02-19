import { useEffect, useState } from 'react';

import Game from '../../../data/game';
import Member from '../../../data/member';
import GameRow from '../gameRow/GameRow';

import generateRecommendedGames from './generateRecommendedGames';

interface RecommendedGamesProps {
  members: Member[];
}

export default function RecommendedGames({ members }: RecommendedGamesProps) {
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);

  useEffect(() => {
    setRecommendedGames(generateRecommendedGames(members));
  }, [members]);

  return (
    <GameRow
      games={recommendedGames}
      dialog={{
        title: 'Recommended game',
        actions: [],
      }}
    />
  );
}

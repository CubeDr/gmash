import { useEffect, useState } from 'react';

import Game from '../../../data/game';
import Member from '../../../data/member';
import firebase from '../../../firebase';
import GameRow from '../gameRow/GameRow';

import generateRecommendedGames from './generateRecommendedGames';

interface RecommendedGamesProps {
  members: Member[];
}

export default function RecommendedGames({ members }: RecommendedGamesProps) {
    const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);
    const [playingMemberIds, setplayingMemberIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        setRecommendedGames(generateRecommendedGames(members, playingMemberIds));
    }, [members, playingMemberIds]);

    useEffect(() => {
      // TODO: Optimize firebase connection with /workspaces/gmash/src/pages/session/playingGames/PlayingGames.tsx
      const unsubscribe = firebase.listenToPlayingGames((playingGames) => {
        setplayingMemberIds(new Set(playingGames.flatMap(game => [...game.team1, ...game.team2])));
      });
      return () => unsubscribe();
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

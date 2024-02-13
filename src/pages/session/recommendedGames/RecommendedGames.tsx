import GameRow from '../gameRow/GameRow';

export default function RecommendedGames() {
  return (
    <GameRow
      games={[]}
      dialog={{
        title: 'Recommended game',
        actions: [],
      }}
    />
  );
}

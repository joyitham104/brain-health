import { useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { games } from '../games';
import { nextLevel } from '../lib/adaptive';
import { addSession, getProgress, newId, setProgress } from '../lib/db';
import { getPlayerCode } from '../lib/player';
import { sessionScore } from '../lib/scoring';

export default function Play() {
  const { gameId } = useParams();
  const nav = useNavigate();
  const playerCode = getPlayerCode();
  const game = games.find((g) => g.id === gameId && g.ready);
  const start = useMemo(
    () => (playerCode && game ? getProgress(playerCode, game.id) : null),
    [playerCode, game],
  );
  const startLevel = useRef(start?.level ?? 1);
  const [level, setLevel] = useState(start?.level ?? 1);
  const [streak, setStreak] = useState(start?.streak ?? { right: 0, wrong: 0 });

  if (!playerCode) return <Navigate to="/" replace />;
  if (!game || !start) return <Navigate to="/menu" replace />;

  const GameView = game.Component;

  return (
    <main className="screen">
      <p className="small">
        {game.name} · level {level}
      </p>
      <GameView
        level={level}
        onAnswer={(correct) => {
          const next = nextLevel(level, streak, correct);
          setLevel(next.level);
          setStreak(next.streak);
          setProgress({ playerCode, gameId: game.id, ...next });
        }}
        onFinish={(result) => {
          const score = sessionScore(startLevel.current, result.accuracy);
          addSession({
            id: newId(),
            playerCode,
            gameId: game.id,
            domain: game.domain,
            level: startLevel.current,
            accuracy: result.accuracy,
            medianResponseMs: result.medianResponseMs,
            itemsAttempted: result.itemsAttempted,
            score,
            playedAt: new Date().toISOString(),
            notes: result.notes,
          });
          nav('/results', {
            state: {
              gameName: game.name,
              itemsAttempted: result.itemsAttempted,
              accuracy: result.accuracy,
            },
          });
        }}
      />
    </main>
  );
}

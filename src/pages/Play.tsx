import { useEffect, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import BigButton from '../components/BigButton';
import { GameIcon } from '../components/Visuals';
import { DOMAIN_LABELS, games, type SessionResult } from '../games/index.ts';
import { nextLevel } from '../lib/adaptive';
import { addSession, getProgress, newId, setProgress } from '../lib/db';
import { getPlayerCode } from '../lib/player';
import { sessionScore } from '../lib/scoring';
import { cancelSpeech, say } from '../lib/speech';

export default function Play() {
  const { gameId } = useParams();
  return <PlaySession key={gameId ?? 'none'} />;
}

function PlaySession() {
  const { gameId } = useParams();
  const nav = useNavigate();
  const playerCode = getPlayerCode();
  const game = games.find((item) => item.id === gameId && item.ready);
  const maxLevel = game?.maxLevel ?? 10;
  const saved = playerCode && game ? getProgress(playerCode, game.id) : null;
  const openingLevel = Math.min(saved?.level ?? 1, maxLevel);

  const [level, setLevel] = useState(openingLevel);
  const [started, setStarted] = useState(false);
  const startLevel = useRef(openingLevel);
  const levelRef = useRef(openingLevel);
  const streakRef = useRef(saved?.streak ?? { right: 0, wrong: 0 });
  const finished = useRef(false);

  useEffect(() => {
    if (game) say(game.description);
  }, [game]);

  if (!playerCode) return <Navigate to="/" replace />;
  if (!game || !saved) return <Navigate to="/menu" replace />;

  const GameView = game.Component;

  function leave() {
    cancelSpeech();
    nav('/menu');
  }

  if (!started) {
    return (
      <main className="screen">
        <header className="topbar">
          <p className="kicker">{DOMAIN_LABELS[game.domain]}</p>
          <p className="player-id">Level {level}</p>
        </header>
        <div className="game-intro">
          <GameIcon name={game.id} domain={game.domain} />
          <div>
            <h1>{game.name}</h1>
            <p className="lead">{game.description}</p>
          </div>
        </div>
        <p className="small">Based on {game.modeledOn}. Speak or tap. You can stop at any time.</p>
        <div className="stack footer-actions">
          <BigButton
            primary
            onClick={() => {
              cancelSpeech();
              setStarted(true);
            }}
          >
            Start
          </BigButton>
          <BigButton onClick={() => say(game.description)}>Hear that again</BigButton>
          <BigButton onClick={leave}>Back to games</BigButton>
        </div>
      </main>
    );
  }

  return (
    <main className="screen">
      <header className="topbar">
        <p className="kicker">{game.name}</p>
        <p className="player-id">Level {level}</p>
      </header>
      <GameView
        level={level}
        onAnswer={(correct: boolean) => {
          const next = nextLevel(levelRef.current, streakRef.current, correct, maxLevel);
          levelRef.current = next.level;
          streakRef.current = next.streak;
          setLevel(next.level);
          setProgress({ playerCode, gameId: game.id, ...next });
        }}
        onFinish={(result: SessionResult) => {
          if (finished.current) return;
          finished.current = true;
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
            },
          });
        }}
      />
      <div className="footer-actions">
        <BigButton onClick={leave}>Stop</BigButton>
      </div>
    </main>
  );
}

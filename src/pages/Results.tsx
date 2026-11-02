import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import { AppMark, PageGraphic } from '../components/Visuals';
import { getSessions } from '../lib/db';
import { getPlayerCode } from '../lib/player';
import { say } from '../lib/speech';

type State = { gameName: string; itemsAttempted: number };

export default function Results() {
  const nav = useNavigate();
  const code = getPlayerCode();
  const state = useLocation().state as State | null;
  const weekCount = code
    ? getSessions(code).filter((s) => Date.now() - new Date(s.playedAt).getTime() < 7 * 86400000).length
    : 0;

  const line = state
    ? `You finished ${state.gameName}. You worked through ${state.itemsAttempted} items. You played ${weekCount} time${weekCount === 1 ? '' : 's'} this week.`
    : 'Nice work today.';

  useEffect(() => {
    say(line);
  }, [line]);

  return (
    <main className="screen">
      <header className="topbar">
        <div className="brand">
          <AppMark />
          <p className="kicker">Brain Health</p>
        </div>
        {code && <p className="player-id">Player {code}</p>}
      </header>
      <h1>Well done</h1>
      <PageGraphic kind="success" />
      <p className="prompt">{line}</p>
      <div className="stack footer-actions">
        <BigButton primary onClick={() => nav('/menu')}>
          Play another
        </BigButton>
        <BigButton onClick={() => nav('/stats')}>See my stats</BigButton>
        <BigButton onClick={() => say(line)}>Hear that again</BigButton>
      </div>
    </main>
  );
}

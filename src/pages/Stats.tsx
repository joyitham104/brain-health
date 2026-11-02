import { Navigate, useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import DomainBars from '../components/DomainBars';
import LineChart from '../components/LineChart';
import { AppMark, GameIcon, PageGraphic } from '../components/Visuals';
import { DOMAIN_LABELS, games } from '../games/index.ts';
import type { Domain } from '../games/types';
import { downloadCSV, toCSV } from '../lib/csv';
import { getProgressList, getSessions } from '../lib/db';
import { getPlayerCode } from '../lib/player';
import { domainScore, pointsPerWeek } from '../lib/scoring';

const DOMAINS = Object.keys(DOMAIN_LABELS) as Domain[];

function when(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function trendWords(pointsPerWeekValue: number, n: number) {
  if (n < 3) return 'Need a few more sittings to see a trend.';
  if (pointsPerWeekValue > 1) return 'Trending up over recent sittings.';
  if (pointsPerWeekValue < -1) return 'A little lower lately. That can be a tired day.';
  return 'Holding steady.';
}

export default function Stats() {
  const nav = useNavigate();
  const code = getPlayerCode();
  if (!code) return <Navigate to="/" replace />;

  const sessions = getSessions(code);
  const weekCount = sessions.filter(
    (s) => Date.now() - new Date(s.playedAt).getTime() < 7 * 86400000,
  ).length;
  const scores = Object.fromEntries(
    DOMAINS.map((d) => [d, domainScore(sessions, d)]),
  ) as Partial<Record<Domain, number | null>>;
  const first = sessions[0]?.playedAt;
  const t0 = first ? new Date(first).getTime() : 0;
  const progress = getProgressList(code);

  return (
    <main className="screen">
      <header className="topbar">
        <div className="brand">
          <AppMark />
          <p className="kicker">Your progress</p>
        </div>
        <p className="player-id">Player {code}</p>
      </header>
      <h1>Stats</h1>
      <p className="lead">This tracks how often you play and how each skill is moving. It does not diagnose.</p>
      <PageGraphic kind="stats" />

      <div className="stat-grid">
        <div className="stat-card">
          <span className="kicker">Sittings</span>
          <strong>{sessions.length}</strong>
        </div>
        <div className="stat-card">
          <span className="kicker">This week</span>
          <strong>{weekCount}</strong>
        </div>
        <div className="stat-card">
          <span className="kicker">Games started</span>
          <strong>{progress.length}</strong>
        </div>
      </div>

      {sessions.length === 0 ? (
        <p>Play a game and your history will show up here.</p>
      ) : (
        <>
          <h2>Skills</h2>
          <DomainBars scores={scores} />

          <h2>Over time</h2>
          <LineChart
            points={sessions.slice(-12).map((s) => ({
              x: (new Date(s.playedAt).getTime() - t0) / 86400000,
              y: s.score,
            }))}
          />
          <p className="small">Each dot is one sitting. Higher means a harder level with solid answers.</p>

          <h2>Current levels</h2>
          <div className="stack">
            {games.filter((g) => g.ready).map((g) => {
              const row = progress.find((p) => p.gameId === g.id);
              const inGame = sessions.filter((s) => s.gameId === g.id);
              const slopeWeek = pointsPerWeek(sessions, g.domain);
              return (
                <div className="tile game-tile" key={g.id}>
                  <GameIcon name={g.id} domain={g.domain} />
                  <span className="kicker">{DOMAIN_LABELS[g.domain]}</span>
                  <strong className="tile-title">{g.name}</strong>
                  <span className="small">
                    Level {row?.level ?? 1} · {inGame.length} sitting{inGame.length === 1 ? '' : 's'}
                  </span>
                  <span className="small">{trendWords(slopeWeek, inGame.length)}</span>
                </div>
              );
            })}
          </div>

          <h2>Recent sittings</h2>
          <ul className="history">
            {[...sessions].reverse().slice(0, 12).map((s) => {
              const game = games.find((g) => g.id === s.gameId);
              return (
                <li key={s.id}>
                  <span>{game?.name ?? s.gameId}</span>
                  <span className="small">
                    {when(s.playedAt)} · level {s.level} · {s.itemsAttempted} items
                  </span>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <div className="stack footer-actions">
        {sessions.length > 0 && (
          <BigButton
            primary
            onClick={() => downloadCSV(`brain-health-${code}.csv`, toCSV(sessions))}
          >
            Download my data
          </BigButton>
        )}
        <BigButton onClick={() => nav('/menu')}>Back to games</BigButton>
      </div>
    </main>
  );
}

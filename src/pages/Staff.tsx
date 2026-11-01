import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DomainBars from '../components/DomainBars';
import LineChart from '../components/LineChart';
import BigButton from '../components/BigButton';
import { DOMAIN_LABELS, type Domain } from '../games/types';
import { downloadCSV, toCSV } from '../lib/csv';
import { getSessions, playerCodes } from '../lib/db';
import { brainHealthIndex, domainScore, pointsPerWeek } from '../lib/scoring';

const DOMAINS = Object.keys(DOMAIN_LABELS) as Domain[];

export default function Staff() {
  const nav = useNavigate();
  const codes = playerCodes();
  const [selected, setSelected] = useState(codes[0] ?? '');
  const sessions = useMemo(() => (selected ? getSessions(selected) : []), [selected]);
  const scores = Object.fromEntries(
    DOMAINS.map((d) => [d, domainScore(sessions, d)]),
  ) as Partial<Record<Domain, number | null>>;
  const index = brainHealthIndex(sessions);
  const first = sessions[0]?.playedAt;

  return (
    <main className="screen">
      <h1>Staff view</h1>
      <p className="small">This measures participation and performance over time. It does not diagnose.</p>
      {codes.length === 0 && <p>No sessions yet. Play as a player first.</p>}
      {codes.length > 0 && (
        <>
          <label htmlFor="player">Player</label>
          <select
            id="player"
            className="big-btn"
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
          >
            {codes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {index != null && (
            <p className="prompt">Brain Health Index {Math.round(index)}</p>
          )}
          <DomainBars scores={scores} />
          {DOMAINS.map((d) => {
            const pts = sessions.filter((s) => s.domain === d);
            if (pts.length < 2 || !first) return null;
            const t0 = new Date(first).getTime();
            const slopeWeek = pointsPerWeek(sessions, d);
            return (
              <section key={d} style={{ marginTop: 20 }}>
                <h2>{DOMAIN_LABELS[d]}</h2>
                {slopeWeek < -2 && pts.length >= 8 && (
                  <p className="warn">Flag: {slopeWeek.toFixed(1)} points per week</p>
                )}
                <p className="small">Trend {slopeWeek.toFixed(1)} points per week</p>
                <LineChart
                  points={pts.slice(-8).map((s) => ({
                    x: (new Date(s.playedAt).getTime() - t0) / 86400000,
                    y: s.score,
                  }))}
                />
              </section>
            );
          })}
          <div className="stack" style={{ marginTop: 24 }}>
            <BigButton
              primary
              onClick={() => downloadCSV(`brain-health-${selected}.csv`, toCSV(sessions))}
            >
              Export CSV
            </BigButton>
          </div>
        </>
      )}
      <div style={{ marginTop: 16 }}>
        <BigButton onClick={() => nav('/')}>Sign out</BigButton>
      </div>
    </main>
  );
}

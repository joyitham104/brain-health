import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { games } from '../games';
import { getPlayerCode } from '../lib/player';
import { say } from '../lib/speech';
import BigButton from '../components/BigButton';

export default function Menu() {
  const code = getPlayerCode();
  const nav = useNavigate();

  useEffect(() => {
    if (!code) nav('/');
  }, [code, nav]);

  return (
    <main className="screen">
      <h1>Choose a game</h1>
      <p>Player {code}</p>
      <div className="stack">
        {games.map((g) =>
          g.ready ? (
            <Link key={g.id} to={`/play/${g.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div className="tile" onClick={() => say(g.description)}>
                <strong>{g.name}</strong>
                <div className="small">{g.description}</div>
              </div>
            </Link>
          ) : (
            <div key={g.id} className="tile soon">
              <strong>{g.name}</strong>
              <div className="small">Coming soon</div>
            </div>
          ),
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <BigButton onClick={() => nav('/')}>Switch player</BigButton>
      </div>
    </main>
  );
}

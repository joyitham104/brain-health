import { Navigate, useNavigate } from 'react-router-dom';
import BigButton from '../components/BigButton';
import { AppMark, GameIcon } from '../components/Visuals';
import { DOMAIN_LABELS, games, type Game } from '../games/index.ts';
import { getPlayerCode } from '../lib/player';

function domainName(game: Game) {
  return DOMAIN_LABELS[game.domain];
}

export default function Menu() {
  const code = getPlayerCode();
  const nav = useNavigate();

  if (!code) return <Navigate to="/" replace />;

  return (
    <main className="screen">
      <header className="topbar">
        <div className="brand">
          <AppMark />
          <p className="kicker">Brain Health</p>
        </div>
        <p className="player-id">Player {code}</p>
      </header>
      <h1>Choose a game</h1>
      <p className="lead">One skill at a time. Tap a card to begin.</p>
      <div className="stack">
        {games.map((game: Game) =>
          game.ready ? (
            <button
              key={game.id}
              type="button"
              className="tile game-tile"
              onClick={() => nav(`/play/${game.id}`)}
            >
              <GameIcon name={game.id} domain={game.domain} />
              <span className="kicker">{domainName(game)}</span>
              <strong className="tile-title">{game.name}</strong>
              <span className="small">{game.description}</span>
            </button>
          ) : (
            <div key={game.id} className="tile game-tile soon">
              <GameIcon name={game.id} domain={game.domain} />
              <span className="kicker">{domainName(game)}</span>
              <strong className="tile-title">{game.name}</strong>
              <span className="small">Coming soon</span>
            </div>
          ),
        )}
      </div>
      <div className="stack footer-actions">
        <BigButton primary onClick={() => nav('/stats')}>
          My stats
        </BigButton>
        <BigButton onClick={() => nav('/')}>Switch player</BigButton>
      </div>
    </main>
  );
}

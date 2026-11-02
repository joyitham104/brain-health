import type { Domain } from '../games/types';

type GameIconName =
  | 'patternRecall'
  | 'wordFluency'
  | 'mathRiddles'
  | 'schulte'
  | 'trainTrack'
  | 'uno'
  | 'spotDifference';

const domainColors: Record<Domain, string> = {
  workingMemory: '#6d28d9',
  attention: '#0a5bd3',
  language: '#0f766e',
  numerical: '#b45309',
  visuospatial: '#1d6b45',
  executive: '#9f1239',
};

export function AppMark({ size = 52 }: { size?: number }) {
  return (
    <svg
      className="app-mark"
      width={size}
      height={size}
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="64" height="64" rx="18" fill="#0a5bd3" />
      <path
        d="M32 14c-7 0-11 5-11 11-5 1-8 5-8 10 0 6 4 10 10 10 2 4 5 6 9 6V14Zm0 0c7 0 11 5 11 11 5 1 8 5 8 10 0 6-4 10-10 10-2 4-5 6-9 6V14Z"
        fill="#fff"
        stroke="#0b1f3a"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M23 27h9m-11 9h11m9-9h-9m11 9H32" stroke="#e23c2c" strokeWidth="3" />
    </svg>
  );
}

export function GameIcon({
  name,
  domain,
}: {
  name: GameIconName | string;
  domain: Domain;
}) {
  const color = domainColors[domain];
  const common = {
    fill: 'none',
    stroke: color,
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };

  return (
    <span className="game-icon" aria-hidden="true">
      <svg viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="29" fill={`${color}18`} />
        {name === 'patternRecall' && (
          <>
            <rect x="15" y="15" width="14" height="14" rx="3" fill={color} />
            <rect x="35" y="15" width="14" height="14" rx="3" {...common} />
            <rect x="15" y="35" width="14" height="14" rx="3" {...common} />
            <rect x="35" y="35" width="14" height="14" rx="3" fill={color} />
          </>
        )}
        {name === 'wordFluency' && (
          <>
            <path d="M14 18h36v25H30l-10 8v-8h-6V18Z" {...common} />
            <path d="M22 27h20M22 34h13" {...common} />
          </>
        )}
        {name === 'mathRiddles' && (
          <>
            <path d="M16 23h14m-7-7v14M37 22h13M38 38h12M38 46h12M16 39l13 10m0-10L16 49" {...common} />
          </>
        )}
        {name === 'schulte' && (
          <>
            <rect x="15" y="15" width="34" height="34" rx="3" {...common} />
            <path d="M32 15v34M15 32h34" {...common} />
            <circle cx="23.5" cy="23.5" r="3" fill={color} />
          </>
        )}
        {name === 'trainTrack' && (
          <>
            <path d="M18 14v36M46 14v36M18 20h28M18 30h28M18 40h28M18 50h28" {...common} />
          </>
        )}
        {name === 'uno' && (
          <>
            <rect x="18" y="12" width="28" height="40" rx="5" fill={color} transform="rotate(8 32 32)" />
            <ellipse cx="32" cy="32" rx="9" ry="14" fill="#fff" transform="rotate(8 32 32)" />
          </>
        )}
        {name === 'spotDifference' && (
          <>
            <path d="M10 32s8-13 22-13 22 13 22 13-8 13-22 13S10 32 10 32Z" {...common} />
            <circle cx="32" cy="32" r="7" fill={color} />
          </>
        )}
      </svg>
    </span>
  );
}

export function PageGraphic({ kind }: { kind: 'welcome' | 'success' | 'stats' | 'staff' }) {
  return (
    <div className={`page-graphic ${kind}`} aria-hidden="true">
      <svg viewBox="0 0 320 120">
        <path d="M15 103h290" stroke="#0b1f3a" strokeWidth="3" strokeLinecap="round" />
        {kind === 'welcome' && (
          <>
            <circle cx="160" cy="58" r="42" fill="#fff" stroke="#0b1f3a" strokeWidth="3" />
            <path d="M160 25c-15 0-24 12-24 27-10 2-15 9-15 18 0 12 9 20 21 20 4 7 10 10 18 10V25Zm0 0c15 0 24 12 24 27 10 2 15 9 15 18 0 12-9 20-21 20-4 7-10 10-18 10V25Z" fill="#b9dcff" stroke="#0a5bd3" strokeWidth="3" />
            <circle cx="89" cy="70" r="12" fill="#f8cf66" />
            <circle cx="231" cy="70" r="12" fill="#86cda8" />
          </>
        )}
        {kind === 'success' && (
          <>
            <circle cx="160" cy="59" r="40" fill="#fff" stroke="#0b1f3a" strokeWidth="3" />
            <path d="m139 59 14 14 29-31" fill="none" stroke="#1d6b45" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="m104 29-8-12m120 12 8-12M97 69H78m164 0h-19" stroke="#e23c2c" strokeWidth="5" strokeLinecap="round" />
          </>
        )}
        {(kind === 'stats' || kind === 'staff') && (
          <>
            <rect x="80" y="25" width="160" height="78" rx="10" fill="#fff" stroke="#0b1f3a" strokeWidth="3" />
            <rect x="104" y="67" width="20" height="20" rx="3" fill="#86cda8" />
            <rect x="139" y="50" width="20" height="37" rx="3" fill="#f8cf66" />
            <rect x="174" y="37" width="20" height="50" rx="3" fill="#e98b82" />
            <path d="m101 54 38-15 32 5 44-19" fill="none" stroke="#0a5bd3" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {kind === 'staff' && <circle cx="246" cy="31" r="15" fill="#0a5bd3" stroke="#fff" strokeWidth="4" />}
          </>
        )}
      </svg>
    </div>
  );
}

export function MicIcon() {
  return (
    <svg className="button-icon" viewBox="0 0 32 32" aria-hidden="true">
      <rect x="10" y="3" width="12" height="18" rx="6" fill="currentColor" />
      <path d="M6 15a10 10 0 0 0 20 0M16 25v5m-6 0h12" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

import { DOMAIN_LABELS, type Domain } from '../games/types';

const ORDER: Domain[] = [
  'workingMemory',
  'attention',
  'language',
  'numerical',
  'visuospatial',
  'executive',
];

export default function DomainBars({ scores }: { scores: Partial<Record<Domain, number | null>> }) {
  return (
    <div aria-label="Skill scores">
      {ORDER.map((d) => {
        const v = scores[d];
        if (v == null) return null;
        return (
          <div className="bar-wrap" key={d}>
            <div className="bar-label">
              <span>{DOMAIN_LABELS[d]}</span>
              <span>{Math.round(v)}</span>
            </div>
            <div
              className="bar"
              role="progressbar"
              aria-label={DOMAIN_LABELS[d]}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(v)}
            >
              <span style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

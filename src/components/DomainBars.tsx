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
    <div>
      {ORDER.map((d) => {
        const v = scores[d];
        if (v == null) return null;
        return (
          <div className="bar-wrap" key={d}>
            <div className="bar-label">
              <span>{DOMAIN_LABELS[d]}</span>
              <span>{Math.round(v)}</span>
            </div>
            <div className="bar">
              <span style={{ width: `${Math.max(0, Math.min(100, v))}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

import type { Session } from '../games/types';

export function toCSV(sessions: Session[]) {
  const headers = [
    'id',
    'playerCode',
    'gameId',
    'domain',
    'level',
    'accuracy',
    'medianResponseMs',
    'itemsAttempted',
    'score',
    'playedAt',
    'notes',
  ];
  const rows = sessions.map((s) =>
    headers
      .map((h) => {
        const v = s[h as keyof Session];
        const text = v == null ? '' : String(v);
        return `"${text.replaceAll('"', '""')}"`;
      })
      .join(','),
  );
  return [headers.join(','), ...rows].join('\n');
}

export function downloadCSV(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

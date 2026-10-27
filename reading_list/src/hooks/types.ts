export type ReadingStatus = 'want' | 'reading' | 'finished';

export interface Book {
  id: string;
  title: string;
  status: ReadingStatus;
  addedAt: number;
}

export const STATUS_META: Record<
  ReadingStatus,
  { label: string; dot: string; badge: string }
> = {
  want: {
    label: 'Want to Read',
    dot: 'bg-amber-500',
    badge:
      'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200',
  },
  reading: {
    label: 'Reading',
    dot: 'bg-sky-500',
    badge: 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-200',
  },
  finished: {
    label: 'Finished',
    dot: 'bg-emerald-500',
    badge:
      'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200',
  },
};

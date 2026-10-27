import { useEffect, useRef, useState } from 'react';
import { Plus, Library, BookOpen, Trash2, Check } from 'lucide-react';
import { useReadingList, MAX_TITLE_LENGTH, type AddResult } from '@/hooks/useReadingList';
import { STATUS_META, type ReadingStatus } from '@/types';

type FilterValue = ReadingStatus | 'all';

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'want', label: 'Want to Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'finished', label: 'Finished' },
];

const ADD_STATUSES: ReadingStatus[] = ['want', 'reading', 'finished'];

export default function App() {
  const { books, addBook, updateStatus, removeBook } = useReadingList();
  const [filter, setFilter] = useState<FilterValue>('all');
  const [title, setTitle] = useState('');
  const [newStatus, setNewStatus] = useState<ReadingStatus>('want');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const counts = {
    all: books.length,
    want: books.filter((b) => b.status === 'want').length,
    reading: books.filter((b) => b.status === 'reading').length,
    finished: books.filter((b) => b.status === 'finished').length,
  } satisfies Record<FilterValue, number>;

  const visible =
    filter === 'all' ? books : books.filter((b) => b.status === filter);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    const result = addBook(title, newStatus);
    if (!result.ok) {
      setError(
        result.reason === 'duplicate'
          ? 'This book is already in your reading list.'
          : 'Book title must be 60 characters or fewer.'
      );
      return;
    }
    setError(null);
    setTitle('');
    setNewStatus('want');
    inputRef.current?.focus();
  }

  function handleTitleChange(value: string) {
    setTitle(value);
    if (error) setError(null);
  }

  useEffect(() => {
    function close() {
      setOpenMenuId(null);
    }
    if (openMenuId) {
      window.addEventListener('click', close);
      return () => window.removeEventListener('click', close);
    }
  }, [openMenuId]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Library className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              Reading List
            </h1>
            <p className="text-sm text-slate-500">
              Track the books you read, one page at a time.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-8">
        {/* Add form */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              ref={inputRef}
              type="text"
              value={title}
              maxLength={MAX_TITLE_LENGTH}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter a book title…"
              className={
                'flex-1 rounded-lg border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 ' +
                (error
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10'
                  : 'border-slate-300 focus:border-slate-900 focus:ring-slate-900/10')
              }
            />
            <div className="flex gap-2">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as ReadingStatus)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10"
                aria-label="Reading status for the new book"
              >
                {ADD_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!title.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="h-4 w-4" strokeWidth={2.25} />
                Add
              </button>
            </div>
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
        </form>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          <SummaryCard label="Total Books" value={counts.all} />
          <SummaryCard label="Currently Reading" value={counts.reading} />
          <SummaryCard label="Finished" value={counts.finished} />
        </div>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={
                  'inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ' +
                  (active
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 ring-1 ring-inset ring-slate-200 hover:bg-slate-100')
                }
              >
                {f.label}
                <span
                  className={
                    'inline-flex min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-xs ' +
                    (active
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-100 text-slate-500')
                  }
                >
                  {counts[f.value]}
                </span>
              </button>
            );
          })}
        </div>

        {/* List */}
        <div className="mt-5">
          {visible.length === 0 ? (
            <EmptyState hasBooks={books.length > 0} filter={filter} />
          ) : (
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {visible.map((book) => (
                <li
                  key={book.id}
                  className="group relative flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                        <BookOpen className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold leading-snug text-slate-900">
                          {book.title}
                        </h3>
                        <span
                          className={
                            'mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ' +
                            STATUS_META[book.status].badge
                          }
                        >
                          <span
                            className={
                              'h-1.5 w-1.5 rounded-full ' +
                              STATUS_META[book.status].dot
                            }
                          />
                          {STATUS_META[book.status].label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === book.id ? null : book.id
                          );
                        }}
                        className="text-xs font-medium text-slate-500 transition-colors hover:text-slate-900"
                      >
                        Change status ▾
                      </button>
                    {openMenuId === book.id && (
                      <div
                        className="absolute left-0 top-full z-10 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {(['want', 'reading', 'finished'] as ReadingStatus[]).map(
                          (s) => (
                            <button
                              key={s}
                              onClick={() => {
                                updateStatus(book.id, s);
                                setOpenMenuId(null);
                              }}
                              className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                            >
                              <span className="flex items-center gap-2">
                                <span
                                  className={
                                    'h-2 w-2 rounded-full ' + STATUS_META[s].dot
                                  }
                                />
                                {STATUS_META[s].label}
                              </span>
                              {book.status === s && (
                                <Check className="h-4 w-4 text-slate-900" strokeWidth={2.25} />
                              )}
                            </button>
                          )
                        )}
                      </div>
                    )}
                    </div>
                    <button
                      onClick={() => removeBook(book.id)}
                      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-200"
                      aria-label={`Delete ${book.title}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" strokeWidth={2} />
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <footer className="mx-auto max-w-3xl px-5 pb-10 pt-2 text-center text-xs text-slate-400">
        Your list is saved on this device only.
      </footer>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-2xl font-semibold tracking-tight text-slate-900">
        {value}
      </p>
      <p className="mt-0.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function EmptyState({
  hasBooks,
  filter,
}: {
  hasBooks: boolean;
  filter: FilterValue;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
        <BookOpen className="h-6 w-6" strokeWidth={1.75} />
      </div>
      <p className="mt-4 text-sm font-medium text-slate-700">
        {hasBooks
          ? `No books marked as “${FILTERS.find((f) => f.value === filter)?.label}”.`
          : 'Your reading list is empty. Add your first book.'}
      </p>
    </div>
  );
}

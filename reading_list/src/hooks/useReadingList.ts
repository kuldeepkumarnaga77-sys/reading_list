import { useCallback, useEffect, useState } from 'react';
import type { Book, ReadingStatus } from '@/types';

const STORAGE_KEY = 'reading-list-books';

export const MAX_TITLE_LENGTH = 60;

export type AddResult =
  | { ok: true }
  | { ok: false; reason: 'duplicate' | 'too-long' };

const STATUS_ORDER: ReadingStatus[] = ['reading', 'want', 'finished'];

function loadBooks(): Book[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Book[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (b) => b && b.id && b.title && ['want', 'reading', 'finished'].includes(b.status)
    );
  } catch {
    return [];
  }
}

export function useReadingList() {
  const [books, setBooks] = useState<Book[]>(() => loadBooks());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
    } catch {
      // ignore quota / privacy mode errors
    }
  }, [books]);

  const addBook = useCallback(
    (title: string, status: ReadingStatus): AddResult => {
      const trimmed = title.trim().replace(/\s+/g, ' ');
      if (trimmed.length > MAX_TITLE_LENGTH) return { ok: false, reason: 'too-long' };
      const normalized = trimmed.toLowerCase();
      if (books.some((b) => b.title.trim().replace(/\s+/g, ' ').toLowerCase() === normalized)) {
        return { ok: false, reason: 'duplicate' };
      }
      setBooks((prev) => [
        {
          id: crypto.randomUUID(),
          title: trimmed,
          status,
          addedAt: Date.now(),
        },
        ...prev,
      ]);
      return { ok: true };
    },
    [books]
  );

  const updateStatus = useCallback((id: string, status: ReadingStatus) => {
    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  }, []);

  const removeBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  return { books, addBook, updateStatus, removeBook, STATUS_ORDER };
}

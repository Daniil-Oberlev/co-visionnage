'use client';

import { useCallback, useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

import { Series, SeriesData } from '@/shared/types';
import { useAppSounds } from './useAppSounds';

export const useSeries = () => {
  const { playSuccess, playDelete } = useAppSounds();

  const [series, setSeries] = useState<Series[]>(() => {
    if (globalThis.window === undefined) return [];

    try {
      const saved = localStorage.getItem('series-data');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Initial load error:', error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('series-data', JSON.stringify(series));
    } catch (error) {
      if (
        error instanceof DOMException &&
        error.name === 'QuotaExceededError'
      ) {
        toast.error('ПАМЯТЬ ПЕРЕПОЛНЕНА!', {
          description:
            'Слишком много данных или тяжелые картинки. Очистите список.',
          className: 'brutal-toast-error',
        });
      }
    }
  }, [series]);

  const addSeries = useCallback(
    (newShow: Series) => {
      setSeries((previous) => [...previous, newShow]);
      playSuccess();
    },
    [playSuccess],
  );

  const deleteSeries = useCallback(
    (id: number) => {
      setSeries((previous) => previous.filter((s) => s.id !== id));
      playDelete();
    },
    [playDelete],
  );

  const editSeries = useCallback(
    (id: number, data: Partial<SeriesData>) => {
      setSeries((previous) =>
        previous.map((s) => (s.id === id ? { ...s, ...data } : s)),
      );
      playSuccess();
    },
    [playSuccess],
  );

  const markAsWatched = useCallback(
    (id: number, rating: number, comment: string) => {
      setSeries((previous) =>
        previous.map((s) =>
          s.id === id
            ? {
                ...s,
                comment,
                rating,
                status: 'watched',
                dateWatched: new Date().toISOString().split('T')[0],
              }
            : s,
        ),
      );

      playSuccess();
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF'],
      });
    },
    [playSuccess],
  );

  const moveToWatchList = useCallback((id: number) => {
    setSeries((previous) =>
      previous.map((s) =>
        s.id === id
          ? { ...s, comment: undefined, rating: undefined, status: 'to-watch' }
          : s,
      ),
    );
  }, []);

  return {
    series,
    addSeries,
    deleteSeries,
    editSeries,
    markAsWatched,
    moveToWatchList,
  };
};

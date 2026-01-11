import { useCallback, useEffect, useState } from 'react';

import { MockSeries } from '@/shared/mock/series';
import { Series, SeriesData } from '@/shared/types';

export const useSeries = () => {
  const [series, setSeries] = useState<Series[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('series-data');
    setSeries(saved ? JSON.parse(saved) : MockSeries);
  }, []);

  useEffect(() => {
    if (series.length > 0) {
      localStorage.setItem('series-data', JSON.stringify(series));
    }
  }, [series]);

  const addSeries = useCallback((newShow: Series) => {
    setSeries((prev) => [...prev, newShow]);
  }, []);

  const deleteSeries = useCallback((id: number) => {
    setSeries((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const editSeries = useCallback((id: number, data: Partial<SeriesData>) => {
    setSeries((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
  }, []);

  const markAsWatched = useCallback(
    (id: number, rating: number, comment: string) => {
      setSeries((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                comment,
                dateWatched: new Date().toISOString().split('T')[0],
                rating,
                status: 'watched',
              }
            : s,
        ),
      );
    },
    [],
  );

  const moveToWatchList = useCallback((id: number) => {
    setSeries((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              comment: undefined,
              dateWatched: undefined,
              rating: undefined,
              status: 'to-watch',
            }
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

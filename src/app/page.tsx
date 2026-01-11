'use client';

import { Check, Clock } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import useSound from 'use-sound';

import { AddSeriesDialog } from '@/features/add-series';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { MockSeries } from '@/shared/mock/series';
import { Series, SeriesData } from '@/shared/types';
import { EmptyState, SeriesFilters, SeriesHeader } from '@/shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/lib';
import { ToWatchCard, WatchedCard } from '@/widgets';

const SeriesTracker = () => {
  const [series, setSeries] = useState<Series[]>(MockSeries);
  const [user, setUser] = useState<
    { name: string; provider: string } | undefined
  >();

  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
  const [playClick] = useSound('/sounds/click.mp3', { volume: 0.1 });
  const [playSuccess] = useSound('/sounds/success.mp3', { volume: 0.1 });
  const debouncedSearch = useDebounce(searchTerm, 300);

  const allGenres = useMemo(() => {
    const genres = series.flatMap((s) => s.genres || []);
    return [...new Set(genres)].filter(Boolean);
  }, [series]);

  const allYears = useMemo(
    () => [...new Set(series.map((s) => s.year))].toSorted((a, b) => b - a),
    [series],
  );

  const filteredSeries = useMemo(() => {
    return series.filter((show) => {
      const matchesSearch = show.title
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      const matchesGenre =
        genreFilter === 'all' || show.genres.includes(genreFilter);
      const matchesYear =
        yearFilter === 'all' || show.year.toString() === yearFilter;
      const matchesRating =
        ratingFilter === 'all' ||
        (show.rating &&
          ((ratingFilter === '5' && show.rating === 5) ||
            (ratingFilter === '4+' && show.rating >= 4) ||
            (ratingFilter === '3+' && show.rating >= 3)));

      return matchesSearch && matchesGenre && matchesYear && matchesRating;
    });
  }, [series, debouncedSearch, genreFilter, yearFilter, ratingFilter]);

  const toWatchList = useMemo(
    () => filteredSeries.filter((s) => s.status === 'to-watch'),
    [filteredSeries],
  );
  const watchedList = useMemo(
    () => filteredSeries.filter((s) => s.status === 'watched'),
    [filteredSeries],
  );

  const handleAddSeries = useCallback(
    (newShow: Series) => {
      setSeries((previous) => [...previous, newShow]);
      playSuccess();
    },
    [playSuccess],
  );

  const deleteSeries = useCallback((id: number) => {
    setSeries((previous) => previous.filter((s) => s.id !== id));
  }, []);

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
                dateWatched: new Date().toISOString().split('T')[0],
                rating,
                status: 'watched',
              }
            : s,
        ),
      );
      playSuccess();
    },
    [playSuccess],
  );

  const moveToWatchList = useCallback((id: number) => {
    setSeries((previous) =>
      previous.map((s) =>
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

  return (
    <div className='brutal-font relative min-h-screen overflow-hidden bg-blue-500 font-sans'>
      <div
        className='absolute inset-0 z-0 opacity-70'
        style={{
          backgroundImage: "url('/images/clouds.png')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          imageRendering: 'pixelated',
        }}
      />

      <div className='relative z-10 mx-auto max-w-7xl p-4'>
        <SeriesHeader
          user={user}
          onLogin={(p) => setUser({ name: p.toUpperCase(), provider: p })}
          onLogout={() => setUser(undefined)}
        />

        <SeriesFilters
          allGenres={allGenres}
          allYears={allYears}
          genreFilter={genreFilter}
          ratingFilter={ratingFilter}
          searchTerm={searchTerm}
          yearFilter={yearFilter}
          onGenreChange={(v) => {
            playClick();
            setGenreFilter(v);
          }}
          onRatingChange={(v) => {
            playClick();
            setRatingFilter(v);
          }}
          onSearchChange={setSearchTerm}
          onYearChange={(v) => {
            playClick();
            setYearFilter(v);
          }}
        />

        <div className='mb-8 flex justify-center'>
          <AddSeriesDialog onAdd={handleAddSeries} />
        </div>

        <Tabs
          className='w-full'
          defaultValue='to-watch'
          onValueChange={() => playClick()}
        >
          <TabsList className='mb-8 grid h-auto w-full grid-cols-2 border-4 border-black bg-yellow-400 p-2'>
            <TabsTrigger
              className='border-2 border-transparent p-4 font-black transition-all data-[state=active]:rotate-1 data-[state=active]:border-black data-[state=active]:bg-orange-500'
              value='to-watch'
            >
              <Clock className='mr-2' /> ХОТИМ ({toWatchList.length})
            </TabsTrigger>
            <TabsTrigger
              className='border-2 border-transparent p-4 font-black transition-all data-[state=active]:-rotate-1 data-[state=active]:border-black data-[state=active]:bg-lime-500'
              value='watched'
            >
              <Check className='mr-2' /> СМОТРЕЛИ ({watchedList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent className='outline-none' value='to-watch'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {toWatchList.length > 0 ? (
                toWatchList.map((show, index) => (
                  <ToWatchCard
                    key={show.id}
                    index={index}
                    series={show}
                    onDelete={deleteSeries}
                    onEdit={editSeries}
                    onMarkWatched={markAsWatched}
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </TabsContent>

          <TabsContent className='outline-none' value='watched'>
            <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {watchedList.length > 0 ? (
                watchedList.map((show, index) => (
                  <WatchedCard
                    key={show.id}
                    index={index}
                    series={show}
                    onDelete={deleteSeries}
                    onEdit={editSeries}
                    onMoveToWatchList={moveToWatchList}
                  />
                ))
              ) : (
                <EmptyState />
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SeriesTracker;

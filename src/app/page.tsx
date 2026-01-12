'use client';

import { Check, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AddSeriesDialog } from '@/features/add-series';
import { useAppSounds } from '@/shared/hooks/useAppSounds';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useSeries } from '@/shared/hooks/useSeries';
import { EmptyState, SeriesFilters, SeriesHeader } from '@/shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/lib';
import { SeriesCardSkeleton } from '@/shared/ui/SeriesCardSkeleton';
import { ToWatchCard, WatchedCard } from '@/widgets';

const SeriesTracker = () => {
  const {
    series,
    addSeries,
    deleteSeries,
    editSeries,
    markAsWatched,
    moveToWatchList,
  } = useSeries();

  const [user, setUser] = useState<
    { name: string; provider: string } | undefined
  >();
  const { playClick } = useAppSounds();

  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
      setIsLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');
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

      let matchesRating = true;
      if (ratingFilter !== 'all' && show.rating) {
        switch (ratingFilter) {
          case '5': {
            matchesRating = show.rating === 5;
            break;
          }
          case '4+': {
            matchesRating = show.rating >= 4;
            break;
          }
          case '3+': {
            matchesRating = show.rating >= 3;
            break;
          }
        }
      } else if (ratingFilter !== 'all' && !show.rating) {
        matchesRating = false;
      }

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

  const renderGrid = (content: React.ReactNode) => (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {content}
    </div>
  );

  const renderSkeletons = () => (
    <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, index) => (
        <SeriesCardSkeleton key={index} />
      ))}
    </div>
  );

  if (!isMounted) return <div className='min-h-screen bg-blue-500' />;

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
          <AddSeriesDialog onAdd={addSeries} />
        </div>

        <Tabs
          className='w-full'
          defaultValue='to-watch'
          onValueChange={() => playClick()}
        >
          <TabsList className='mb-8 grid h-auto w-full grid-cols-2 border-4 border-black bg-yellow-400 p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
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
            {isLoading ? (
              renderSkeletons()
            ) : toWatchList.length > 0 ? (
              renderGrid(
                toWatchList.map((show, index) => (
                  <ToWatchCard
                    key={show.id}
                    index={index}
                    series={show}
                    onDelete={deleteSeries}
                    onEdit={editSeries}
                    onMarkWatched={markAsWatched}
                  />
                )),
              )
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent className='outline-none' value='watched'>
            {isLoading ? (
              renderSkeletons()
            ) : watchedList.length > 0 ? (
              renderGrid(
                watchedList.map((show, index) => (
                  <WatchedCard
                    key={show.id}
                    index={index}
                    series={show}
                    onDelete={deleteSeries}
                    onEdit={editSeries}
                    onMoveToWatchList={moveToWatchList}
                  />
                )),
              )
            ) : (
              <EmptyState />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SeriesTracker;

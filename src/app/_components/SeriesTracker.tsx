'use client';

import { Check, Clock } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import { AddSeriesDialog } from '@/features/add-series';
import { useAppSounds } from '@/shared/hooks/useAppSounds';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useSeries } from '@/shared/hooks/useSeries';
import {
  EmptyState,
  SeriesCardSkeleton,
  SeriesFilters,
  SeriesHeader,
} from '@/shared/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/lib';
import { ToWatchCard, WatchedCard } from '@/widgets';

interface SeriesTrackerProperties {
  userEmail?: string;
  family: {
    id: string;
    name: string;
    invite_code: string;
  };
}

const SeriesTracker = ({ userEmail, family }: SeriesTrackerProperties) => {
  const {
    series,
    addSeries,
    deleteSeries,
    editSeries,
    markAsWatched,
    moveToWatchList,
  } = useSeries();

  const { playClick } = useAppSounds();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
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
            {
              matchesRating = show.rating >= 3;
            }
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

  return (
    <div className='brutal-font relative min-h-screen w-full overflow-x-hidden bg-blue-500 font-sans'>
      <div
        className='pointer-events-none fixed inset-0 z-0 opacity-60'
        style={{
          backgroundImage: "url('/images/clouds.png')",
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          imageRendering: 'pixelated',
        }}
      />

      <div className='relative z-10 mx-auto max-w-7xl p-4'>
        <SeriesHeader userEmail={userEmail} />

        <div className='mb-8 flex flex-wrap items-center gap-4'>
          <div className='-rotate-1 border-4 border-black bg-yellow-300 p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            <span className='text-xl font-black uppercase'>
              Семья: {family.name}
            </span>
          </div>
          <div className='rotate-1 border-4 border-black bg-white p-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
            <span className='font-bold text-gray-500 uppercase'>Код: </span>
            <span className='font-black text-black'>{family.invite_code}</span>
          </div>
        </div>

        <SeriesFilters
          allGenres={allGenres}
          allYears={allYears}
          genreFilter={genreFilter}
          ratingFilter={ratingFilter}
          searchTerm={searchTerm}
          yearFilter={yearFilter}
          onGenreChange={setGenreFilter}
          onRatingChange={setRatingFilter}
          onSearchChange={setSearchTerm}
          onYearChange={setYearFilter}
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
              className='p-4 font-black data-[state=active]:border-black data-[state=active]:bg-orange-500'
              value='to-watch'
            >
              <Clock className='mr-2' /> ХОТИМ (
              {isLoading ? '...' : toWatchList.length})
            </TabsTrigger>
            <TabsTrigger
              className='p-4 font-black data-[state=active]:border-black data-[state=active]:bg-lime-500'
              value='watched'
            >
              <Check className='mr-2' /> СМОТРЕЛИ (
              {isLoading ? '...' : watchedList.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value='to-watch'>
            {isLoading ? (
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, index) => (
                  <SeriesCardSkeleton key={index} />
                ))}
              </div>
            ) : toWatchList.length > 0 ? (
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {toWatchList.map((show, index) => (
                  <ToWatchCard
                    key={show.id}
                    index={index}
                    series={show}
                    onDelete={deleteSeries}
                    onEdit={editSeries}
                    onMarkWatched={markAsWatched}
                  />
                ))}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          <TabsContent value='watched'>
            {isLoading ? (
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {Array.from({ length: 4 }).map((_, index) => (
                  <SeriesCardSkeleton key={index} />
                ))}
              </div>
            ) : watchedList.length > 0 ? (
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
                {watchedList.map((show, index) => (
                  <WatchedCard
                    key={show.id}
                    index={index}
                    series={show}
                    onDelete={deleteSeries}
                    onEdit={editSeries}
                    onMoveToWatchList={moveToWatchList}
                  />
                ))}
              </div>
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

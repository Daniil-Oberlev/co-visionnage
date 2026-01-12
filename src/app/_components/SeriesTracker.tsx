'use client';

import { Check, Clock } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AddSeriesDialog } from '@/features/add-series';
import {
  addSeries as addSeriesAction,
  deleteSeries as deleteAction,
  editSeries as editAction,
  markWatched as markWatchedAction,
  moveToWatchList as moveToWatchListAction,
} from '@/shared/actions/series';
import { createClient } from '@/shared/api/supabase/client';
import { useAppSounds } from '@/shared/hooks/useAppSounds';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Series, SeriesData } from '@/shared/types';
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
  initialSeries: Series[];
}

const SeriesTracker = ({
  userEmail,
  family,
  initialSeries,
}: SeriesTrackerProperties) => {
  const supabase = useMemo(() => createClient(), []);
  const { playClick } = useAppSounds();
  const [isLoading, setIsLoading] = useState(true);

  const [series, setSeries] = useState<Series[]>(initialSeries);

  const loadSeries = useCallback(async () => {
    console.warn('SeriesTracker: loadSeries start', {
      familyId: family.id,
    });
    setIsLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSeries([]);
      setIsLoading(false);
      return;
    }

    const { data: familySeries, error: seriesError } = await supabase
      .from('family_series')
      .select('*')
      .eq('family_id', family.id)
      .order('created_at', { ascending: false });

    if (seriesError) {
      console.error('SeriesTracker: error loading family_series', seriesError);
      setSeries([]);
      setIsLoading(false);
      return;
    }

    const seriesIds = (familySeries ?? [])
      .map((s) => s?.id)
      .filter((id): id is string => typeof id === 'string');

    const { data: statuses, error: statusesError } =
      seriesIds.length > 0
        ? await supabase
            .from('family_series_status')
            .select('series_id, status, rating, comment')
            .eq('user_id', user.id)
            .in('series_id', seriesIds)
        : { data: [], error: undefined };

    if (statusesError) {
      console.error(
        'SeriesTracker: error loading family_series_status',
        statusesError,
      );
    }

    const statusBySeriesId = new Map(
      (statuses ?? []).map((row) => [row.series_id, row]),
    );

    const merged = (familySeries ?? []).map((s) => {
      const statusRow = statusBySeriesId.get(s.id);
      return {
        ...s,
        status:
          (statusRow?.status as Series['status'] | undefined) ?? 'to-watch',
        rating: statusRow?.rating ?? undefined,
        comment: statusRow?.comment ?? undefined,
      } as Series;
    });

    setSeries(merged);
    setIsLoading(false);
  }, [family.id, supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSeries();
    }, 0);

    const seriesChannel = supabase
      .channel(`family-series-${family.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_series',
          filter: `family_id=eq.${family.id}`,
        },
        () => {
          void loadSeries();
        },
      )
      .subscribe();

    const statusChannel = supabase
      .channel(`family-series-status-${family.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'family_series_status',
        },
        () => {
          void loadSeries();
        },
      )
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(seriesChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [family.id, loadSeries, supabase]);

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
    () =>
      [...new Set(series.map((s) => s.year))]
        .filter(Boolean)
        .toSorted((a, b) => b - a),
    [series],
  );

  const filteredSeries = useMemo(() => {
    return series.filter((show) => {
      const matchesSearch = show.title
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase());
      const matchesGenre =
        genreFilter === 'all' ||
        (show.genres && show.genres.includes(genreFilter));
      const matchesYear =
        yearFilter === 'all' ||
        (show.year && show.year.toString() === yearFilter);

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

  const runAndRefresh = useCallback(
    async <T,>(action: () => Promise<T>) => {
      const result = await action();
      if (
        result &&
        typeof result === 'object' &&
        'error' in result &&
        (result as { error?: unknown }).error
      ) {
        return result;
      }

      await loadSeries();
      return result;
    },
    [loadSeries],
  );

  const handleAddSeries = useCallback(
    async (data: SeriesData) => {
      console.warn('SeriesTracker: add series', {
        familyId: family.id,
        title: data.title,
        status: data.status,
        genresCount: data.genres.length,
        hasImage:
          typeof data.image_url === 'string' && data.image_url.length > 0,
      });
      await runAndRefresh(() => addSeriesAction(family.id, data));
    },
    [family.id, runAndRefresh],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      console.warn('SeriesTracker: delete series', { id });
      await runAndRefresh(() => deleteAction(id));
    },
    [runAndRefresh],
  );

  const handleMarkWatched = useCallback(
    async (id: string, rating: number, comment: string) => {
      console.warn('SeriesTracker: mark watched', {
        id,
        rating,
        commentLength: comment.length,
      });
      await runAndRefresh(() => markWatchedAction(id, rating, comment));
    },
    [runAndRefresh],
  );

  const handleMoveToWatch = useCallback(
    async (id: string) => {
      console.warn('SeriesTracker: move to watch list', { id });
      await runAndRefresh(() => moveToWatchListAction(id));
    },
    [runAndRefresh],
  );

  const handleEdit = useCallback(
    async (id: string, updates: Partial<SeriesData>) => {
      console.warn('SeriesTracker: edit series', {
        id,
        keys: Object.keys(updates),
      });
      await runAndRefresh(() => editAction(id, updates));
    },
    [runAndRefresh],
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
          <AddSeriesDialog onAdd={handleAddSeries} />
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
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onMarkWatched={handleMarkWatched}
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
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    onMoveToWatchList={handleMoveToWatch}
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

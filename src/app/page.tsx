'use client';

import { Check, Clock, Github, Mail } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { AddSeriesDialog } from '@/features/add-series';
import { MockSeries } from '@/shared/mock/series';
import { Series, SeriesData } from '@/shared/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  EmptyState,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/ui';
import { ToWatchCard, WatchedCard } from '@/widgets';

const SeriesTracker = () => {
  const [series, setSeries] = useState<Series[]>(MockSeries);
  const [user, setUser] = useState<
    { name: string; provider: string } | undefined
  >();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all');

  const allGenres = useMemo(() => {
    const flattened = series.flatMap((s) =>
      Array.isArray(s.genres) ? s.genres : [s.genres],
    );
    return [...new Set(flattened.filter(Boolean))];
  }, [series]);

  const allYears = useMemo(
    () => [...new Set(series.map((s) => s.year))].toSorted((a, b) => b - a),
    [series],
  );

  const { toWatchList, watchedList } = useMemo(() => {
    const lists = {
      toWatchList: [] as Series[],
      watchedList: [] as Series[],
    };

    const lowerSearch = searchTerm.toLowerCase();

    for (const show of series) {
      const matchesSearch = show.title.toLowerCase().includes(lowerSearch);
      const matchesGenre =
        genreFilter === 'all' ||
        (Array.isArray(show.genres)
          ? show.genres.includes(genreFilter)
          : show.genres === genreFilter);
      const matchesYear =
        yearFilter === 'all' || show.year.toString() === yearFilter;
      const matchesRating =
        ratingFilter === 'all' ||
        (show.rating &&
          ((ratingFilter === '5' && show.rating === 5) ||
            (ratingFilter === '4+' && show.rating >= 4) ||
            (ratingFilter === '3+' && show.rating >= 3)));

      if (matchesSearch && matchesGenre && matchesYear && matchesRating) {
        if (show.status === 'to-watch') {
          lists.toWatchList.push(show);
        } else {
          lists.watchedList.push(show);
        }
      }
    }
    return lists;
  }, [series, searchTerm, genreFilter, yearFilter, ratingFilter]);

  const handleAddSeries = useCallback((newShow: Series) => {
    setSeries((previous) => [...previous, newShow]);
  }, []);

  const deleteSeries = useCallback((id: number) => {
    setSeries((previous) => previous.filter((s) => s.id !== id));
  }, []);

  const editSeries = useCallback((id: number, data: Partial<SeriesData>) => {
    setSeries((previous) =>
      previous.map((s) => (s.id === id ? { ...s, ...data } : s)),
    );
  }, []);

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
    },
    [],
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

  const handleLogin = (provider: string) => {
    setUser({ name: `${provider.toUpperCase()} USER`, provider });
    setIsAuthDialogOpen(false);
  };

  return (
    <div className='brutal-font relative min-h-screen overflow-hidden bg-blue-500'>
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
        <header className='mb-8 flex flex-col items-center justify-between gap-6 md:flex-row md:items-start'>
          <div className='-rotate-1 transform border-4 border-black bg-lime-400 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'>
            <h1 className='text-4xl font-black text-black md:text-6xl'>
              НАШИ СЕРИАЛЫ
            </h1>
            <div className='mt-2 inline-block rotate-2 border-2 border-black bg-pink-500 px-4 py-1 font-bold'>
              ОТСЛЕЖИВАЕМ ВСЁ ВМЕСТЕ! ❤️
            </div>
          </div>

          <div>
            {user ? (
              <div className='rotate-1 border-4 border-black bg-lime-400 p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
                <p className='mb-2 font-bold text-black'>👤 {user.name}</p>
                <Button
                  className='w-full border-2 border-black bg-red-500 font-black text-white hover:bg-red-600'
                  onClick={() => setUser(undefined)}
                >
                  ВЫХОД
                </Button>
              </div>
            ) : (
              <Dialog
                open={isAuthDialogOpen}
                onOpenChange={setIsAuthDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button className='rotate-1 border-4 border-black bg-yellow-400 px-6 py-3 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-transform hover:rotate-0 hover:bg-yellow-500'>
                    ВХОД
                  </Button>
                </DialogTrigger>
                <DialogContent className='max-w-sm border-4 border-black bg-pink-400 [&>button]:-top-3 [&>button]:-right-3 [&>button]:rounded-none [&>button]:border-2 [&>button]:border-black [&>button]:bg-white [&>button]:opacity-100 [&>button]:hover:bg-red-500'>
                  <DialogHeader>
                    <div className='mb-4 -rotate-1 border-2 border-black bg-purple-600 p-2 text-yellow-300'>
                      <DialogTitle className='font-black'>
                        ВХОД В СИСТЕМУ
                      </DialogTitle>
                    </div>
                  </DialogHeader>
                  <div className='grid gap-4 py-4'>
                    <Button
                      className='border-2 border-black bg-white p-6 font-black text-black hover:bg-gray-100'
                      onClick={() => handleLogin('google')}
                    >
                      <Mail /> GOOGLE
                    </Button>
                    <Button
                      className='flex gap-2 border-2 border-black bg-gray-800 p-6 font-black text-white hover:bg-gray-900'
                      onClick={() => handleLogin('github')}
                    >
                      <Github className='h-5 w-5' /> GITHUB
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </header>

        <section className='mb-8 rotate-1 border-4 border-black bg-orange-400 p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'>
          <div className='mb-4 -rotate-1 border-2 border-black bg-purple-500 p-4'>
            <h2 className='text-2xl font-black text-yellow-300'>
              ПОИСК И ФИЛЬТРЫ
            </h2>
          </div>
          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <div className='rotate-1 border-2 border-black bg-lime-400 p-3'>
              <Label className='mb-2 block text-sm font-bold text-black'>
                ПОИСК
              </Label>
              <Input
                className='border-2 border-black bg-yellow-300 font-bold placeholder:text-black/50'
                placeholder='НАЙТИ...'
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
            <div className='-rotate-1 border-2 border-black bg-pink-400 p-3'>
              <Label className='mb-2 block text-sm font-bold text-black'>
                ЖАНР
              </Label>
              <Select value={genreFilter} onValueChange={setGenreFilter}>
                <SelectTrigger className='border-2 border-black bg-cyan-300 font-bold'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-2 border-black bg-lime-300'>
                  <SelectItem value='all'>ВСЕ ЖАНРЫ</SelectItem>
                  {allGenres.map((genre) => (
                    <SelectItem key={genre} value={genre}>
                      {genre.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='rotate-1 border-2 border-black bg-purple-400 p-3'>
              <Label className='mb-2 block text-sm font-bold text-black'>
                ГОД
              </Label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className='border-2 border-black bg-orange-300 font-bold'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-2 border-black bg-pink-300'>
                  <SelectItem value='all'>ВСЕ ГОДЫ</SelectItem>
                  {allYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className='-rotate-1 border-2 border-black bg-yellow-400 p-3'>
              <Label className='mb-2 block text-sm font-bold text-black'>
                РЕЙТИНГ
              </Label>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className='border-2 border-black bg-lime-300 font-bold'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className='border-2 border-black bg-orange-300'>
                  <SelectItem value='all'>ЛЮБОЙ</SelectItem>
                  <SelectItem value='5'>⭐⭐⭐⭐⭐ (5)</SelectItem>
                  <SelectItem value='4+'>⭐⭐⭐⭐+ (4+)</SelectItem>
                  <SelectItem value='3+'>⭐⭐⭐+ (3+)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <div className='mb-8 flex justify-center'>
          <AddSeriesDialog onAdd={handleAddSeries} />
        </div>

        <Tabs className='w-full' defaultValue='to-watch'>
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

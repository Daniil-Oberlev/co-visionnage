import { Series } from '@/shared/types';

export const MockSeries: Series[] = [
  {
    id: 1,
    title: 'Очень странные дела',
    genres: ['Фантастика'],
    year: 2016,
    rating: 5,
    comment: 'Невероятная атмосфера 80-х!',
    dateWatched: '2024-01-15',
    status: 'watched',
    image: '/placeholder.svg?height=300&width=200',
  },
  {
    id: 2,
    title: 'Игра в кальмара',
    genres: ['Триллер'],
    year: 2021,
    rating: 4,
    comment: 'Очень напряженно смотрели',
    dateWatched: '2024-02-10',
    status: 'watched',
    image: '/placeholder.svg?height=300&width=200',
  },
  {
    id: 3,
    title: 'Ведьмак',
    genres: ['Фэнтези'],
    year: 2019,
    status: 'to-watch',
    image: '/placeholder.svg?height=300&width=200',
  },
  {
    id: 4,
    title: 'Корона',
    genres: ['Драма'],
    year: 2016,
    status: 'to-watch',
    image: '/placeholder.svg?height=300&width=200',
  },
];

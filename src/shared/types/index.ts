export interface Series {
  id: number;
  title: string;
  genres: string[];
  year: number;
  rating?: number;
  comment?: string;
  dateWatched?: string;
  status: SeriesStatus;
  image: string;
}

export type SeriesData = {
  title: string;
  genres: string[];
  year: number;
  image: string;
  rating?: number;
  comment?: string;
};

export type SeriesStatus = 'watched' | 'to-watch';

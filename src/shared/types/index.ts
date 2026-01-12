export interface Series {
  id: string;
  title: string;
  genres: string[];
  year: number;
  rating?: number;
  comment?: string;
  dateWatched?: string;
  status: SeriesStatus;
  image_url?: string | null;
}

export type SeriesData = {
  title: string;
  genres: string[];
  year: number;
  status: SeriesStatus;
  image_url?: string | null;
  rating?: number;
  comment?: string;
};

export type SeriesStatus = 'watched' | 'to-watch';

import { SquarePen, X } from 'lucide-react';

import { SeriesCard } from '@/entities/series';
import { EditSeriesDialog, MarkWatchedDialog } from '@/features';
import { Series, SeriesData } from '@/shared/types';
import { Badge, Button } from '@/shared/ui/lib';

interface ToWatchCardProperties {
  index: number;
  onDelete: (id: number) => void;
  onEdit: (id: number, data: Partial<SeriesData>) => void;
  onMarkWatched: (id: number, rating: number, comment: string) => void;
  series: Series;
}

export const ToWatchCard = ({
  index,
  onDelete,
  onEdit,
  onMarkWatched,
  series,
}: ToWatchCardProperties) => {
  return (
    <SeriesCard
      actions={
        <>
          <EditSeriesDialog
            series={series}
            trigger={
              <Button
                className='h-8 w-8 rounded-none border-2 border-black bg-yellow-400 p-0 text-black hover:bg-yellow-500'
                size='sm'
                variant='ghost'
              >
                <SquarePen className='h-4 w-4' />
              </Button>
            }
            onSave={onEdit}
          />
          <Button
            className='h-8 w-8 rounded-none border-2 border-black bg-red-500 p-0 text-white hover:bg-red-600'
            size='sm'
            variant='ghost'
            onClick={() => onDelete(series.id)}
          >
            <X className='h-4 w-4' />
          </Button>
        </>
      }
      footer={<MarkWatchedDialog series={series} onMark={onMarkWatched} />}
      index={index}
      series={series}
      variant='to-watch'
    >
      <div className='flex flex-wrap gap-2'>
        {series.genres.map((genre) => (
          <Badge
            key={genre}
            className='brutal-font border-2 border-black bg-black font-bold text-lime-300'
          >
            {genre.toUpperCase()}
          </Badge>
        ))}
      </div>
    </SeriesCard>
  );
};

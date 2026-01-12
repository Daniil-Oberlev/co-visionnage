import { ChangeEvent, ReactNode, useState } from 'react';

import { Series, SeriesData } from '@/shared/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui/lib';

interface EditSeriesProperties {
  includeRating?: boolean;
  onSave: (id: string, data: Partial<SeriesData>) => void;
  series: Series;
  trigger: ReactNode;
}

export const EditSeriesDialog = ({
  includeRating,
  onSave,
  series,
  trigger,
}: EditSeriesProperties) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<SeriesData>>({
    comment: series.comment ?? '',
    genres: series.genres,
    image_url: series.image_url ?? undefined,
    rating: series.rating ?? 5,
    title: series.title,
    year: series.year,
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', (event) => {
        setEditData((previous) => ({
          ...previous,
          image_url: (event.target?.result as string) ?? undefined,
        }));
      });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    onSave(series.id, editData);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className='max-h-[90vh] max-w-md border-4 border-black bg-cyan-400 [&>button]:-top-3 [&>button]:-right-3 [&>button]:rounded-none [&>button]:border-2 [&>button]:border-black [&>button]:bg-white [&>button]:opacity-100 [&>button]:hover:bg-red-500'>
        <DialogHeader>
          <div className='mb-4 -rotate-1 transform border-2 border-black bg-purple-600 p-2 text-yellow-300'>
            <DialogTitle className='brutal-font text-xl font-black'>
              РЕДАКТИРОВАТЬ
            </DialogTitle>
          </div>
          <DialogDescription className='brutal-font text-center font-bold text-black'>
            ИЗМЕНИ ДАННЫЕ СЕРИАЛА
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='rotate-1 border-2 border-black bg-lime-400 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
            <Label className='brutal-font font-black text-black'>
              НАЗВАНИЕ
            </Label>
            <Input
              className='brutal-font border-2 border-black bg-yellow-300 font-bold'
              value={editData.title}
              onChange={(event) =>
                setEditData({ ...editData, title: event.target.value })
              }
            />
          </div>

          <div className='-rotate-1 border-2 border-black bg-pink-400 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
            <Label className='brutal-font font-black text-black'>ЖАНР</Label>
            <Input
              className='brutal-font border-2 border-black bg-orange-300 font-bold'
              value={
                Array.isArray(editData.genres)
                  ? editData.genres.join(', ')
                  : editData.genres
              }
              onChange={(event) => {
                const value = event.target.value;
                const genresArray = value
                  .split(/[ ,]+/)
                  .map((g) => g.trim())
                  .filter(Boolean);

                setEditData({ ...editData, genres: genresArray });
              }}
            />
          </div>

          <div className='rotate-1 border-2 border-black bg-orange-400 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
            <Label className='brutal-font font-black text-black'>
              ГОД ВЫПУСКА
            </Label>
            <Input
              className='brutal-font border-2 border-black bg-cyan-300 font-bold'
              type='number'
              value={editData.year}
              onChange={(event) =>
                setEditData({ ...editData, year: Number(event.target.value) })
              }
            />
          </div>

          <div className='-rotate-1 border-2 border-black bg-yellow-400 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
            <Label className='brutal-font font-black text-black'>
              ИЗОБРАЖЕНИЕ
            </Label>
            <Input
              accept='image/*'
              className='brutal-font border-2 border-black bg-pink-300 file:border-0 file:bg-black file:font-black file:text-white'
              type='file'
              onChange={handleFileChange}
            />
          </div>

          {includeRating && (
            <>
              <div className='rotate-1 border-2 border-black bg-purple-400 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
                <Label className='brutal-font font-black text-black'>
                  ОЦЕНКА
                </Label>
                <Select
                  value={editData.rating?.toString()}
                  onValueChange={(v) =>
                    setEditData({ ...editData, rating: Number(v) })
                  }
                >
                  <SelectTrigger className='brutal-font border-2 border-black bg-yellow-300 font-bold'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='border-2 border-black bg-pink-300 font-bold'>
                    <SelectItem value='5'>⭐⭐⭐⭐⭐ ОТЛИЧНО!</SelectItem>
                    <SelectItem value='4'>⭐⭐⭐⭐ ХОРОШО</SelectItem>
                    <SelectItem value='3'>⭐⭐⭐ НОРМ</SelectItem>
                    <SelectItem value='2'>⭐⭐ ПЛОХО</SelectItem>
                    <SelectItem value='1'>⭐ УЖАСНО</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='-rotate-1 border-2 border-black bg-lime-400 p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'>
                <Label
                  className='brutal-font font-black text-black'
                  htmlFor='edit-comment'
                >
                  КОММЕНТАРИЙ
                </Label>
                <Textarea
                  className='brutal-font min-h-25 border-2 border-black bg-cyan-300 font-bold text-black'
                  id='edit-comment'
                  placeholder='ЧТО ДУМАЕТЕ?'
                  value={editData.comment}
                  onChange={(event) =>
                    setEditData({ ...editData, comment: event.target.value })
                  }
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter className='mt-4'>
          <Button
            className='brutal-font w-full border-2 border-black bg-lime-400 font-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-lime-500 active:translate-x-1 active:translate-y-1 active:shadow-none'
            onClick={handleSubmit}
          >
            СОХРАНИТЬ ИЗМЕНЕНИЯ!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

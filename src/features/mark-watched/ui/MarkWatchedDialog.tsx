import { Check } from 'lucide-react';
import { useState } from 'react';

import { Series } from '@/shared/types';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/shared/ui';

interface MarkWatchedProperties {
  onMark: (id: number, rating: number, comment: string) => void;
  series: Series;
}

export const MarkWatchedDialog = ({
  onMark,
  series,
}: MarkWatchedProperties) => {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSave = () => {
    onMark(series.id, rating, comment);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className='brutal-font w-full transform border-2 border-black bg-lime-500 font-black text-black transition-transform hover:scale-105 hover:bg-lime-600'>
          <Check className='mr-2 h-4 w-4' /> ПРОСМОТРЕЛИ!
        </Button>
      </DialogTrigger>
      <DialogContent className='border-4 border-black bg-orange-400'>
        <DialogHeader>
          <div className='mb-4 rotate-1 border-2 border-black bg-purple-600 p-2 text-yellow-300'>
            <DialogTitle className='brutal-font font-black uppercase'>
              ОЦЕНИТЬ &quot;{series.title}&quot;
            </DialogTitle>
          </div>
          <DialogDescription className='brutal-font font-bold text-black'>
            КАК ВАМ ПОНРАВИЛОСЬ?
          </DialogDescription>
        </DialogHeader>

        <div className='grid gap-4 py-4'>
          <div className='-rotate-1 border-2 border-black bg-lime-400 p-3'>
            <Label className='brutal-font font-bold text-black'>ОЦЕНКА</Label>
            <Select
              value={rating.toString()}
              onValueChange={(v) => setRating(Number(v))}
            >
              <SelectTrigger className='brutal-font border-2 border-black bg-yellow-300 font-bold'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='border-2 border-black bg-pink-300'>
                <SelectItem value='5'>⭐⭐⭐⭐⭐ ОТЛИЧНО!</SelectItem>
                <SelectItem value='4'>⭐⭐⭐⭐ ХОРОШО!</SelectItem>
                <SelectItem value='3'>⭐⭐⭐ НОРМАЛЬНО</SelectItem>
                <SelectItem value='2'>⭐⭐ ПЛОХО</SelectItem>
                <SelectItem value='1'>⭐ УЖАСНО</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className='rotate-1 border-2 border-black bg-pink-400 p-3'>
            <Label
              className='brutal-font font-bold text-black'
              htmlFor='mark-comment'
            >
              КОММЕНТАРИЙ
            </Label>
            <Textarea
              className='brutal-font border-2 border-black bg-cyan-300 font-bold text-black'
              id='mark-comment'
              placeholder='ЧТО ДУМАЕТЕ?'
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            className='brutal-font rotate-1 border-2 border-black bg-lime-400 font-black text-black hover:rotate-0 hover:bg-lime-500'
            onClick={handleSave}
          >
            СОХРАНИТЬ В ИСТОРИЮ!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

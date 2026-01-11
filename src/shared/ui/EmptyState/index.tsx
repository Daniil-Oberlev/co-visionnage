import { RefreshCcw, SearchX } from 'lucide-react';

import { Button } from '@/shared/ui/lib';

export const EmptyState = ({
  description = 'Попробуй изменить фильтры или добавить что-то новое',
  title = 'НИЧЕГО НЕ НАЙДЕНО!',
  onReset,
}: {
  description?: string;
  title?: string;
  onReset?: () => void;
}) => (
  <div className='col-span-full flex flex-col items-center justify-center border-4 border-black bg-yellow-300 p-12 text-center shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]'>
    <div className='mb-4 rotate-12 border-4 border-black bg-white p-4'>
      <SearchX className='h-16 w-16 text-black' />
    </div>
    <p className='mb-2 text-4xl font-black text-black uppercase'>{title}</p>
    <p className='mb-6 font-bold text-black/80'>{description}</p>
    {onReset && (
      <Button
        className='border-2 border-black bg-black font-black text-white hover:bg-pink-500'
        onClick={onReset}
      >
        <RefreshCcw className='mr-2 h-4 w-4' /> СБРОСИТЬ ФИЛЬТРЫ
      </Button>
    )}
  </div>
);

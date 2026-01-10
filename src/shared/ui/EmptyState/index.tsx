import { SearchX } from 'lucide-react';

interface EmptyStateProperties {
  description?: string;
  title?: string;
}

export const EmptyState = ({
  description = 'Попробуй изменить фильтры или добавить что-то новое',
  title = 'НИЧЕГО НЕ НАЙДЕНО!',
}: EmptyStateProperties) => (
  <div className='col-span-full flex flex-col items-center justify-center border-4 border-dashed border-black bg-white/20 p-12 text-center'>
    <SearchX className='mb-4 h-16 w-16 text-black' />
    <p className='text-2xl font-black text-black'>{title}</p>
    <p className='font-bold text-black/70'>{description}</p>
  </div>
);

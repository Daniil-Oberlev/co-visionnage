import { ReactNode } from 'react';

import { SeriesStatus } from '@/shared/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui/lib';
import { CARD_COLORS, CARD_ROTATIONS, HEADER_COLORS } from '../model/constants';

interface SeriesCardProperties {
  series: {
    title: string;
    year: number;
    image?: string;
  };
  index: number;
  variant?: SeriesStatus;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
}

export const SeriesCard = ({
  series,
  index,
  actions,
  footer,
  children,
  variant = 'to-watch',
}: SeriesCardProperties) => {
  const bgColor = CARD_COLORS[index % CARD_COLORS.length];
  const headerColor = HEADER_COLORS[index % HEADER_COLORS.length];
  const rotation = CARD_ROTATIONS[index % CARD_ROTATIONS.length];

  return (
    <Card
      className={`${bgColor} transform border-4 border-black transition-transform hover:scale-105 ${rotation} flex flex-col overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:rotate-0`}
    >
      <div className='relative'>
        <img
          alt={series.title}
          className='h-48 w-full border-b-4 border-black object-cover'
          src={series.image || '/placeholder.svg'}
        />
        <div className='absolute top-2 right-2 flex gap-2'>{actions}</div>
      </div>
      <CardHeader className={`pb-2 ${headerColor} border-b-2 border-black`}>
        <CardTitle className='brutal-font text-lg font-black text-black'>
          {series.title.toUpperCase()}
        </CardTitle>
        <CardDescription className='brutal-font font-bold text-black'>
          {series.year}
        </CardDescription>
      </CardHeader>
      <CardContent
        className={`flex grow flex-col ${variant === 'to-watch' ? 'bg-cyan-300' : 'bg-orange-300'}`}
      >
        <div className='grow space-y-3'>{children}</div>
        <div className='space-y-3 pt-2'>{footer}</div>
      </CardContent>
    </Card>
  );
};

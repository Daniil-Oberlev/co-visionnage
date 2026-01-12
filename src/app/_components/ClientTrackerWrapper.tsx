'use client';

import dynamic from 'next/dynamic';

import { Series } from '@/shared/types';

const SeriesTracker = dynamic(() => import('./SeriesTracker'), {
  ssr: false,
  loading: () => <div className='min-h-screen bg-blue-500' />,
});

interface Properties {
  userEmail?: string;
  family: {
    id: string;
    name: string;
    invite_code: string;
  };
  initialSeries: Series[];
}

export default function ClientTrackerWrapper({
  userEmail,
  family,
  initialSeries,
}: Properties) {
  return (
    <SeriesTracker
      family={family}
      initialSeries={initialSeries}
      userEmail={userEmail}
    />
  );
}

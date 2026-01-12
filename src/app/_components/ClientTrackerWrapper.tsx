'use client';

import dynamic from 'next/dynamic';

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
}

export default function ClientTrackerWrapper({
  userEmail,
  family,
}: Properties) {
  return <SeriesTracker family={family} userEmail={userEmail} />;
}

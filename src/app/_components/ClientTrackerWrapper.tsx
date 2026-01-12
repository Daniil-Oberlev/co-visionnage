import { Series } from '@/shared/types';
import SeriesTracker from './SeriesTracker';

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

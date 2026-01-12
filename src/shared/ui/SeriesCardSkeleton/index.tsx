export const SeriesCardSkeleton = () => (
  <div className='h-100 w-full animate-pulse border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'>
    <div className='h-48 w-full border-b-4 border-black bg-gray-200' />
    <div className='space-y-4 p-4'>
      <div className='h-8 w-3/4 border-2 border-black bg-gray-300' />
      <div className='h-4 w-1/4 border-2 border-black bg-gray-200' />
      <div className='mt-8 space-y-2'>
        <div className='h-4 w-full border-2 border-black bg-gray-100' />
        <div className='h-4 w-full border-2 border-black bg-gray-100' />
      </div>
    </div>
  </div>
);

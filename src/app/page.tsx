import { createClient } from '@/shared/api/supabase/server';
import { SeriesHeader } from '@/shared/ui';
import ClientTrackerWrapper from './_components/ClientTrackerWrapper';
import { CreateFamilyForm, JoinFamilyForm } from './_components/Forms';

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className='brutal-font min-h-screen bg-blue-500 p-8'>
        <SeriesHeader />
        <div className='flex flex-col items-center justify-center py-20'>
          <div className='rotate-1 border-4 border-black bg-yellow-400 p-8 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]'>
            <h2 className='text-center text-4xl font-black tracking-tighter uppercase'>
              Войди, чтобы <br /> планировать просмотры!
            </h2>
          </div>
        </div>
      </div>
    );
  }

  const { data: membership } = await supabase
    .from('family_members')
    .select(`role, families ( id, name, invite_code )`)
    .eq('user_id', user.id)
    .single();

  const familyData = Array.isArray(membership?.families)
    ? membership?.families[0]
    : membership?.families;

  if (!membership || !familyData) {
    return (
      <div className='brutal-font min-h-screen bg-blue-500 p-8'>
        <SeriesHeader userEmail={user.email} />
        <div className='flex flex-col items-center justify-center py-10'>
          <div className='w-full max-w-md border-4 border-black bg-white p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]'>
            <h1 className='mb-6 text-4xl font-black tracking-tighter text-black uppercase'>
              Семья не найдена
            </h1>
            <CreateFamilyForm />
            <div className='my-6 border-t-4 border-dashed border-black' />
            <JoinFamilyForm />
          </div>
        </div>
      </div>
    );
  }

  const { data: initialSeries } = await supabase
    .from('family_series')
    .select('*')
    .eq('family_id', familyData.id)
    .order('created_at', { ascending: false });

  return (
    <ClientTrackerWrapper
      family={familyData}
      initialSeries={initialSeries ?? []}
      userEmail={user.email}
    />
  );
}

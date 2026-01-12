import { redirect } from 'next/navigation';

import { createClient } from '@/shared/api/supabase/server';
import { CreateFamilyForm } from './_components/CreateFamilyForm';

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect('/login');
  }

  const { data: membership } = await supabase
    .from('family_members')
    .select(
      `
      role,
      families (
        id,
        name,
        invite_code
      )
    `,
    )
    .eq('user_id', user.id)
    .single();

  const family = membership?.families;
  const familyData = Array.isArray(family) ? family[0] : family;

  if (!membership || !familyData) {
    return (
      <div className='brutal-font flex min-h-screen flex-col items-center justify-center bg-white p-6'>
        <div className='max-w-md border-4 border-black p-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]'>
          <h1 className='mb-4 text-4xl font-black tracking-tighter uppercase'>
            Семья не найдена
          </h1>
          <CreateFamilyForm />
        </div>
      </div>
    );
  }

  const { data: series } = await supabase
    .from('family_series')
    .select('*')
    .eq('family_id', familyData.id);

  return (
    <div className='brutal-font p-8'>
      <header className='mb-12'>
        <h1 className='text-6xl font-black tracking-tighter uppercase'>
          {familyData.name}
        </h1>
        <p className='mt-2 inline-block border-2 border-black bg-yellow-300 px-2 text-2xl font-bold'>
          Код для входа: {familyData.invite_code}
        </p>
      </header>

      <div className='grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3'>
        {series?.length === 0 ? (
          <div className='col-span-full border-4 border-dashed border-black p-12 text-center text-2xl font-bold'>
            Список пуст. Добавь первый сериал!
          </div>
        ) : (
          series?.map((item) => (
            <div
              key={item.id}
              className='border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
            >
              <h3 className='text-2xl font-black uppercase'>{item.title}</h3>
              <p className='font-bold text-gray-600'>{item.year}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

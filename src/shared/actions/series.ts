'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/shared/api/supabase/server';
import { Series, SeriesData, SeriesStatus } from '@/shared/types';

export async function addSeries(familyId: string, data: SeriesData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const seriesPayload = {
    family_id: familyId,
    title: data.title,
    year: data.year,
    genres: data.genres,
    image_url: data.image_url ?? undefined,
    created_by: user.id,
  };

  const { data: insertedSeries, error: insertError } = await supabase
    .from('family_series')
    .insert(seriesPayload)
    .select('id')
    .single();

  if (insertError) {
    console.error('Error adding series:', insertError);
    return { error: insertError.message };
  }

  const statusPayload = {
    series_id: insertedSeries.id,
    user_id: user.id,
    status: data.status,
    rating: data.rating,
    comment: data.comment,
  };

  const { error: statusError } = await supabase
    .from('family_series_status')
    .upsert(statusPayload, { onConflict: 'series_id,user_id' });

  if (statusError) {
    console.error('Error adding series status:', statusError);
    return { error: statusError.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function deleteSeries(seriesId: string) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('family_series')
    .delete()
    .eq('id', seriesId);

  if (error) {
    console.error('Error deleting series:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function updateSeriesStatus(
  seriesId: string,
  status: SeriesStatus,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase.from('family_series_status').upsert(
    {
      series_id: seriesId,
      user_id: user.id,
      status,
    },
    { onConflict: 'series_id,user_id' },
  );

  if (error) {
    console.error('Error updating status:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function markWatched(
  seriesId: string,
  rating: number,
  comment: string,
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const payload = {
    series_id: seriesId,
    user_id: user.id,
    status: 'watched' as const,
    rating,
    comment,
  };

  const { error } = await supabase
    .from('family_series_status')
    .upsert(payload, { onConflict: 'series_id,user_id' });

  if (error) {
    console.error('Error marking watched:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function moveToWatchList(seriesId: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const databaseNull = undefined as unknown as null;

  const payload = {
    series_id: seriesId,
    user_id: user.id,
    status: 'to-watch' as const,
    rating: databaseNull,
    comment: databaseNull,
  };

  const { error } = await supabase
    .from('family_series_status')
    .upsert(payload, { onConflict: 'series_id,user_id' });

  if (error) {
    console.error('Error moving to watch list:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function editSeries(seriesId: string, updates: Partial<Series>) {
  const supabase = await createClient();

  const { error } = await supabase
    .from('family_series')
    .update(updates)
    .eq('id', seriesId);

  if (error) {
    console.error('Error editing series:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

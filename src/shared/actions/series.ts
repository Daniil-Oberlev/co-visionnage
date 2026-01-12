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

  const payload = {
    family_id: familyId,
    title: data.title,
    status: data.status,
    year: data.year,
    genres: data.genres,
    rating: data.rating,
    comment: data.comment,
    image_url: data.image_url ?? undefined,
    dateWatched:
      data.status === 'watched'
        ? new Date().toISOString().split('T')[0]
        : undefined,
    created_by: user.id,
  };

  const { error } = await supabase.from('family_series').insert(payload);

  if (error) {
    console.error('Error adding series:', error);
    return { error: error.message };
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

  const { error } = await supabase
    .from('family_series')
    .update({ status })
    .eq('id', seriesId);

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

  const payload = {
    status: 'watched' as const,
    rating,
    comment,
    dateWatched: new Date().toISOString().split('T')[0],
  };

  const { error } = await supabase
    .from('family_series')
    .update(payload)
    .eq('id', seriesId);

  if (error) {
    console.error('Error marking watched:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function moveToWatchList(seriesId: string) {
  const supabase = await createClient();

  const databaseNull = undefined as unknown as null;

  const payload = {
    status: 'to-watch' as const,
    rating: databaseNull,
    comment: databaseNull,
    dateWatched: databaseNull,
  };

  const { error } = await supabase
    .from('family_series')
    .update(payload)
    .eq('id', seriesId);

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

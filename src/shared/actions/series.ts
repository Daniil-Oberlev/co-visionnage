'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/shared/api/supabase/server';
import { Series, SeriesStatus } from '@/shared/types';

export async function addSeries(familyId: string, title: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const { error } = await supabase.from('family_series').insert({
    family_id: familyId,
    title: title,
    status: 'to-watch',
    year: new Date().getFullYear(),
    genres: [],
  });

  if (error) {
    console.error('Error adding series:', error);
    return { error: error.message };
  }

  revalidatePath('/');
  return { success: true };
}

export async function deleteSeries(seriesId: number) {
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
  seriesId: number,
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

export async function editSeries(seriesId: number, updates: Partial<Series>) {
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

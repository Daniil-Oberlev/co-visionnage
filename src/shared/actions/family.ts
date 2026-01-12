'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/shared/api/supabase/server';

export type FamilyActionState = {
  error?: string;
  success?: boolean;
};

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let index = 0; index < 6; index++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BRTL-${result}`;
}

export async function createFamily(
  _previousState: FamilyActionState,
  formData: FormData,
): Promise<FamilyActionState> {
  const supabase = await createClient();
  const name = formData.get('familyName') as string;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const inviteCode = generateInviteCode();

  const { data: family, error: familyError } = await supabase
    .from('families')
    .insert({
      name,
      invite_code: inviteCode,
      owner_id: user.id,
    })
    .select()
    .single();

  if (familyError) return { error: familyError.message };

  const { error: memberError } = await supabase.from('family_members').insert({
    family_id: family.id,
    user_id: user.id,
    role: 'owner',
  });

  if (memberError) return { error: memberError.message };

  revalidatePath('/');
  return { success: true };
}

export async function joinFamily(
  _previousState: FamilyActionState,
  formData: FormData,
): Promise<FamilyActionState> {
  const supabase = await createClient();
  const rawInviteCode = formData.get('inviteCode') as string;

  if (!rawInviteCode) return { error: 'Введите код' };

  const inviteCode = rawInviteCode.trim().toUpperCase();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Не авторизован' };

  const { data: family, error: findError } = await supabase
    .from('families')
    .select('id')
    .eq('invite_code', inviteCode)
    .maybeSingle();

  if (findError) return { error: 'Ошибка при поиске: ' + findError.message };
  if (!family) return { error: `Семья с кодом ${inviteCode} не найдена` };

  const { error: joinError } = await supabase.from('family_members').insert({
    family_id: family.id,
    user_id: user.id,
    role: 'member',
  });

  if (joinError) {
    if (joinError.code === '23505') {
      return { error: 'Вы уже состоите в этой семье' };
    }
    return { error: joinError.message };
  }

  revalidatePath('/');
  return { success: true };
}

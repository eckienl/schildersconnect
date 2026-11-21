'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';
import { clean } from '@/lib/sanitize';

export async function chooseResponse(formData: FormData) {
  const { profile } = await getSession();
  if (!profile) redirect('/inloggen');
  const responseId = clean(formData.get('response_id'), 64);
  const jobId = clean(formData.get('job_id'), 64);
  const { data, error } = await db().rpc('choose_response', { p_response: responseId, p_customer: profile.id });
  const code = error ? 'fout' : String(data);
  redirect(`/account/klus/${jobId}?m=${code}`);
}

export async function closeJob(formData: FormData) {
  const { profile } = await getSession();
  if (!profile) redirect('/inloggen');
  const jobId = clean(formData.get('job_id'), 64);
  await db().from('jobs').update({ status: 'closed' }).eq('id', jobId).eq('customer_id', profile.id);
  redirect(`/account/klus/${jobId}?m=gesloten`);
}

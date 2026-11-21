'use server';

import { redirect } from 'next/navigation';
import { db } from '@/lib/supabase/admin';
import { getSession } from '@/lib/session';
import { clean } from '@/lib/sanitize';
import { sendMail } from '@/lib/mail';
import { siteUrl } from '@/lib/site';

export async function chooseResponse(formData: FormData) {
  const { profile } = await getSession();
  if (!profile) redirect('/inloggen');
  const responseId = clean(formData.get('response_id'), 64);
  const jobId = clean(formData.get('job_id'), 64);
  const { data, error } = await db().rpc('choose_response', { p_response: responseId, p_customer: profile.id });
  const code = error ? 'fout' : String(data);
  if (code === 'ok') {
    const { data: r } = await db().from('responses').select('credits_charged, painters(company_name, profiles(email)), jobs(title, city)').eq('id', responseId).maybeSingle();
    const x: any = r;
    await sendMail(x?.painters?.profiles?.email, `Je bent gekozen voor "${x?.jobs?.title}"`, 'Gefeliciteerd, de klant heeft jou gekozen!',
      `<p>De klant van de opdracht "${x?.jobs?.title}" in ${x?.jobs?.city} wil met <strong>${x?.painters?.company_name}</strong> in contact komen. Er zijn ${x?.credits_charged} credits afgeschreven. Je vindt de contactgegevens nu in je dashboard; neem snel contact op.</p>`,
      { label: 'Bekijk contactgegevens', url: `${await siteUrl()}/schilder/klus/${jobId}` });
  }
  redirect(`/account/klus/${jobId}?m=${code}`);
}

export async function closeJob(formData: FormData) {
  const { profile } = await getSession();
  if (!profile) redirect('/inloggen');
  const jobId = clean(formData.get('job_id'), 64);
  await db().from('jobs').update({ status: 'closed' }).eq('id', jobId).eq('customer_id', profile.id);
  redirect(`/account/klus/${jobId}?m=gesloten`);
}

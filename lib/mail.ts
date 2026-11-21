import 'server-only';
import nodemailer from 'nodemailer';

/**
 * E-mail via any SMTP account (e.g. a Gmail address with an app password, later your own domain).
 * Without SMTP settings, mails are only logged, so the site keeps working.
 */
export const MAIL_ENABLED = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 465);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return transporter;
}

function layout(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#f4f6fa;font-family:Arial,Helvetica,sans-serif;color:#12213b">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#0e2140;color:#fff;padding:18px 22px;border-radius:12px 12px 0 0;font-weight:800;font-size:20px;font-style:italic">Schilders<span style="color:#f26a1b">Connect</span></div>
    <div style="background:#fff;padding:24px 22px;border-radius:0 0 12px 12px;border:1px solid #e2e6ee;border-top:0">
      <h1 style="font-size:20px;margin:0 0 12px">${title}</h1>
      <div style="font-size:15px;line-height:1.55">${body}</div>
      ${cta ? `<p style="margin:22px 0 0"><a href="${cta.url}" style="background:#f26a1b;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:700;display:inline-block">${cta.label}</a></p>` : ''}
    </div>
    <p style="font-size:12px;color:#5a6478;text-align:center;margin-top:14px">SchildersConnect · Het platform voor schilderwerk</p>
  </div></body></html>`;
}

export async function sendMail(to: string | undefined | null, subject: string, title: string, body: string, cta?: { label: string; url: string }) {
  if (!to) return;
  if (to.endsWith('@schildersconnect.nl') && to.startsWith('demo-')) return; // never mail demo accounts
  if (!MAIL_ENABLED) {
    console.log(`[mail uit] ${to} · ${subject}`);
    return;
  }
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM || `SchildersConnect <${process.env.SMTP_USER}>`,
      to,
      subject,
      html: layout(title, body, cta),
    });
  } catch (e) {
    console.error('[mail fout]', subject, e);
  }
}

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || '';

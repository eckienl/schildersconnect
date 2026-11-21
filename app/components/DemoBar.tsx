import { DEMO_ENABLED, DEMO_USERS, isDemoEmail } from '@/lib/demo';
import { getSession } from '@/lib/session';
import { demoReset, demoSwitch } from '@/app/demo/actions';

export async function DemoBar() {
  if (!DEMO_ENABLED) return null;
  const { profile, painter } = await getSession();
  let current = 'bezoeker';
  if (profile && isDemoEmail(profile.email)) {
    current = Object.entries(DEMO_USERS).find(([, u]) => u.email === profile.email)?.[0] ?? '';
  } else if (profile) current = '';
  const options: [string, string][] = [['bezoeker', 'Bezoeker'], ...Object.entries(DEMO_USERS).map(([k, u]) => [k, u.label] as [string, string])];
  return (
    <div className="demobar" role="region" aria-label="Demomodus">
      <span className="demobar-label">Demo · bekijk als</span>
      <form action={demoSwitch} className="demobar-options">
        {options.map(([k, label]) => (
          <button key={k} name="role" value={k} className={current === k ? 'active' : ''}>{label}</button>
        ))}
      </form>
      <form action={demoReset}>
        <button className="demobar-reset" title="Zet alle demodata terug naar het begin">Reset demo</button>
      </form>
      {painter && painter.status === 'approved' && <span className="demobar-credits">{painter.credits} credits</span>}
    </div>
  );
}

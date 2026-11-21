import Link from 'next/link';
import { Icon } from './Icon';

export type MenuItem = { href: string; label: string; icon: string; badge?: number | string; badgeTone?: 'orange' | 'green' };

export function DashShell({
  title,
  icon,
  menu,
  active,
  children,
}: {
  title: string;
  icon: string;
  menu: MenuItem[];
  active: string;
  children: React.ReactNode;
}) {
  return (
    <div className="dash">
      <div className="container dash-grid">
        <aside className="side">
          <div className="side-head">
            <span className="side-icon"><Icon name={icon} size={20} /></span>
            <span>{title}</span>
          </div>
          <nav className="side-menu">
            {menu.map((m) => (
              <Link key={m.href} href={m.href} className={active === m.href ? 'active' : ''}>
                <Icon name={m.icon} size={18} />
                <span>{m.label}</span>
                {m.badge !== undefined && m.badge !== 0 && <span className={`side-badge ${m.badgeTone === 'green' ? 'green' : ''}`}>{m.badge}</span>}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="dash-main">{children}</div>
      </div>
    </div>
  );
}

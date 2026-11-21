import Link from 'next/link';
import { budgetLabel } from '@/lib/budget';
import { shortPostcode } from '@/lib/sanitize';
import { Icon } from '@/app/components/Icon';

export function JobRow({ job: j }: { job: any }) {
  return (
    <Link href={`/schilder/klus/${j.id}`} className="item">
      <div>
        <h3>{j.title}</h3>
        <div className="meta">
          <span><Icon name="pin" size={14} />{shortPostcode(j.postcode)}.. {j.city}</span>
          <span>{j.job_type}</span>
          <span>{j.location_type}</span>
          <span>ca. {j.surface_m2} m²</span>
          <span><Icon name="clock" size={14} />{j.timing}</span>
          {j.photos?.length > 0 && <span><Icon name="camera" size={14} />{j.photos.length}</span>}
        </div>
      </div>
      <div className="row">
        <span className="badge">{j.responses?.[0]?.count ?? 0} reacties</span>
        <span className="badge">{budgetLabel(j).replace(/^Budget: /, '')}</span>
        <span className="badge badge-orange">Match: {j.match_cost} credits</span>
      </div>
    </Link>
  );
}

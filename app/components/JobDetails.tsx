import { shortPostcode } from '@/lib/sanitize';
import { budgetLabel } from '@/lib/budget';

export function JobDetails({ job, showFullPostcode = false }: { job: any; showFullPostcode?: boolean }) {
  return (
    <div className="stack">
      <dl className="kv">
        <dt>Soort werk</dt><dd>{job.job_type}</dd>
        <dt>Binnen / buiten</dt><dd>{job.location_type}</dd>
        <dt>Oppervlakte</dt><dd>ca. {job.surface_m2} m²</dd>
        <dt>Ondergrond</dt><dd>{job.substrate || '–'}</dd>
        <dt>Huidige staat</dt><dd>{job.condition || '–'}</dd>
        {job.location_type !== 'binnen' && (<><dt>Steiger nodig</dt><dd>{job.scaffold_needed}</dd></>)}
        <dt>Planning</dt><dd>{job.timing || '–'}</dd>
        <dt>Budget</dt><dd>{budgetLabel(job).replace(/^Budget: /, '')}</dd>
        <dt>Locatie</dt><dd>{showFullPostcode ? job.postcode : `${shortPostcode(job.postcode)}..`} {job.city}</dd>
      </dl>
      {job.description && <p style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{job.description}</p>}
      {job.photos?.length > 0 && (
        <div className="photos">
          {job.photos.map((src: string) => (
            <a key={src} href={src} target="_blank" rel="noreferrer"><img src={src} alt="Foto van de klus" /></a>
          ))}
        </div>
      )}
    </div>
  );
}

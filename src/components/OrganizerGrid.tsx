import { useMemo, useState, type CSSProperties } from 'react';
import type { OrganizerPerson } from '../lib/content';

interface OrganizerGridProps {
  people: OrganizerPerson[];
}

// 6 brand pigments from public/assets/logo.svg
const BRAND_RINGS = ['#3b4198', '#dc5847', '#f0983d', '#409268', '#3380d8', '#dbaf36'];

function getInitials(name: string): string {
  const parts = name.split(' ').filter((part) => !part.endsWith('.'));
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function OrganizerCard({ person, index }: { person: OrganizerPerson; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoPath = person.photo ? `/assets/organizers/${person.photo}` : null;
  const ringColor = BRAND_RINGS[index % BRAND_RINGS.length];

  return (
    <article className={`person${person.lead ? ' lead' : ''}`}>
      {person.website ? (
        <a
          className="person-link"
          href={person.website}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit ${person.name}'s website`}
          title={`Visit ${person.name}'s website`}
        >
          <svg
            viewBox="0 0 20 20"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M11 4h5v5" />
            <path d="M16 4l-7.5 7.5" />
            <path d="M15 11.5v3.25A1.25 1.25 0 0 1 13.75 16h-8.5A1.25 1.25 0 0 1 4 14.75v-8.5A1.25 1.25 0 0 1 5.25 5H8.5" />
          </svg>
        </a>
      ) : null}

      <div
        className="ph"
        style={{ backgroundColor: ringColor, '--ring-color': ringColor } as CSSProperties}
      >
        {photoPath && !imgFailed ? (
          <img
            src={photoPath}
            alt={`Portrait of ${person.name}`}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <span aria-hidden="true">{getInitials(person.name)}</span>
        )}
      </div>
      <h3>{person.name}</h3>
      <div className="role">{person.role}</div>
      <div className="aff">{person.affiliation}</div>
    </article>
  );
}

export default function OrganizerGrid({ people }: OrganizerGridProps) {
  const [selectedCommittee, setSelectedCommittee] = useState<string>('All');

  const committees = useMemo(() => {
    const unique = Array.from(new Set(people.map((p) => p.committee)));
    return ['All', ...unique];
  }, [people]);

  const filtered = useMemo(() => {
    if (selectedCommittee === 'All') return people;
    return people.filter((p) => p.committee === selectedCommittee);
  }, [people, selectedCommittee]);

  return (
    <div>
      {committees.length > 2 ? (
        <div className="filter-bar" role="group" aria-label="Filter organizers by committee">
          {committees.map((committee) => {
            const count =
              committee === 'All'
                ? people.length
                : people.filter((p) => p.committee === committee).length;
            return (
              <button
                key={committee}
                type="button"
                className="filter-btn"
                aria-pressed={selectedCommittee === committee}
                onClick={() => setSelectedCommittee(committee)}
              >
                {committee} ({count})
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="people">
        {filtered.map((person, index) => (
          <OrganizerCard key={person.name} person={person} index={index} />
        ))}
      </div>
    </div>
  );
}

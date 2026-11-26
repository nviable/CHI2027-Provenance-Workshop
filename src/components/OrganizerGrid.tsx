import { useMemo, useState } from 'react';
import type { OrganizerPerson } from '../lib/content';

interface OrganizerGridProps {
  people: OrganizerPerson[];
}

const AVATAR_COLORS = ['#0067b8', '#107c41', '#5c2d91', '#008575', '#c4314b', '#a86b00'];

function getInitials(name: string): string {
  const parts = name.split(' ').filter((part) => !part.endsWith('.'));
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function OrganizerCard({ person, index }: { person: OrganizerPerson; index: number }) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoPath = person.photo ? `/assets/organizers/${person.photo}` : null;
  const bgColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <article className={`person${person.lead ? ' lead' : ''}`}>
      <div className="ph" style={{ backgroundColor: bgColor }}>
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
      <h3>
        {person.website ? (
          <a href={person.website} target="_blank" rel="noopener noreferrer">
            {person.name}
          </a>
        ) : (
          person.name
        )}
      </h3>
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

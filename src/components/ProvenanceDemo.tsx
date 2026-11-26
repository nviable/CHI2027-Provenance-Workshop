import { useEffect, useState } from 'react';
import type { ProvenanceState } from '../lib/content';

interface ProvenanceDemoProps {
  imageUrl: string;
  imageAlt: string;
  meta: string;
  caption: string;
  states: ProvenanceState[];
}

export default function ProvenanceDemo({
  imageUrl,
  imageAlt,
  meta,
  caption,
  states,
}: ProvenanceDemoProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  const current = states[activeIndex] ?? states[0];

  useEffect(() => {
    if (!autoPlay || states.length <= 1) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const id = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % states.length);
    }, 4000);

    return () => window.clearInterval(id);
  }, [autoPlay, states.length]);

  const handleSelect = (index: number) => {
    setAutoPlay(false);
    setActiveIndex(index);
  };

  return (
    <div>
      <figure
        className="demo"
        aria-label="Interactive example: one image shown with four provenance states"
      >
        <div className="media">
          <img src={imageUrl} alt={imageAlt} loading="eager" />
          <div className="pin">
            <i className={`tone-${current.tone}`} aria-hidden="true">
              {current.icon}
            </i>
            <span>{current.pinLabel}</span>
          </div>
        </div>

        <div className="meta">{meta}</div>

        <div className="explain" aria-live="polite">
          <strong>{current.lead}</strong> {current.body}
          {current.emphasis ? (
            <>
              {' '}
              <em>{current.emphasis}</em>
            </>
          ) : null}
          <button
            type="button"
            className="demo-action-btn"
            aria-expanded={showDetails}
            onClick={() => {
              setAutoPlay(false);
              setShowDetails((prev) => !prev);
            }}
          >
            {showDetails ? 'Hide details' : current.actionLabel}
          </button>
        </div>

        {showDetails ? (
          <div className="demo-drawer">
            <dl>
              {current.details.map((row) => (
                <div className="demo-drawer-row" key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        <div className="states" role="group" aria-label="Provenance state">
          {states.map((state, idx) => (
            <button
              key={state.id}
              type="button"
              aria-pressed={idx === activeIndex}
              onClick={() => handleSelect(idx)}
            >
              {state.buttonLabel}
            </button>
          ))}
        </div>
      </figure>
      <p className="credit" style={{ marginTop: '12px' }}>
        {caption}
      </p>
    </div>
  );
}

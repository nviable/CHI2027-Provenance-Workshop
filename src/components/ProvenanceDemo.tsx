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
    }, 4200);

    return () => window.clearInterval(id);
  }, [autoPlay, states.length]);

  const handleSelect = (index: number) => {
    setAutoPlay(false);
    setActiveIndex(index);
  };

  const toggleDetails = () => {
    setAutoPlay(false);
    setShowDetails((prev) => !prev);
  };

  return (
    <div>
      <figure
        className="demo-card"
        data-tone={current.tone}
        aria-label="Interactive example: one image shown with four provenance states"
      >
        <div className="demo-top-bar">
          <span>INTERACTIVE DEMO · CLICK PIN OR STATES</span>
          <button
            type="button"
            className="demo-play-btn"
            onClick={() => setAutoPlay((prev) => !prev)}
            aria-pressed={autoPlay}
          >
            {autoPlay ? '⏸ Pause' : '▶ Auto-cycle'}
          </button>
        </div>

        <div className="demo-media">
          <img src={imageUrl} alt={imageAlt} loading="eager" />
          <button
            type="button"
            className="pin-btn"
            onClick={toggleDetails}
            aria-expanded={showDetails}
            title="Click to toggle provenance details"
          >
            <i className={`tone-${current.tone}`} aria-hidden="true">
              {current.icon}
            </i>
            <span>{current.pinLabel}</span>
            <span className="pin-hint" aria-hidden="true">
              {showDetails ? '▲' : '▼'}
            </span>
          </button>
        </div>

        <div className="demo-meta">{meta}</div>

        {/* All slides share grid-area: 1/1 so height always matches the tallest state without jumping */}
        <div className="explain-stack" aria-live="polite">
          {states.map((state, idx) => {
            const isActive = idx === activeIndex;
            return (
              <div
                key={state.id}
                className={`explain-slide${isActive ? ' is-active' : ''}`}
                aria-hidden={!isActive}
              >
                <strong>{state.lead}</strong> {state.body}
                {state.emphasis ? (
                  <>
                    {' '}
                    <em>{state.emphasis}</em>
                  </>
                ) : null}
                <button
                  type="button"
                  className="demo-action-btn"
                  aria-expanded={isActive ? showDetails : undefined}
                  tabIndex={isActive ? 0 : -1}
                  onClick={toggleDetails}
                >
                  {showDetails ? 'Hide details' : state.actionLabel}
                </button>
              </div>
            );
          })}
        </div>

        {showDetails ? (
          <div className="demo-drawer">
            <div className="demo-drawer-stack">
              {states.map((state, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <dl
                    key={state.id}
                    className={`demo-drawer-slide${isActive ? ' is-active' : ''}`}
                    aria-hidden={!isActive}
                  >
                    {state.details.map((row) => (
                      <div className="demo-drawer-row" key={row.label}>
                        <dt>{row.label}</dt>
                        <dd>{row.value}</dd>
                      </div>
                    ))}
                  </dl>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="states" role="group" aria-label="Provenance state">
          {states.map((state, idx) => (
            <button
              key={state.id}
              type="button"
              data-tone={state.tone}
              aria-pressed={idx === activeIndex}
              onClick={() => handleSelect(idx)}
            >
              <span aria-hidden="true">{state.icon}</span>
              <span>{state.buttonLabel}</span>
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

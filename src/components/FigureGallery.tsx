import { useEffect, useState } from 'react';

interface FigureItem {
  src: string;
  label: string;
  caption: string;
  alt: string;
}

interface FigureGalleryProps {
  figures: FigureItem[];
}

export default function FigureGallery({ figures }: FigureGalleryProps) {
  const [selected, setSelected] = useState<FigureItem | null>(null);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selected]);

  return (
    <>
      <div className="figs">
        {figures.map((fig) => (
          <figure className="fig" key={fig.src}>
            <button
              type="button"
              className="fig-trigger"
              onClick={() => setSelected(fig)}
              aria-label={`Enlarge ${fig.label} ${fig.caption}`}
            >
              <img src={fig.src} alt={fig.alt} loading="lazy" />
            </button>
            <figcaption>
              <b>{fig.label}</b> {fig.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      {selected ? (
        <div
          className="lightbox-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label={`${selected.label} enlarged preview`}
          onClick={() => setSelected(null)}
        >
          <div className="lightbox-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="lightbox-header">
              <p>
                <strong>{selected.label}</strong> {selected.caption}
              </p>
              <button
                type="button"
                className="lightbox-close"
                onClick={() => setSelected(null)}
                autoFocus
              >
                Close (Esc)
              </button>
            </div>
            <div className="lightbox-img-wrap">
              <img src={selected.src} alt={selected.alt} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

import type { CfpData } from '../lib/content';

interface SubmissionSlotProps {
  submission: CfpData['submission'];
}

export default function SubmissionSlot({ submission }: SubmissionSlotProps) {
  if (submission.status === 'embed' && submission.embedUrl) {
    return (
      <div className="box submit-box" id="submission-form">
        <h3>{submission.heading}</h3>
        <p>{submission.description}</p>
        <div className="embed-frame-wrap">
          <iframe
            src={submission.embedUrl}
            title={submission.embedTitle}
            height={submission.embedHeight}
            loading="lazy"
          >
            Loading submission form…
          </iframe>
        </div>
        <p className="credit" style={{ marginTop: '12px', marginBottom: 0 }}>
          Having trouble with the embedded form?{' '}
          <a href={submission.embedUrl} target="_blank" rel="noopener noreferrer">
            Open the submission form in a new tab ↗
          </a>
        </p>
      </div>
    );
  }

  if (submission.status === 'external_link' && submission.externalUrl) {
    return (
      <div className="box submit-box" id="submission-form">
        <h3>{submission.heading}</h3>
        <p>{submission.description}</p>
        <div className="btns" style={{ marginTop: '14px' }}>
          <a
            className="btn primary"
            href={submission.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {submission.buttonLabel} ↗
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="box submit-box" id="submission-form">
      <h3>{submission.heading}</h3>
      <p>{submission.description}</p>
      <div className="btns" style={{ marginTop: '14px' }}>
        <span className="placeholder-pill">{submission.buttonLabel}</span>
        <a href="/contact" className="btn secondary">
          Ask the organizers
        </a>
      </div>
    </div>
  );
}

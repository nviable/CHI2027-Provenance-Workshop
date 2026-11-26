import { useState, type CSSProperties } from 'react';
import type { HomeData } from '../lib/content';

interface PipelineInteractiveProps {
  pipeline: HomeData['pipeline'];
}

const STAGE_COLORS = ['#dc5847', '#f0983d', '#dbaf36', '#409268', '#3380d8', '#3b4198'];

const STAGE_NOTES: Record<number, string> = {
  1: 'Cameras, editing suites, or generative models may never attach signed credentials in the first place.',
  2: 'Certificates can come from unfamiliar issuers, and AI/watermark detectors routinely disagree with each other.',
  3: 'Social feeds, messaging apps, screenshots, and re-encoding routinely strip or damage provenance metadata.',
  4: 'Workshop focus: How should cues appear at a glance vs. on demand without overwhelming or numbing viewers?',
  5: 'Workshop focus: What do everyday people infer from words like "AI-generated", "edited", or "no credentials"?',
  6: 'Workshop focus: Does provenance help someone verify, pause, or share responsibly — or accidentally erode trust?',
};

export default function PipelineInteractive({ pipeline }: PipelineInteractiveProps) {
  const [selectedIdx, setSelectedIdx] = useState(3); // Default to Stage 4 (Surface — start of Last Mile)
  const selected = pipeline.stages[selectedIdx] ?? pipeline.stages[0];
  const activeColor = STAGE_COLORS[selectedIdx % STAGE_COLORS.length];

  return (
    <div className="pipeline" aria-label={pipeline.ariaLabel}>
      <div className="pl-head">
        <span>{pipeline.leftHeading}</span>
        <span className="last">{pipeline.rightHeading}</span>
      </div>

      <div className="stages" role="group" aria-label="Select a provenance pipeline stage">
        {pipeline.stages.map((stage, idx) => {
          const color = STAGE_COLORS[idx % STAGE_COLORS.length];
          return (
            <button
              key={stage.number}
              type="button"
              className={`stage-btn${stage.lastMile ? ' lm' : ''}`}
              style={{ '--stage-color': color } as CSSProperties}
              aria-pressed={idx === selectedIdx}
              onClick={() => setSelectedIdx(idx)}
            >
              <span className="stage-num">{stage.number}</span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
            </button>
          );
        })}
      </div>

      <div className="pipeline-detail" aria-live="polite">
        <div>
          <strong>
            Stage {selected.number} · {selected.title}:
          </strong>{' '}
          {STAGE_NOTES[selected.number] ?? selected.description}
        </div>
        <span className="pipeline-badge" style={{ background: activeColor }}>
          {selected.lastMile ? 'Last mile · CHI 2027 focus' : 'Upstream infrastructure'}
        </span>
      </div>

      <p className="chips">
        {pipeline.summaryPrefix}{' '}
        <span className="chip v">
          <i>✓</i>valid
        </span>{' '}
        <span className="chip p">
          <i>◐</i>partial
        </span>{' '}
        <span className="chip m">
          <i>○</i>missing
        </span>{' '}
        or{' '}
        <span className="chip c">
          <i>≠</i>conflicting
        </span>
        .
      </p>
    </div>
  );
}

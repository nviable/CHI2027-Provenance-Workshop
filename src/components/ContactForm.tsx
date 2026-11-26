import { useState, type SyntheticEvent } from 'react';

interface ContactFormProps {
  topics: string[];
  fallbackEmail: string;
}

type SubmitState =
  | { kind: 'idle' }
  | { kind: 'submitting' }
  | { kind: 'success'; message: string; dryRun?: boolean }
  | { kind: 'error'; message: string };

export default function ContactForm({ topics, fallbackEmail }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [affiliation, setAffiliation] = useState('');
  const [topic, setTopic] = useState(topics[0] ?? 'General inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // Honeypot anti-spam field
  const [status, setStatus] = useState<SubmitState>({ kind: 'idle' });

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim() || !email.trim() || !message.trim()) {
      setStatus({
        kind: 'error',
        message: 'Please fill in your name, email address, and message.',
      });
      return;
    }

    setStatus({ kind: 'submitting' });

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          affiliation: affiliation.trim(),
          topic,
          subject: subject.trim(),
          message: message.trim(),
          website,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        message?: string;
        error?: string;
        dryRun?: boolean;
      };

      if (!response.ok || !payload.ok) {
        setStatus({
          kind: 'error',
          message:
            payload.error ||
            `We could not send your message right now. Please email ${fallbackEmail} directly.`,
        });
        return;
      }

      setStatus({
        kind: 'success',
        message:
          payload.message ||
          'Thank you! Your message has been forwarded to the workshop organizing committee.',
        dryRun: payload.dryRun,
      });
      setName('');
      setEmail('');
      setAffiliation('');
      setSubject('');
      setMessage('');
    } catch {
      setStatus({
        kind: 'error',
        message: `Network error while sending your message. You can also email ${fallbackEmail} directly.`,
      });
    }
  };

  return (
    <div className="form-card">
      {status.kind === 'success' ? (
        <div className="form-alert success" role="status">
          <strong>Message received.</strong> {status.message}
          {status.dryRun ? (
            <div className="field-hint" style={{ marginTop: '6px' }}>
              (Local dry-run mode is active — configure <code>RESEND_API_KEY</code> and{' '}
              <code>CONTACT_RECIPIENTS</code> in Cloudflare Workers to deliver live emails.)
            </div>
          ) : null}
        </div>
      ) : null}

      {status.kind === 'error' ? (
        <div className="form-alert error" role="alert">
          <strong>Could not send message.</strong> {status.message}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot field: hidden from human visitors, traps naive bots */}
        <div className="hp-field" aria-hidden="true">
          <label htmlFor="contact-website">Leave this field blank</label>
          <input
            id="contact-website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
        </div>

        <div className="form-grid" style={{ marginBottom: '18px' }}>
          <div className="field">
            <label htmlFor="contact-name">
              Your name <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Alex Rivera"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="contact-email">
              Email address <span className="req" aria-hidden="true">*</span>
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="alex@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="form-grid" style={{ marginBottom: '18px' }}>
          <div className="field">
            <label htmlFor="contact-affiliation">Affiliation (optional)</label>
            <input
              id="contact-affiliation"
              name="affiliation"
              type="text"
              autoComplete="organization"
              placeholder="University, newsroom, or lab"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
            />
          </div>

          <div className="field">
            <label htmlFor="contact-topic">Topic</label>
            <select
              id="contact-topic"
              name="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              {topics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field">
          <label htmlFor="contact-subject">Subject (optional)</label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            placeholder="Brief summary of your question"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="contact-message">
            Message <span className="req" aria-hidden="true">*</span>
          </label>
          <textarea
            id="contact-message"
            name="message"
            required
            placeholder="How can the workshop organizers help?"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <span className="field-hint">
            Forwarded to the organizing committee with your email set as Reply-To.
          </span>
        </div>

        <div className="btns">
          <button
            type="submit"
            className="btn primary"
            disabled={status.kind === 'submitting'}
          >
            {status.kind === 'submitting' ? 'Sending…' : 'Send message'}
          </button>
        </div>
      </form>
    </div>
  );
}

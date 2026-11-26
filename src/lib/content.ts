import { parse } from 'yaml';
import { z } from 'zod';

import siteRaw from '../data/site.yaml?raw';
import homeRaw from '../data/home.yaml?raw';
import cfpRaw from '../data/cfp.yaml?raw';
import programmeRaw from '../data/programme.yaml?raw';
import organizersRaw from '../data/organizers.yaml?raw';
import venueResourcesRaw from '../data/venue-resources.yaml?raw';
import contactRaw from '../data/contact.yaml?raw';

function parseYaml<T extends z.ZodTypeAny>(raw: string, schema: T, filename: string): z.infer<T> {
  const parsed = parse(raw);
  const result = schema.safeParse(parsed);
  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid content in src/data/${filename}:\n${details}`);
  }
  return result.data;
}

const siteSchema = z.object({
  title: z.string().min(1),
  shortTitle: z.string().min(1),
  eventBadge: z.string().min(1),
  tagline: z.string().min(1),
  description: z.string().min(1),
  ogImage: z.string().min(1),
  conference: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    location: z.string().min(1),
    dates: z.string().min(1),
  }),
  proposalPdf: z.object({
    label: z.string().min(1),
    url: z.string(),
    comingSoonNote: z.string().min(1),
  }),
  facts: z.array(
    z.object({
      label: z.string().min(1),
      value: z.string().min(1),
      note: z.string().optional(),
    }),
  ),
  leadContact: z.object({
    name: z.string().min(1),
    role: z.string().min(1),
    email: z.string().email(),
  }),
  navigation: z.array(
    z.object({
      label: z.string().min(1),
      href: z.string().min(1),
    }),
  ),
});

const provenanceStateSchema = z.object({
  id: z.enum(['valid', 'partial', 'missing', 'conflicting']),
  buttonLabel: z.string().min(1),
  pinLabel: z.string().min(1),
  icon: z.string().min(1),
  tone: z.enum(['valid', 'partial', 'missing', 'conflict']),
  lead: z.string().min(1),
  body: z.string().min(1),
  emphasis: z.string().optional(),
  actionLabel: z.string().min(1),
  details: z.array(
    z.object({
      label: z.string().min(1),
      value: z.string().min(1),
    }),
  ),
});

const homeSchema = z.object({
  overview: z.object({
    kicker: z.string().min(1),
    heading: z.string().min(1),
    paragraphs: z.array(z.string().min(1)).min(1),
  }),
  demo: z.object({
    imageUrl: z.string().min(1),
    imageAlt: z.string().min(1),
    meta: z.string().min(1),
    caption: z.string().min(1),
    states: z.array(provenanceStateSchema).min(1),
  }),
  pipeline: z.object({
    ariaLabel: z.string().min(1),
    leftHeading: z.string().min(1),
    rightHeading: z.string().min(1),
    stages: z.array(
      z.object({
        number: z.number().int().positive(),
        title: z.string().min(1),
        description: z.string().min(1),
        lastMile: z.boolean(),
      }),
    ),
    summaryPrefix: z.string().min(1),
  }),
  findings: z.array(
    z.object({
      title: z.string().min(1),
      body: z.string().min(1),
    }),
  ),
  gallery: z.object({
    kicker: z.string().min(1),
    heading: z.string().min(1),
    lede: z.string().min(1),
    scenarios: z.array(
      z.object({
        id: z.enum(['social', 'messaging', 'news', 'factcheck']),
        title: z.string().min(1),
        description: z.string().min(1),
      }),
    ),
    figures: z.array(
      z.object({
        src: z.string().min(1),
        label: z.string().min(1),
        caption: z.string().min(1),
        alt: z.string().min(1),
      }),
    ),
  }),
  questions: z.object({
    kicker: z.string().min(1),
    heading: z.string().min(1),
    lede: z.string().min(1),
    items: z.array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        question: z.string().min(1),
      }),
    ),
    privacyCallout: z.object({
      lead: z.string().min(1),
      body: z.string().min(1),
    }),
    outcomesHeading: z.string().min(1),
    outcomes: z.array(z.string().min(1)),
  }),
});

const cfpSchema = z.object({
  kicker: z.string().min(1),
  heading: z.string().min(1),
  lede: z.string().min(1),
  formatsHeading: z.string().min(1),
  formats: z.array(
    z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
  ),
  templateNote: z.object({
    prefix: z.string(),
    linkText: z.string().min(1),
    linkUrl: z.string().url(),
    suffix: z.string(),
  }),
  topicsHeading: z.string().min(1),
  topics: z.array(z.string().min(1)),
  reviewPolicy: z.string().min(1),
  datesHeading: z.string().min(1),
  datesTimezoneNote: z.string().min(1),
  dates: z.array(
    z.object({
      label: z.string().min(1),
      date: z.string().min(1),
      tba: z.boolean().default(false),
    }),
  ),
  submission: z.object({
    status: z.enum(['coming_soon', 'external_link', 'embed']),
    heading: z.string().min(1),
    description: z.string().min(1),
    buttonLabel: z.string().min(1),
    externalUrl: z.string().default(''),
    embedUrl: z.string().default(''),
    embedTitle: z.string().default('Workshop Submission Form'),
    embedHeight: z.number().int().positive().default(760),
  }),
  acceptedPapers: z.object({
    published: z.boolean(),
    heading: z.string().min(1),
    intro: z.string().min(1),
    papers: z.array(
      z.object({
        title: z.string().min(1),
        authors: z.string().min(1),
        type: z.string().optional(),
        pdfUrl: z.string().optional(),
      }),
    ),
  }),
});

const programmeSchema = z.object({
  kicker: z.string().min(1),
  heading: z.string().min(1),
  lede: z.string().min(1),
  scheduleHeading: z.string().min(1),
  schedule: z.array(
    z.object({
      time: z.string().min(1),
      title: z.string().min(1),
      badge: z.string().optional(),
      output: z.string().min(1),
      kind: z.enum(['session', 'activity', 'break']),
    }),
  ),
  speakersHeading: z.string().min(1),
  speakersIntro: z.string().min(1),
  speakers: z.array(
    z.object({
      slot: z.string().min(1),
      theme: z.string().min(1),
      name: z.string().min(1),
      affiliation: z.string().min(1),
      bio: z.string().optional(),
      url: z.string().optional(),
      tba: z.boolean().default(false),
    }),
  ),
  activitiesHeading: z.string().min(1),
  activitiesIntro: z.string().min(1),
  activities: z.array(
    z.object({
      letter: z.string().min(1),
      title: z.string().min(1),
      description: z.string().min(1),
      output: z.string().min(1),
      visual: z.enum(['none', 'ladder', 'dimensions']),
      ladderRows: z.array(z.string()).optional(),
      dimensions: z
        .array(
          z.object({
            label: z.string().min(1),
            crossCutting: z.boolean(),
          }),
        )
        .optional(),
    }),
  ),
});

const organizersSchema = z.object({
  kicker: z.string().min(1),
  heading: z.string().min(1),
  lede: z.string().min(1),
  people: z.array(
    z.object({
      name: z.string().min(1),
      affiliation: z.string().min(1),
      role: z.string().min(1),
      committee: z.string().min(1),
      lead: z.boolean().default(false),
      photo: z.string().optional(),
      website: z.string().url().optional(),
    }),
  ),
});

const venueResourcesSchema = z.object({
  kicker: z.string().min(1),
  heading: z.string().min(1),
  lede: z.string().min(1),
  venue: z.object({
    kicker: z.string().min(1),
    heading: z.string().min(1),
    photoUrl: z.string().min(1),
    photoAlt: z.string().min(1),
    photoCredit: z.string().min(1),
    paragraphs: z.array(z.string().min(1)),
    accessibilityHeading: z.string().min(1),
    accessibilityItems: z.array(z.string().min(1)),
  }),
  resources: z.object({
    kicker: z.string().min(1),
    heading: z.string().min(1),
    readings: z.array(
      z.object({
        title: z.string().min(1),
        citation: z.string().min(1),
        url: z.string().url().optional(),
      }),
    ),
    relatedVenuesHeading: z.string().min(1),
    relatedVenues: z.array(
      z.object({
        label: z.string().min(1),
        url: z.string().url(),
      }),
    ),
  }),
});

const contactSchema = z.object({
  kicker: z.string().min(1),
  heading: z.string().min(1),
  lede: z.string().min(1),
  topics: z.array(z.string().min(1)).min(1),
  sidebar: z.object({
    forwardingHeading: z.string().min(1),
    forwardingBody: z.string().min(1),
    directHeading: z.string().min(1),
    directBody: z.string().min(1),
    privacyNote: z.string().min(1),
  }),
});

export const siteData = parseYaml(siteRaw, siteSchema, 'site.yaml');
export const homeData = parseYaml(homeRaw, homeSchema, 'home.yaml');
export const cfpData = parseYaml(cfpRaw, cfpSchema, 'cfp.yaml');
export const programmeData = parseYaml(programmeRaw, programmeSchema, 'programme.yaml');
export const organizersData = parseYaml(organizersRaw, organizersSchema, 'organizers.yaml');
export const venueResourcesData = parseYaml(
  venueResourcesRaw,
  venueResourcesSchema,
  'venue-resources.yaml',
);
export const contactData = parseYaml(contactRaw, contactSchema, 'contact.yaml');

export type SiteData = z.infer<typeof siteSchema>;
export type HomeData = z.infer<typeof homeSchema>;
export type ProvenanceState = z.infer<typeof provenanceStateSchema>;
export type CfpData = z.infer<typeof cfpSchema>;
export type ProgrammeData = z.infer<typeof programmeSchema>;
export type OrganizersData = z.infer<typeof organizersSchema>;
export type OrganizerPerson = OrganizersData['people'][number];
export type VenueResourcesData = z.infer<typeof venueResourcesSchema>;
export type ContactData = z.infer<typeof contactSchema>;

/**
 * Safely renders lightweight inline emphasis (**bold**, *italic*) from YAML strings
 * into HTML while escaping raw HTML characters first.
 */
export function renderInlineMarkdown(text: string): string {
  const escaped = text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
  return escaped
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

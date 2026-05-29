export interface SearchFocusOption {
  id: string;
  label: string;
  /** Pre-filled keyword phrases for job board search */
  defaultQueries: string[];
  /** Broader queries used when the first wave returns too few jobs */
  widenQueries: string[];
  /** Extra guidance for the OpenAI scoring rubric */
  scoringContext: string;
}

export const DEFAULT_SEARCH_FOCUS = 'auto';

export const SEARCH_FOCUS_OPTIONS: SearchFocusOption[] = [
  {
    id: 'auto',
    label: 'Match my resume (recommended)',
    defaultQueries: [],
    widenQueries: [],
    scoringContext:
      'Infer the candidate’s target roles from their resume. Score resume fit against transferable skills, seniority, tools, and domain experience — not only sales.',
  },
  {
    id: 'sales',
    label: 'Sales & business development',
    defaultQueries: [
      'sales development representative',
      'business development representative',
      'account executive',
      'inside sales',
    ],
    widenQueries: ['B2B sales', 'SaaS sales', 'business development', 'sales representative'],
    scoringContext:
      'Prioritize prospecting, pipeline, quota, CRM, B2B, and customer-facing sales experience.',
  },
  {
    id: 'software',
    label: 'Software & engineering',
    defaultQueries: [
      'software engineer',
      'full stack developer',
      'backend developer',
      'frontend developer',
    ],
    widenQueries: ['web developer', 'software developer', 'devops engineer', 'data engineer'],
    scoringContext:
      'Prioritize programming languages, frameworks, system design, shipping code, and engineering practices from the resume.',
  },
  {
    id: 'marketing',
    label: 'Marketing & growth',
    defaultQueries: [
      'digital marketing',
      'content marketing',
      'growth marketing',
      'marketing coordinator',
    ],
    widenQueries: ['social media manager', 'SEO specialist', 'brand marketing', 'product marketing'],
    scoringContext:
      'Prioritize campaigns, analytics, content, brand, demand gen, and channel experience.',
  },
  {
    id: 'finance',
    label: 'Finance & accounting',
    defaultQueries: [
      'financial analyst',
      'accountant',
      'bookkeeper',
      'accounts payable',
    ],
    widenQueries: ['finance associate', 'staff accountant', 'payroll specialist', 'controller'],
    scoringContext:
      'Prioritize accounting standards, modeling, reconciliation, ERP, and compliance experience.',
  },
  {
    id: 'healthcare',
    label: 'Healthcare & clinical',
    defaultQueries: [
      'registered nurse',
      'medical assistant',
      'healthcare administrator',
      'clinical coordinator',
    ],
    widenQueries: ['patient care', 'pharmacy technician', 'dental assistant', 'healthcare support'],
    scoringContext:
      'Prioritize licenses, certifications, patient care, clinical workflows, and healthcare compliance.',
  },
  {
    id: 'operations',
    label: 'Operations & logistics',
    defaultQueries: [
      'operations coordinator',
      'supply chain',
      'logistics coordinator',
      'warehouse supervisor',
    ],
    widenQueries: ['operations manager', 'inventory analyst', 'procurement', 'distribution'],
    scoringContext:
      'Prioritize process improvement, inventory, scheduling, vendor management, and KPI ownership.',
  },
  {
    id: 'customer_success',
    label: 'Customer success & support',
    defaultQueries: [
      'customer success manager',
      'customer support',
      'technical support',
      'client services',
    ],
    widenQueries: ['help desk', 'customer experience', 'account coordinator', 'support specialist'],
    scoringContext:
      'Prioritize retention, onboarding, ticket resolution, product knowledge, and client relationship skills.',
  },
  {
    id: 'design',
    label: 'Design & creative',
    defaultQueries: [
      'UX designer',
      'graphic designer',
      'product designer',
      'visual designer',
    ],
    widenQueries: ['UI designer', 'creative director', 'motion designer', 'web designer'],
    scoringContext:
      'Prioritize portfolio skills, design systems, user research, and creative tooling.',
  },
  {
    id: 'hr',
    label: 'Human resources',
    defaultQueries: [
      'human resources coordinator',
      'recruiter',
      'talent acquisition',
      'HR generalist',
    ],
    widenQueries: ['people operations', 'HR assistant', 'compensation analyst', 'HR business partner'],
    scoringContext:
      'Prioritize recruiting, employee relations, HRIS, compliance, and people programs.',
  },
  {
    id: 'legal',
    label: 'Legal & compliance',
    defaultQueries: [
      'paralegal',
      'legal assistant',
      'compliance analyst',
      'contract administrator',
    ],
    widenQueries: ['legal coordinator', 'regulatory compliance', 'corporate counsel', 'legal operations'],
    scoringContext:
      'Prioritize legal research, contracts, regulatory knowledge, and attention to detail.',
  },
  {
    id: 'education',
    label: 'Education & training',
    defaultQueries: [
      'teacher',
      'instructor',
      'training coordinator',
      'education specialist',
    ],
    widenQueries: ['tutor', 'curriculum developer', 'academic advisor', 'learning and development'],
    scoringContext:
      'Prioritize teaching, curriculum, facilitation, and learner outcomes.',
  },
  {
    id: 'trades',
    label: 'Skilled trades & technicians',
    defaultQueries: [
      'electrician',
      'HVAC technician',
      'maintenance technician',
      'mechanic',
    ],
    widenQueries: ['plumber', 'carpenter', 'field technician', 'industrial mechanic'],
    scoringContext:
      'Prioritize certifications, safety, hands-on repair/install experience, and trade licenses.',
  },
  {
    id: 'general',
    label: 'General / other',
    defaultQueries: ['specialist', 'coordinator', 'associate', 'analyst'],
    widenQueries: ['administrative assistant', 'project coordinator', 'generalist', 'team lead'],
    scoringContext:
      'Score broadly on transferable skills, seniority alignment, and role responsibilities vs resume evidence.',
  },
];

const byId = new Map(SEARCH_FOCUS_OPTIONS.map((o) => [o.id, o]));

export function getSearchFocus(id: string | null | undefined): SearchFocusOption {
  return byId.get(id || DEFAULT_SEARCH_FOCUS) ?? byId.get(DEFAULT_SEARCH_FOCUS)!;
}

export function resolveSearchQueries(
  focusId: string | null | undefined,
  userQueries: string[],
  inferredQueries?: string[],
): { queries: string[]; widenQueries: string[] } {
  const focus = getSearchFocus(focusId);
  const trimmed = userQueries.map((q) => q.trim()).filter(Boolean);

  if (focusId === 'auto') {
    const queries =
      trimmed.length > 0
        ? trimmed
        : inferredQueries?.length
          ? inferredQueries
          : getSearchFocus('general').defaultQueries;
    // Widen with a few non-overlapping fallbacks only — not the full general list.
    const widenPool =
      inferredQueries?.length && !trimmed.length
        ? [...inferredQueries.slice(0, 2), ...getSearchFocus('general').widenQueries]
        : focus.widenQueries.length
          ? focus.widenQueries
          : getSearchFocus('general').widenQueries;
    const primaryKeys = new Set(queries.map((q) => q.toLowerCase()));
    const widen = widenPool.filter((q) => !primaryKeys.has(q.toLowerCase()));
    return { queries, widenQueries: [...new Set(widen)] };
  }

  return {
    queries: trimmed.length ? trimmed : focus.defaultQueries,
    widenQueries: focus.widenQueries,
  };
}

export function isValidSearchFocus(id: string): boolean {
  return byId.has(id);
}

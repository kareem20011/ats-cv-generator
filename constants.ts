
export const SECTIONS = {
  PERSONAL: 'personal',
  SUMMARY: 'summary',
  SKILLS: 'skills',
  EXPERIENCE: 'experience',
  PROJECTS: 'projects',
  EDUCATION: 'education',
  CERTIFICATIONS: 'certifications',
} as const;

export const SECTION_LABELS: Record<string, string> = {
  [SECTIONS.PERSONAL]: 'Personal Info',
  [SECTIONS.SUMMARY]: 'Professional Summary',
  [SECTIONS.SKILLS]: 'Skills & Competencies',
  [SECTIONS.EXPERIENCE]: 'Work Experience',
  [SECTIONS.PROJECTS]: 'Key Projects',
  [SECTIONS.EDUCATION]: 'Education',
  [SECTIONS.CERTIFICATIONS]: 'Certifications',
};

export const DEFAULT_ORDER = [
  SECTIONS.PERSONAL,
  SECTIONS.SUMMARY,
  SECTIONS.SKILLS,
  SECTIONS.EXPERIENCE,
  SECTIONS.PROJECTS,
  SECTIONS.EDUCATION,
  SECTIONS.CERTIFICATIONS,
];

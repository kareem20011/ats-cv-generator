
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string[];
}

export interface Project {
  id: string;
  name: string;
  role: string;
  link?: string;
  description: string[];
  techStack: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  graduationDate: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface SkillGroup {
  id: string;
  category: string;
  skills: string[];
}

export interface CVData {
  personalInfo: PersonalInfo;
  professionalTitle: string;
  experiences: Experience[];
  education: Education[];
  skillGroups: SkillGroup[];
  projects: Project[];
  certifications: Certification[];
}

export interface CVVersion {
  id: string;
  name: string;
  lastModified: number;
  data: CVData;
  summary: string;
  sectionOrder: string[];
  hiddenSections: string[];
}

export interface JDAnalysis {
  keywords: {
    skills: string[];
    tools: string[];
    responsibilities: string[];
  };
  gaps: string[];
  matchScore: number;
  suggestions: string;
}

export type ResumeTemplateId =
  | "shawn-blue-sidebar"
  | "pedro-blue-header"
  | "francisco-blue-corporate"
  | "adam-ats"
  | "emaa-accounting"
  | "daniel-ats"
  | "olivia-student";

export type TemplateCategory =
  | "ATS"
  | "Professional"
  | "Creative"
  | "Student"
  | "Infographic";

export type ResumeSectionId =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "languages"
  | "projects"
  | "certifications"
  | "achievements"
  | "volunteer"
  | "references"
  | "additional"
  | "contact";

export type ResumeFont =
  | "Arial"
  | "Inter"
  | "Roboto"
  | "Calibri"
  | "Times New Roman"
  | "Georgia"
  | "Helvetica"
  | "Poppins"
  | "Lato"
  | "Montserrat";

export type ResumeTextAlign =
  | "left"
  | "center"
  | "right"
  | "justify";

export type ResumeBulletStyle =
  | "disc"
  | "circle"
  | "square"
  | "dash"
  | "arrow"
  | "none";

export type ResumePhotoShape =
  | "circle"
  | "square"
  | "rounded"
  | "none";

export interface ResumeContact {
  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
  website?: string;
}

export interface ResumeExperience {
  id?: string;
  company?: string;
  role?: string;
  title?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  bullets?: string[];
  current?: boolean;
}

export interface ResumeEducation {
  id?: string;
  institution?: string;
  school?: string;
  degree?: string;
  field?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
  grade?: string;
}

export interface ResumeSkill {
  id?: string;
  name: string;
  level?: number;
  category?: string;
}

export interface ResumeLanguage {
  id?: string;
  name: string;
  level?: string;
}

export interface ResumeProject {
  id?: string;
  name?: string;
  description?: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeCertification {
  id?: string;
  name?: string;
  issuer?: string;
  date?: string;
  url?: string;
}

export interface ResumeAchievement {
  id?: string;
  title?: string;
  description?: string;
  date?: string;
}

export interface ResumeVolunteer {
  id?: string;
  organization?: string;
  role?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
}

export interface ResumeReference {
  id?: string;
  name?: string;
  role?: string;
  company?: string;
  phone?: string;
  email?: string;
}

export interface ResumeData {
  id?: string;

  fullName?: string;
  firstName?: string;
  lastName?: string;

  jobTitle?: string;
  headline?: string;

  profilePhoto?: string | null;

  summary?: string;

  contact?: ResumeContact;

  email?: string;
  phone?: string;
  address?: string;
  linkedin?: string;
  portfolio?: string;
  github?: string;
  website?: string;

  experience?: ResumeExperience[];
  education?: ResumeEducation[];
  skills?: ResumeSkill[] | string[];
  languages?: ResumeLanguage[] | string[];
  projects?: ResumeProject[];
  certifications?: ResumeCertification[];
  achievements?: ResumeAchievement[];
  volunteer?: ResumeVolunteer[];
  references?: ResumeReference[];

  additionalInformation?: string[];

  sectionOrder?: ResumeSectionId[];
}

export interface ResumeColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  mutedText: string;
  background: string;
  sidebar: string;
  sidebarText: string;
  divider: string;
  cardBackground: string;
}

export interface ResumeTypography {
  fontFamily: ResumeFont;
  bodySize: number;
  nameSize: number;
  jobTitleSize: number;
  sectionTitleSize: number;
  headingSize: number;
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  nameWeight: number;
  headingWeight: number;
  bodyWeight: number;
  uppercaseSectionTitles: boolean;
}

export interface ResumeSpacing {
  pageMarginTop: number;
  pageMarginRight: number;
  pageMarginBottom: number;
  pageMarginLeft: number;

  sectionGap: number;
  headingGap: number;
  itemGap: number;
  bulletGap: number;
  contentGap: number;
  columnGap: number;
}

export interface ResumeLayout {
  columns: 1 | 2;
  sidebar?: "left" | "right" | "none";
  sidebarWidth?: number;

  header?: "none" | "simple" | "blue" | "colored";
  headerHeight?: number;

  nameAlignment?: ResumeTextAlign;
  bodyAlignment?: ResumeTextAlign;

  photo?: boolean;
  photoPosition?: "sidebar" | "header" | "content";
  photoShape?: ResumePhotoShape;
  photoSize?: number;

  sectionDividers?: boolean;
  sectionDividerStyle?: "line" | "bar" | "accent" | "none";

  bullets?: ResumeBulletStyle;

  dates?: "inline" | "right" | "left" | "block";

  skillDisplay?: "text" | "bars" | "stars" | "percentage" | "tags";

  compact?: boolean;
}

export interface ResumeTemplate {
  id: ResumeTemplateId;

  name: string;

  description: string;

  category: TemplateCategory;

  sourcePdf: string;

  previewLabel: string;

  colors: ResumeColorPalette;

  typography: ResumeTypography;

  spacing: ResumeSpacing;

  layout: ResumeLayout;

  sections: ResumeSectionId[];

  supportsPhoto: boolean;

  supportsTwoPages: boolean;

  atsFriendly: boolean;

  aiRecommended?: boolean;
}

export interface ResumeDesign {
  templateId: ResumeTemplateId;

  colors: ResumeColorPalette;

  typography: ResumeTypography;

  spacing: ResumeSpacing;

  layout: ResumeLayout;

  customCss?: string;
}

export interface ResumeDraft {
  id?: string;

  name?: string;

  data: ResumeData;

  design: ResumeDesign;

  selectedTemplateId: ResumeTemplateId;

  updatedAt?: string;

  createdAt?: string;

  lastEditedSection?: ResumeSectionId;

  completionPercentage?: number;
}
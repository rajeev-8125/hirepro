export type ResumeTemplateId =
  | "blue-01"
  | "blue-02"
  | "blue-03"
  | "blue-04"
  | "student"
  | "infographic-01"
  | "infographic-02";

export type ResumeAiTemplate =
  | "ats"
  | "professional"
  | "modern"
  | "executive";

export type ResumeTemplateCategory =
  | "ats"
  | "professional"
  | "student"
  | "creative";

export type ResumeTemplateDefinition = {
  id: ResumeTemplateId;
  name: string;
  shortName: string;
  description: string;
  category: ResumeTemplateCategory;
  aiTemplate: ResumeAiTemplate;
  referencePdf: string;
  previewImage: string;
  accent: string;
  background: string;
  layout: "single" | "split" | "sidebar";
  photo: boolean;
};

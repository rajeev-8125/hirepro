"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import {
  Award,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  Download,
  FileText,
  FolderKanban,
  GraduationCap,
  Image as ImageIcon,
  Languages,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
  Wand2,
  X,
  LayoutTemplate,
  Palette,
  SlidersHorizontal,
  Save,
  Upload,
  History,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

import type { ResumeData } from "@/lib/ai/resume-schema";
import type { ResumeDesign } from "@/lib/ai/resume-design-schema";
import LiveResumePreview from "@/components/resume/LiveResumePreview";
import TemplateGallery from "@/components/resume/TemplateGallery";
import ResumePreviewStudio from "@/components/resume/ResumePreviewStudio";
import AIResumeCoach from "@/components/resume/AIResumeCoach";
import {
  RESUME_TEMPLATES,
  getAiTemplate,
  getTemplateDesign,
  getTemplateDefinition,
} from "@/lib/resume/template-library";
import type { ResumeTemplateId } from "@/lib/resume/template-types";
import {
  getCustomDesign,
  getDefaultCustomDesign,
} from "@/lib/resume/design-utils";

import { createClient } from "@/lib/supabase/client";

type TemplateType = ResumeTemplateId;

type SectionName =
  | "personal"
  | "summary"
  | "skills"
  | "experience"
  | "education"
  | "projects"
  | "certifications"
  | "achievements"
  | "languages";

function emptyResume(): ResumeData {
  return {
    personal: {
      name: "",
      email: "",
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      website: "",
    },

    professionalSummary: "",

    skills: [],

    experience: [],

    education: [],

    projects: [],

    certifications: [],

    achievements: [],

    languages: [],

    additionalSections: [],
  };
}

const DEMO_RESUME: ResumeData = {
  personal: {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (123) 456-7890",
    location: "New York, NY 10001",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe",
    website: "johndoportfolio.com",
  },
  professionalSummary:
    "Highly accomplished Staff Software Engineer with over 8 years of experience designing, developing, and deploying robust, scalable web applications and distributed systems. Proven expertise in leading high-impact cross-functional teams and delivering innovative products used by millions of users. Proficient in modern JavaScript, TypeScript, React, Node.js, Python, AWS, and PostgreSQL.",
  skills: [
    { category: "Programming", items: ["JavaScript", "TypeScript", "Python", "Java"] },
    { category: "Frontend", items: ["React", "Next.js", "HTML", "CSS"] },
    { category: "Backend", items: ["Node.js", "REST APIs", "PostgreSQL", "GraphQL"] },
    { category: "Cloud", items: ["AWS", "Docker", "CI/CD"] },
  ],
  experience: [
    {
      company: "Meta Platforms",
      role: "Staff Software Engineer",
      location: "New York, NY",
      startDate: "Mar 2022",
      endDate: "Present",
      responsibilities: [
        "Led architecture and full-cycle development of scalable real-time applications serving high-volume users.",
        "Improved application performance through code splitting, caching, and API optimization.",
        "Mentored engineers and partnered with product teams to deliver strategic technical initiatives.",
      ],
    },
    {
      company: "Tech Solutions Inc.",
      role: "Senior Software Engineer",
      location: "New York, NY",
      startDate: "Jun 2019",
      endDate: "Feb 2022",
      responsibilities: [
        "Built responsive web applications and REST APIs using React, Node.js, and PostgreSQL.",
        "Introduced automated testing and CI/CD practices that improved release reliability.",
      ],
    },
  ],
  education: [
    {
      institution: "University of Technology",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2014",
      endDate: "2018",
      details: ["Software Engineering", "Distributed Systems"],
    },
  ],
  projects: [
    {
      name: "Real-Time Analytics Platform",
      description: "Designed a scalable analytics platform with a React dashboard, Node.js APIs, and PostgreSQL data services.",
      technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
      url: "",
    },
  ],
  certifications: [
    { name: "AWS Certified Developer", issuer: "Amazon Web Services", date: "2024", url: "" },
  ],
  achievements: [
    "Recognized for leading a cross-functional engineering initiative that improved platform reliability.",
  ],
  languages: ["English", "Spanish"],
  additionalSections: [],
};

/**
 * Each template starts with its own demonstration resume content.
 * This is presentation-only sample data. It is never saved to the
 * user's account unless the user explicitly edits/generates/saves it.
 * The content is based on the supplied template PDFs.
 */
const TEMPLATE_DEMO_RESUMES: Record<TemplateType, ResumeData> = {
  "blue-01": {
    personal: {
      name: "Charlotte Newman",
      email: "hello@reallygreatsite.com",
      phone: "+123-456-7890",
      location: "123 Anywhere St., Any City, ST 12345",
      linkedin: "linkedin.com/in/charlottenewman",
      github: "",
      website: "www.reallygreatsite.com",
    },
    professionalSummary:
      "Creative and detail-oriented graphic designer with over 5 years of experience creating visual solutions for brands and businesses. Passionate about transforming ideas into impactful designs while maintaining strong attention to detail and aesthetics.",
    skills: [
      { category: "Skills", items: ["Problem Solving", "Creative Thinking", "Adaptability", "Team Collaboration", "Time Management"] },
    ],
    experience: [
      {
        company: "Brightside Studio",
        role: "Senior Graphic Designer",
        location: "",
        startDate: "2024",
        endDate: "2026",
        responsibilities: [
          "Designed marketing materials for digital and print campaigns.",
          "Developed branding concepts for small and medium businesses.",
        ],
      },
      {
        company: "Visionary Studio",
        role: "Junior Graphic Designer",
        location: "",
        startDate: "2022",
        endDate: "2024",
        responsibilities: [
          "Assisted senior designers in creating advertising materials.",
          "Designed social media graphics and promotional content.",
        ],
      },
    ],
    education: [
      { institution: "University of Northvale", degree: "Bachelor of Business Management", field: "", startDate: "2018", endDate: "2022", details: [] },
      { institution: "University of Ashford Vale", degree: "Bachelor of Business Management", field: "", startDate: "2015", endDate: "2018", details: [] },
    ],
    projects: [],
    certifications: [],
    achievements: [],
    languages: ["English", "Indonesian"],
    additionalSections: [],
  },
  "blue-02": {
    personal: {
      name: "Shawn Garcia",
      email: "hello@reallygreatsite.com",
      phone: "+123-456-7890",
      location: "123 Anywhere St., Any City",
      linkedin: "linkedin.com/in/shawngarcia",
      github: "",
      website: "",
    },
    professionalSummary:
      "Passionate designer and illustrator with experience across books, magazines, documents, social media, web design and visual content creation.",
    skills: [
      { category: "Programs", items: ["Web Design", "Social Media Design", "Poster Design", "Mobile App Design", "Content Creation"] },
    ],
    experience: [
      {
        company: "Content Company, S.L.",
        role: "Content Creator",
        location: "",
        startDate: "September 2019",
        endDate: "June 2021",
        responsibilities: ["Social media management and design.", "Web design.", "Design of posters, flyers and visual materials.", "Mobile app design."],
      },
      {
        company: "Networking Company, S.L.",
        role: "Social Media Manager",
        location: "",
        startDate: "January 2017",
        endDate: "April 2019",
        responsibilities: ["Website and social media maintenance.", "Creation of banners and graphic content.", "Writing content for blogs."],
      },
    ],
    education: [
      { institution: "University of the Sea", degree: "Graphic Arts Studies", field: "", startDate: "September 2017", endDate: "2021", details: [] },
      { institution: "San Juan Study Center", degree: "Animation Studies", field: "", startDate: "September 2015", endDate: "July 2017", details: [] },
      { institution: "University of the Sun", degree: "Master's Degree in Graphic Arts", field: "", startDate: "", endDate: "Current", details: [] },
    ],
    projects: [],
    certifications: [],
    achievements: [],
    languages: ["Spanish — High level", "English — Native"],
    additionalSections: [],
  },
  "blue-03": {
    personal: {
      name: "Francisco Andrade",
      email: "hello@reallygreatsite.com",
      phone: "+123-456-7890",
      location: "123 Anywhere St., Any City",
      linkedin: "linkedin.com/in/franciscoandrade",
      github: "",
      website: "",
    },
    professionalSummary:
      "Marketing professional with a strong foundation in project management, public relations, teamwork, leadership and effective communication.",
    skills: [
      { category: "Professional Skills", items: ["Project Management", "Public Relations", "Teamwork", "Time Management", "Leadership", "Effective Communication", "Critical Thinking"] },
    ],
    experience: [
      {
        company: "Really Great Industries",
        role: "Marketing Manager",
        location: "",
        startDate: "2020",
        endDate: "2023",
        responsibilities: ["Managed marketing activities and coordinated cross-functional initiatives.", "Developed communication materials and supported business growth programs."],
      },
      {
        company: "Really Great Industries",
        role: "Marketing Manager",
        location: "",
        startDate: "2017",
        endDate: "2019",
        responsibilities: ["Supported marketing campaigns and maintained strong stakeholder communication."],
      },
      {
        company: "Really Great Industries",
        role: "Marketing Manager",
        location: "",
        startDate: "2019",
        endDate: "2020",
        responsibilities: ["Coordinated marketing projects and prepared campaign content."],
      },
    ],
    education: [
      { institution: "Borcelle Business School", degree: "Bachelor of Business Management", field: "", startDate: "2020", endDate: "2023", details: [] },
      { institution: "Borcelle Business School", degree: "Bachelor of Business Management", field: "", startDate: "2016", endDate: "2020", details: [] },
    ],
    projects: [],
    certifications: [],
    achievements: [],
    languages: ["English", "French", "Spanish"],
    additionalSections: [],
  },
  "blue-04": {
    personal: {
      name: "Pedro Fernandes",
      email: "hello@reallygreatsite.com",
      phone: "+123-456-7890",
      location: "123 Anywhere St., Any City",
      linkedin: "linkedin.com/in/pedrofernandes",
      github: "",
      website: "www.reallygreatsite.com",
    },
    professionalSummary:
      "Marketing Manager with experience in graphic design, copywriting, project management and digital marketing. Focused on clear communication and practical business outcomes.",
    skills: [
      { category: "Skills Summary", items: ["Management Skills", "Digital Marketing", "Critical Thinking", "Project Management", "Graphic Design", "Copywriting"] },
    ],
    experience: [
      { company: "Fradel and Spies", role: "Marketing Manager", location: "", startDate: "2020", endDate: "2022", responsibilities: ["Managed marketing activities and coordinated campaign delivery."] },
      { company: "Aldenaire & Partners", role: "Marketing Manager", location: "", startDate: "2015", endDate: "2020", responsibilities: ["Supported marketing projects and communication activities."] },
      { company: "Ingoude Company", role: "Marketing Manager", location: "", startDate: "2012", endDate: "2015", responsibilities: ["Supported marketing and creative initiatives."] },
    ],
    education: [
      { institution: "Borcelle University", degree: "Bachelor of Business Management", field: "", startDate: "2014", endDate: "2023", details: [] },
      { institution: "Borcelle University", degree: "Master of Business Management", field: "", startDate: "2014", endDate: "2018", details: [] },
    ],
    projects: [],
    certifications: [],
    achievements: [],
    languages: ["English", "Spanish", "Germany — Basic"],
    additionalSections: [],
  },
  student: {
    personal: {
      name: "Olivia Wilson",
      email: "hello@reallygreatsite.com",
      phone: "(123) 456-7890",
      location: "123 Anywhere St., Any City, State, Country 12345",
      linkedin: "linkedin.com/in/oliviawilson",
      github: "",
      website: "",
    },
    professionalSummary:
      "Business Administration student. I consider myself a responsible and orderly person and I am looking forward to my first work experience.",
    skills: [{ category: "Computer Skills", items: ["Text processor", "Spreadsheet", "Slide presentation"] }],
    experience: [],
    education: [{ institution: "Milemora University", degree: "Business Administration", field: "", startDate: "", endDate: "In progress", details: [] }, { institution: "Brayershire College", degree: "Business Administration", field: "", startDate: "2020", endDate: "2024", details: [] }],
    projects: [],
    certifications: [],
    achievements: [],
    languages: ["Native English", "Advanced Spanish"],
    additionalSections: [{ title: "Volunteer Experience", items: ["Velveral Foods Inc. — Participation in collections to distribute in low-income schools."] }],
  },
  "infographic-01": {
    personal: { name: "Adam Fletcher", email: "hello@reallygreatsite.com", phone: "", location: "123 Anywhere St., Any City", linkedin: "linkedin.com/in/adamfletcher", github: "", website: "www.reallygreatsite.com" },
    professionalSummary: "Results-driven Digital Marketer with expertise in SEO, paid media and content strategy. Proven ability to grow brand awareness, drive qualified leads and optimize campaigns for maximum ROI.",
    skills: [{ category: "Professional Skills", items: ["SEO & SEM", "Content Marketing", "Social Media Strategy", "Email Marketing", "Web Analytics", "Paid Advertising"] }],
    experience: [
      { company: "Creative Agency", role: "Senior Digital Marketing Manager", location: "", startDate: "Jan 2023", endDate: "Present", responsibilities: ["Managed a $1.5M ad budget across various platforms, achieving 35% YoY growth.", "Executed content strategies that boosted organic traffic by 200% in a year.", "Led a team of 5 marketers, mentoring juniors and streamlining workflows."] },
      { company: "Digital Agency", role: "Digital Marketing Specialist", location: "", startDate: "Feb 2021", endDate: "Dec 2022", responsibilities: ["Executed social media campaigns, increasing followers by 80%.", "Enhanced email marketing funnels, raising open rates by 25% and conversion rates by 18%.", "Performed A/B testing on landing pages, boosting lead capture by 40%."] },
    ],
    education: [{ institution: "Business School", degree: "Master of Science in Digital Marketing", field: "Data-Driven Marketing and Consumer Behavior", startDate: "Aug 2016", endDate: "Oct 2019", details: ["Capstone project on AI-Powered Personalization in E-commerce Marketing"] }, { institution: "University of Southern California", degree: "Bachelor of Arts in Marketing & Communications", field: "Brand Management and Digital Analytics", startDate: "May 2014", endDate: "May 2016", details: [] }],
    projects: [],
    certifications: [{ name: "Search Ads Certified", issuer: "", date: "", url: "" }, { name: "Inbound Marketing Certified", issuer: "", date: "", url: "" }, { name: "Social Media Ads Certified", issuer: "", date: "", url: "" }],
    achievements: ["Brand Growth Campaign — increased brand awareness by 150% and generated 10,000+ qualified leads in 6 months.", "E-commerce Optimization — achieved a 4.5x return on ad spend and 60% increase in monthly revenue."],
    languages: ["English", "French", "Spanish"],
    additionalSections: [],
  },
  "infographic-02": {
    personal: { name: "Daniel Gallego", email: "hello@reallygreatsite.com", phone: "", location: "123 Anywhere St., Any City", linkedin: "linkedin.com/in/danielgallego", github: "", website: "www.reallygreatsite.com" },
    professionalSummary: "UX Designer focused on delivering impactful results, applying creativity to craft intuitive user experiences and using project management, user-centric problem-solving and collaboration to elevate user satisfaction.",
    skills: [{ category: "Technical Skills", items: ["Prototyping Tools", "User Research", "Information Architecture", "Interaction Design", "Visual Design", "Usability Heuristics", "Accessibility", "User Testing Tools"] }],
    experience: [
      { company: "XarrowAI Industries", role: "System UX Engineer", location: "", startDate: "Feb 2021", endDate: "Dec 2022", responsibilities: ["Designed and optimised a robotic control system, realizing a 12% performance improvement.", "Coordinated testing and validation, ensuring compliance with industry standards.", "Provided technical expertise, contributing to a 15% reduction in system failures."] },
      { company: "Morcelle Program", role: "UX Designer", location: "", startDate: "Jan 2023", endDate: "Present", responsibilities: ["Led development of an advanced automation system, achieving a 15% increase in operational efficiency.", "Streamlined manufacturing processes, reducing production costs by 10%.", "Implemented preventive maintenance strategies, resulting in a 20% decrease in equipment downtime."] },
    ],
    education: [{ institution: "Engineering University", degree: "Bachelor of Design in Process Engineering", field: "Structural Design and Project Management", startDate: "May 2014", endDate: "May 2016", details: [] }, { institution: "University of Engineering UX Cohort", degree: "UX Industrial Basics and General Application", field: "Automotive Technology", startDate: "Aug 2016", endDate: "Oct 2019", details: ["Thesis on Technological Advancements within the current Mechatronics Industry"] }],
    projects: [],
    certifications: [{ name: "Professional Design Engineer (PDE) License", issuer: "", date: "", url: "" }, { name: "Project Management Tech (PMT)", issuer: "", date: "", url: "" }],
    achievements: ["Most Innovative Employer of the Year (2021)", "Overall Best Employee Division Two (2024)", "Onboarding Project Lead (2023)"],
    languages: ["English", "French", "Mandarin"],
    additionalSections: [],
  },
};

function getTemplateDemoResume(template: TemplateType): ResumeData {
  return normalizeResume(TEMPLATE_DEMO_RESUMES[template] ?? DEMO_RESUME);
}


function normalizeResume(data: any): ResumeData {
  const empty = emptyResume();

  return {
    personal: {
      ...empty.personal,
      ...(data?.personal ?? {}),
    },

    professionalSummary:
      typeof data?.professionalSummary === "string"
        ? data.professionalSummary
        : "",

    skills: Array.isArray(data?.skills)
      ? data.skills.map((item: any) => ({
          category:
            typeof item?.category === "string"
              ? item.category
              : "",

          items: Array.isArray(item?.items)
            ? item.items.filter(
                (x: any) => typeof x === "string",
              )
            : [],
        }))
      : [],

    experience: Array.isArray(data?.experience)
      ? data.experience.map((item: any) => ({
          company:
            typeof item?.company === "string"
              ? item.company
              : "",

          role:
            typeof item?.role === "string"
              ? item.role
              : "",

          location:
            typeof item?.location === "string"
              ? item.location
              : "",

          startDate:
            typeof item?.startDate === "string"
              ? item.startDate
              : "",

          endDate:
            typeof item?.endDate === "string"
              ? item.endDate
              : "",

          responsibilities:
            Array.isArray(item?.responsibilities)
              ? item.responsibilities.filter(
                  (x: any) =>
                    typeof x === "string",
                )
              : [],
        }))
      : [],

    education: Array.isArray(data?.education)
      ? data.education.map((item: any) => ({
          institution:
            typeof item?.institution === "string"
              ? item.institution
              : "",

          degree:
            typeof item?.degree === "string"
              ? item.degree
              : "",

          field:
            typeof item?.field === "string"
              ? item.field
              : "",

          startDate:
            typeof item?.startDate === "string"
              ? item.startDate
              : "",

          endDate:
            typeof item?.endDate === "string"
              ? item.endDate
              : "",

          details:
            Array.isArray(item?.details)
              ? item.details.filter(
                  (x: any) =>
                    typeof x === "string",
                )
              : [],
        }))
      : [],

    projects: Array.isArray(data?.projects)
      ? data.projects.map((item: any) => ({
          name:
            typeof item?.name === "string"
              ? item.name
              : "",

          description:
            typeof item?.description === "string"
              ? item.description
              : "",

          technologies:
            Array.isArray(item?.technologies)
              ? item.technologies.filter(
                  (x: any) =>
                    typeof x === "string",
                )
              : [],

          url:
            typeof item?.url === "string"
              ? item.url
              : "",
        }))
      : [],

    certifications: Array.isArray(
      data?.certifications,
    )
      ? data.certifications.map((item: any) => ({
          name:
            typeof item?.name === "string"
              ? item.name
              : "",

          issuer:
            typeof item?.issuer === "string"
              ? item.issuer
              : "",

          date:
            typeof item?.date === "string"
              ? item.date
              : "",

          url:
            typeof item?.url === "string"
              ? item.url
              : "",
        }))
      : [],

    achievements: Array.isArray(data?.achievements)
      ? data.achievements.filter(
          (x: any) => typeof x === "string",
        )
      : [],

    languages: Array.isArray(data?.languages)
      ? data.languages.filter(
          (x: any) => typeof x === "string",
        )
      : [],

    additionalSections: Array.isArray(
      data?.additionalSections,
    )
      ? data.additionalSections.map((item: any) => ({
          title:
            typeof item?.title === "string"
              ? item.title
              : "",

          items:
            Array.isArray(item?.items)
              ? item.items.filter(
                  (x: any) =>
                    typeof x === "string",
                )
              : [],
        }))
      : [],
  };
}

function Input({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>

      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function SectionCard({
  icon,
  title,
  description,
  open,
  onToggle,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            {icon}
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              {title}
            </h2>

            <p className="text-xs text-slate-500">
              {description}
            </p>
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 text-slate-400 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="border-t border-slate-100 p-5">
          {children}
        </div>
      )}
    </section>
  );
}

function hasResumeContent(data: ResumeData | null | undefined) {
  if (!data) return false;
  return Boolean(
    data.personal?.name?.trim() ||
      data.personal?.email?.trim() ||
      data.professionalSummary?.trim() ||
      data.skills?.some((group) => group.items?.some(Boolean)) ||
      data.experience?.length ||
      data.education?.length ||
      data.projects?.length ||
      data.certifications?.length ||
      data.achievements?.length ||
      data.languages?.length,
  );
}

function getResumeReadiness(data: ResumeData) {
  const missing: string[] = [];
  let score = 0;
  const personal = data.personal ?? {};

  if (personal.name?.trim()) score += 10; else missing.push("Full name");
  if (personal.email?.trim()) score += 8; else missing.push("Email");
  if (personal.phone?.trim()) score += 5; else missing.push("Phone");
  if (personal.location?.trim()) score += 2;
  if (data.professionalSummary?.trim()) score += 15; else missing.push("Professional summary");

  const skillCount = (data.skills ?? []).reduce((total, group) => total + (group.items ?? []).filter(Boolean).length, 0);
  if (skillCount >= 6) score += 15;
  else if (skillCount >= 3) score += 10;
  else if (skillCount > 0) score += 5;
  else missing.push("Technical / professional skills");

  const experienceCount = (data.experience ?? []).filter((item) => item.company?.trim() || item.role?.trim() || item.responsibilities?.some(Boolean)).length;
  if (experienceCount >= 1) score += 20;
  else if ((data.projects ?? []).some((item) => item.name?.trim() || item.description?.trim())) score += 20;
  else missing.push("Experience or projects");

  if ((data.education ?? []).some((item) => item.institution?.trim() || item.degree?.trim() || item.field?.trim())) score += 10;
  else missing.push("Education");

  const projectCount = (data.projects ?? []).filter((item) => item.name?.trim() || item.description?.trim()).length;
  if (projectCount >= 2) score += 10;
  else if (projectCount === 1) score += 6;
  else if (experienceCount >= 1) score += 4;
  else missing.push("Projects");

  if ((data.certifications ?? []).some((item) => item.name?.trim()) || (data.achievements ?? []).some(Boolean) || (data.languages ?? []).some(Boolean)) score += 5;
  else missing.push("Certifications, achievements or languages");

  const links = [personal.linkedin, personal.github, personal.website].filter((value) => value?.trim()).length;
  if (links >= 2) score += 5;
  else if (links === 1) score += 3;
  else missing.push("Professional links");

  const finalScore = Math.min(100, Math.max(0, score));
  let label = "Getting started";
  if (finalScore >= 90) label = "Excellent";
  else if (finalScore >= 75) label = "Strong";
  else if (finalScore >= 55) label = "Good progress";

  return { score: finalScore, label, missing: missing.slice(0, 3) };
}

export default function ResumeBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const requestedResumeId = searchParams.get("resumeId");
  const isNewResumeMode = searchParams.get("new") === "1";
  const isResumeStartChooser = !requestedResumeId && !isNewResumeMode;

  const [resume, setResume] =
    useState<ResumeData>(DEMO_RESUME);

  const [design, setDesign] =
    useState<ResumeDesign | null>(() => ({
      ...getTemplateDesign("blue-02"),
      colors: {
        ...getTemplateDesign("blue-02").colors,
        primary: "#D4A017",
        secondary: "#D4A017",
        text: "#172033",
        mutedText: "#64748B",
        background: "#FFFFFF",
      },
      custom: {
        ...getDefaultCustomDesign("blue-02"),
        primaryColor: "#D4A017",
        secondaryColor: "#D4A017",
        textColor: "#172033",
        mutedColor: "#64748B",
        backgroundColor: "#FFFFFF",
        borderColor: "#D7DEE8",
        headingFont: "Arial",
        bodyFont: "Arial",
        headingSizePx: 14,
        bodySizePx: 10,
        lineHeight: 1.42,
        sectionGapPx: 15,
        itemGapPx: 7,
        pageMarginPx: 34,
        headingCase: "uppercase",
        headingWeight: 700,
      },
    }));

  const [isHydrated, setIsHydrated] =
    useState(false);

  const [currentUserId, setCurrentUserId] =
    useState<string | null>(null);

  const [resumeId, setResumeId] =
    useState<string | null>(null);

  const [hasSavedResume, setHasSavedResume] =
    useState(false);

  const [isSamplePreview, setIsSamplePreview] =
    useState(true);

  const [isSaving, setIsSaving] =
    useState(false);

  const [template, setTemplate] =
    useState<TemplateType>("blue-02");

  const [designDescription, setDesignDescription] =
    useState("");

  const [profilePhoto, setProfilePhoto] =
    useState<string | null>(null);

  const [profilePhotoFile, setProfilePhotoFile] =
    useState<File | null>(null);

  const [openSection, setOpenSection] =
    useState<SectionName>("personal");

  const [isHistoryOpen, setIsHistoryOpen] =
    useState(false);

  const [historyItems, setHistoryItems] =
    useState<
      Array<{
        id: string;
        version_number: number;
        version_name: string | null;
        template: string;
        created_at: string;
        resume_data: ResumeData;
        design_config: ResumeDesign;
      }>
    >([]);

  const [isHistoryLoading, setIsHistoryLoading] =
    useState(false);

  const [historyError, setHistoryError] =
    useState<string | null>(null);

  const [isRestoringVersion, setIsRestoringVersion] =
    useState(false);

  const [activeHistoryPreview, setActiveHistoryPreview] =
    useState<string | null>(null);

  const [activeTab, setActiveTab] =
    useState<"information" | "styling">("information");

  const [isCheckingAuth, setIsCheckingAuth] =
    useState(true);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isDownloading, setIsDownloading] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const photoInputRef =
    useRef<HTMLInputElement | null>(null);

  function isTemplateId(value: unknown): value is TemplateType {
    return RESUME_TEMPLATES.some((item) => item.id === value);
  }

  function selectTemplate(nextTemplate: TemplateType) {
    const nextDesign = getTemplateDesign(nextTemplate);
    const custom = getDefaultCustomDesign(nextTemplate);

    setTemplate(nextTemplate);
    setDesign({
      ...nextDesign,
      custom,
    });

    // New users see the actual selected template's sample resume.
    // Once they have started editing/importing, switching templates
    // keeps their information and changes only the design.
    if (isSamplePreview) {
      setResume(getTemplateDemoResume(nextTemplate));
    }
  }

  function updateCustomDesign(
    patch: Partial<ReturnType<typeof getCustomDesign>>,
  ) {
    setDesign((current) => {
      const base = current ?? getTemplateDesign(template);
      const custom = {
        ...getCustomDesign(base),
        ...patch,
      };

      return {
        ...base,
        colors: {
          ...base.colors,
          primary: custom.primaryColor,
          secondary: custom.secondaryColor,
          text: custom.textColor,
          mutedText: custom.mutedColor,
          background: custom.backgroundColor,
          border: custom.borderColor,
        },
        typography: {
          ...base.typography,
          headingFont: custom.headingFont,
          bodyFont: custom.bodyFont,
          headingSize: custom.headingSizePx <= 12 ? "small" : custom.headingSizePx >= 16 ? "large" : "medium",
          bodySize: custom.bodySizePx <= 9 ? "small" : custom.bodySizePx >= 11 ? "large" : "medium",
        },
        custom,
      } as ResumeDesign;
    });
  }


  /* ============================================================
     VERSION HISTORY
  ============================================================ */

  async function loadHistory() {
    if (!resumeId) {
      setHistoryItems([]);
      return;
    }

    setIsHistoryLoading(true);
    setHistoryError(null);

    try {
      const response = await fetch(
        `/api/resume/history?resumeId=${encodeURIComponent(resumeId)}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to load resume history.",
        );
      }

      setHistoryItems(data.versions ?? []);
    } catch (historyLoadError) {
      setHistoryError(
        historyLoadError instanceof Error
          ? historyLoadError.message
          : "Failed to load resume history.",
      );
    } finally {
      setIsHistoryLoading(false);
    }
  }

  async function openHistory() {
    setIsHistoryOpen(true);
    await loadHistory();
  }

  async function restoreHistoryVersion(
    version: (typeof historyItems)[number],
  ) {
    if (!resumeId) return;

    const confirmed = window.confirm(
      `Restore "${version.version_name || `Version ${version.version_number}`}"?\n\nYour current resume will be preserved as the current state before the restore.`,
    );

    if (!confirmed) return;

    setIsRestoringVersion(true);
    setHistoryError(null);

    try {
      const response = await fetch(
        "/api/resume/manage",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "restore",
            resumeId,
            versionId: version.id,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error || "Failed to restore this version.",
        );
      }

      if (data.resume) {
        setResume(normalizeResume(data.resume));
      }

      if (data.design) {
        setDesign(data.design);
      }

      if (isTemplateId(data.template)) {
        setTemplate(data.template);
      }

      setIsSamplePreview(false);
      setHasSavedResume(true);
      setMessage("Resume version restored successfully.");

      await loadHistory();
    } catch (restoreError) {
      setHistoryError(
        restoreError instanceof Error
          ? restoreError.message
          : "Failed to restore this version.",
      );
    } finally {
      setIsRestoringVersion(false);
    }
  }

  function previewHistoryVersion(
    version: (typeof historyItems)[number],
  ) {
    setActiveHistoryPreview(version.id);

    setResume(normalizeResume(version.resume_data));

    if (version.design_config) {
      setDesign(version.design_config);
    }

    if (isTemplateId(version.template)) {
      setTemplate(version.template);
    }

    setIsSamplePreview(false);
    setMessage(
      `Previewing ${version.version_name || `Version ${version.version_number}`}. Click Restore to make it your current resume.`,
    );
  }

  /* ============================================================
     AUTH
  ============================================================ */

  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      try {
        const supabase = createClient();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace(
            `/login?next=${encodeURIComponent(
              "/dashboard/resume",
            )}`,
          );
          return;
        }

        if (!mounted) return;

        setCurrentUserId(user.id);
        setIsCheckingAuth(false);
      } catch {
        router.replace(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume",
          )}`,
        );
      }
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  /* ============================================================
     LOAD USER-SCOPED RESUME / DRAFT / TEMPLATE SAMPLE

     Priority:
     1. This authenticated user's Supabase resume
     2. This authenticated user's local draft
     3. Selected template's sample resume

     A previous account can never become the new account's preview.
     ============================================================ */

  useEffect(() => {
    if (isCheckingAuth || !currentUserId || isResumeStartChooser) return;

    let cancelled = false;

    async function loadResumeState() {
      setIsHydrated(false);
      setHasSavedResume(false);
      setResumeId(null);
      setIsSamplePreview(true);

      try {
        if (isNewResumeMode) {
          const firstTemplate: TemplateType = "blue-02";
          setTemplate(firstTemplate);
          setResume(getTemplateDemoResume(firstTemplate));
          setDesign({
            ...getTemplateDesign(firstTemplate),
            custom: getDefaultCustomDesign(firstTemplate),
          });
          setDesignDescription("");
          setProfilePhoto(null);
          setProfilePhotoFile(null);
          setResumeId(null);
          setHasSavedResume(false);
          setIsSamplePreview(true);
          setIsHydrated(true);
          return;
        }

        const loadUrl = requestedResumeId
          ? `/api/resume/generate?id=${encodeURIComponent(requestedResumeId)}`
          : "/api/resume/generate";

        const response = await fetch(loadUrl, {
          method: "GET",
          cache: "no-store",
          credentials: "include",
        });

        const data = response.ok
          ? await response.json()
          : null;

        if (cancelled) return;

        /*
         * A local draft is an emergency recovery copy. It is intentionally
         * user-scoped and resume-scoped so one account can never see another
         * account's draft.
         */
        const readLocalDraft = (draftResumeId: string | null) => {
          try {
            const key = `hirepro-resume-draft-v5:${currentUserId}:${draftResumeId ?? "new"}`;
            const raw = window.localStorage.getItem(key);
            if (!raw) return null;

            const parsed = JSON.parse(raw) as {
              resume?: unknown;
              design?: ResumeDesign | null;
              template?: unknown;
              designDescription?: unknown;
              profilePhoto?: string | null;
              resumeId?: string | null;
              savedAt?: string;
            };

            if (!parsed.resume || !hasResumeContent(parsed.resume)) {
              return null;
            }

            const savedAtMs = parsed.savedAt
              ? Date.parse(parsed.savedAt)
              : 0;

            return {
              resume: normalizeResume(parsed.resume),
              design: parsed.design ?? null,
              template: isTemplateId(parsed.template)
                ? parsed.template
                : null,
              designDescription:
                typeof parsed.designDescription === "string"
                  ? parsed.designDescription
                  : "",
              profilePhoto: parsed.profilePhoto ?? null,
              resumeId: parsed.resumeId ?? draftResumeId,
              savedAtMs: Number.isFinite(savedAtMs) ? savedAtMs : 0,
            };
          } catch {
            return null;
          }
        };

        const serverResume =
          data?.resume && hasResumeContent(data.resume) && data.resumeId
            ? {
                resume: normalizeResume(data.resume),
                design: data.design ?? null,
                template: isTemplateId(data.template)
                  ? data.template
                  : "blue-02" as TemplateType,
                profilePhoto: data.profileImageUrl ?? null,
                resumeId: data.resumeId as string,
                updatedAtMs: data.updatedAt
                  ? Date.parse(data.updatedAt)
                  : 0,
              }
            : null;

        /*
         * For an exact resumeId, only that resume is eligible.
         * For the normal editor, the latest server resume is considered.
         * A newer local draft wins over the server copy, which is what makes
         * Continue Editing resilient to a refresh/network interruption.
         */
        if (serverResume) {
          const localDraft = readLocalDraft(serverResume.resumeId);

          if (
            localDraft &&
            localDraft.resumeId === serverResume.resumeId &&
            localDraft.savedAtMs > serverResume.updatedAtMs
          ) {
            const loadedTemplate =
              localDraft.template ?? serverResume.template;

            setResume(localDraft.resume);
            setResumeId(serverResume.resumeId);
            setHasSavedResume(true);
            setIsSamplePreview(false);
            setTemplate(loadedTemplate);
            setDesignDescription(localDraft.designDescription);
            setProfilePhoto(
              localDraft.profilePhoto ?? serverResume.profilePhoto,
            );

            if (localDraft.design) {
              setDesign({
                ...getTemplateDesign(loadedTemplate),
                ...localDraft.design,
                custom: {
                  ...getDefaultCustomDesign(loadedTemplate),
                  ...((localDraft.design as ResumeDesign & { custom?: object })
                    .custom ?? {}),
                },
              });
            } else {
              setDesign({
                ...getTemplateDesign(loadedTemplate),
                custom: getDefaultCustomDesign(loadedTemplate),
              });
            }

            setMessage("Recovered your latest local changes.");
            setIsHydrated(true);
            return;
          }

          const loadedTemplate = serverResume.template;

          setResume(serverResume.resume);
          setResumeId(serverResume.resumeId);
          setHasSavedResume(true);
          setIsSamplePreview(false);
          setTemplate(loadedTemplate);

          if (serverResume.design) {
            setDesign({
              ...getTemplateDesign(loadedTemplate),
              ...serverResume.design,
              custom: {
                ...getDefaultCustomDesign(loadedTemplate),
                ...((serverResume.design as ResumeDesign & { custom?: object })
                  .custom ?? {}),
              },
            });
          } else {
            setDesign({
              ...getTemplateDesign(loadedTemplate),
              custom: getDefaultCustomDesign(loadedTemplate),
            });
          }

          if (serverResume.profilePhoto) {
            setProfilePhoto(serverResume.profilePhoto);
          }

          setIsHydrated(true);
          return;
        }

        /*
         * No saved server resume exists. In a brand-new editor we may still
         * have a local emergency draft. Restore it only when it belongs to
         * this authenticated user and is not an explicit `?new=1` flow.
         */
        if (!requestedResumeId && !isNewResumeMode) {
          const localDraft = readLocalDraft(null);

          if (localDraft) {
            const loadedTemplate =
              localDraft.template ?? "blue-02";

            setResume(localDraft.resume);
            setResumeId(localDraft.resumeId);
            setHasSavedResume(Boolean(localDraft.resumeId));
            setIsSamplePreview(false);
            setTemplate(loadedTemplate);
            setDesignDescription(localDraft.designDescription);
            setProfilePhoto(localDraft.profilePhoto);

            if (localDraft.design) {
              setDesign({
                ...getTemplateDesign(loadedTemplate),
                ...localDraft.design,
                custom: {
                  ...getDefaultCustomDesign(loadedTemplate),
                  ...((localDraft.design as ResumeDesign & { custom?: object })
                    .custom ?? {}),
                },
              });
            } else {
              setDesign({
                ...getTemplateDesign(loadedTemplate),
                custom: getDefaultCustomDesign(loadedTemplate),
              });
            }

            setMessage("Recovered your saved local draft.");
            setIsHydrated(true);
            return;
          }
        }

        /*
         * Explicit ?resumeId=... is strict: never silently open another
         * resume. This prevents the cross-resume/cross-account behavior that
         * caused the earlier Continue Editing problem.
         */
        if (requestedResumeId) {
          setError(
            "That saved resume could not be found. Please choose a resume from Resume Editing.",
          );
          setIsHydrated(true);
          return;
        }

        /*
         * Normal editor with no saved resume: start from the selected/default
         * template sample. The sample is only preview content and is never
         * autosaved until the user actually edits it.
         */
        const firstTemplate: TemplateType = "blue-02";
        setTemplate(firstTemplate);
        setResume(getTemplateDemoResume(firstTemplate));
        setDesign({
          ...getTemplateDesign(firstTemplate),
          custom: getDefaultCustomDesign(firstTemplate),
        });
        setDesignDescription("");
        setProfilePhoto(null);
        setProfilePhotoFile(null);
        setResumeId(null);
        setHasSavedResume(false);
        setIsSamplePreview(true);
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load the selected resume.",
          );
        }
      } finally {
        if (!cancelled) setIsHydrated(true);
      }
    }

    loadResumeState();

    return () => {
      cancelled = true;
    };
  }, [
    isCheckingAuth,
    currentUserId,
    isResumeStartChooser,
    isNewResumeMode,
    requestedResumeId,
  ]);

  /* ============================================================
     USER-SCOPED LOCAL RECOVERY DRAFT
     ============================================================ */

  useEffect(() => {
    if (
      isCheckingAuth ||
      !isHydrated ||
      !currentUserId ||
      isSamplePreview
    ) {
      return;
    }

    const timer = window.setTimeout(() => {
      try {
        const draftKey = `hirepro-resume-draft-v5:${currentUserId}:${resumeId ?? "new"}`;
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({
            resume,
            design,
            template,
            designDescription,
            profilePhoto,
            resumeId,
            savedAt: new Date().toISOString(),
          }),
        );
      } catch {
        // Local storage may be unavailable or full.
      }
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    resume,
    design,
    template,
    designDescription,
    profilePhoto,
    resumeId,
    currentUserId,
    isCheckingAuth,
    isHydrated,
    isSamplePreview,
  ]);

  /* ============================================================
     SUPABASE PERSISTENT EDITING

     Sample data is never saved automatically.
     ============================================================ */

  useEffect(() => {
    if (
      isCheckingAuth ||
      !isHydrated ||
      !currentUserId ||
      isSamplePreview ||
      !resume.personal.name.trim()
    ) {
      return;
    }

    const timer = window.setTimeout(async () => {
      setIsSaving(true);

      try {
        const response = await fetch(
          "/api/resume/generate",
          {
            method: "PATCH",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              resumeId,
              resume,
              design,
              templateId: template,
            }),
          },
        );

        const data = await response.json().catch(() => null);

        if (response.ok && data?.resumeId) {
          setResumeId(data.resumeId);
          setHasSavedResume(true);

          // Once a brand-new resume is first saved, bind the editor URL
          // to that exact resume. Refreshing the page will therefore
          // continue this resume instead of loading another saved resume.
          if (isNewResumeMode && !requestedResumeId) {
            router.replace(
              `/dashboard/resume?resumeId=${encodeURIComponent(data.resumeId)}`,
            );
          }
        } else if (response.status === 401) {
          router.replace(
            `/login?next=${encodeURIComponent("/dashboard/resume")}`,
          );
        }
      } catch {
        // Local draft remains available if network save fails.
      } finally {
        setIsSaving(false);
      }
    }, 1200);

    return () => window.clearTimeout(timer);
  }, [
    resume,
    design,
    template,
    resumeId,
    currentUserId,
    isCheckingAuth,
    isHydrated,
    isSamplePreview,
    isNewResumeMode,
    requestedResumeId,
    router,
  ]);

  /* ============================================================
     STATE HELPERS
  ============================================================ */

  function updateResume<K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K],
  ) {
    setIsSamplePreview(false);
    setResume((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updatePersonal(
    key: keyof ResumeData["personal"],
    value: string,
  ) {
    setIsSamplePreview(false);
    setResume((current) => ({
      ...current,

      personal: {
        ...current.personal,
        [key]: value,
      },
    }));
  }

  function toggleSection(
    section: SectionName,
  ) {
    setOpenSection((current) =>
      current === section
        ? (null as any)
        : section,
    );
  }

  /* ============================================================
     PHOTO
  ============================================================ */

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file.",
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile photo must be smaller than 5 MB.",
      );
      return;
    }

    setError(null);
    setProfilePhotoFile(file);

    const reader = new FileReader();

    reader.onload = () => {
      if (
        typeof reader.result ===
        "string"
      ) {
        setProfilePhoto(
          reader.result,
        );
      }
    };

    reader.readAsDataURL(file);
  }

  function removePhoto() {
    setProfilePhoto(null);
    setProfilePhotoFile(null);

    if (photoInputRef.current) {
      photoInputRef.current.value =
        "";
    }
  }

  async function fileToBase64(
    file: File,
  ) {
    return new Promise<string>(
      (resolve, reject) => {
        const reader =
          new FileReader();

        reader.onload = () =>
          resolve(
            typeof reader.result ===
              "string"
              ? reader.result
              : "",
          );

        reader.onerror = reject;

        reader.readAsDataURL(file);
      },
    );
  }

  /* ============================================================
     AI INPUT
  ============================================================ */

  function buildUserInformation() {
    const lines: string[] = [];

    lines.push(
      `Name: ${resume.personal.name}`,
    );

    lines.push(
      `Email: ${resume.personal.email}`,
    );

    lines.push(
      `Phone: ${resume.personal.phone}`,
    );

    lines.push(
      `Location: ${resume.personal.location}`,
    );

    lines.push(
      `LinkedIn: ${resume.personal.linkedin}`,
    );

    lines.push(
      `GitHub: ${resume.personal.github}`,
    );

    lines.push(
      `Website: ${resume.personal.website}`,
    );

    lines.push(
      `Professional Summary: ${resume.professionalSummary}`,
    );

    if (resume.skills.length) {
      lines.push(
        "Skills:",
        JSON.stringify(
          resume.skills,
        ),
      );
    }

    if (resume.experience.length) {
      lines.push(
        "Experience:",
        JSON.stringify(
          resume.experience,
        ),
      );
    }

    if (resume.education.length) {
      lines.push(
        "Education:",
        JSON.stringify(
          resume.education,
        ),
      );
    }

    if (resume.projects.length) {
      lines.push(
        "Projects:",
        JSON.stringify(
          resume.projects,
        ),
      );
    }

    if (
      resume.certifications.length
    ) {
      lines.push(
        "Certifications:",
        JSON.stringify(
          resume.certifications,
        ),
      );
    }

    if (resume.achievements.length) {
      lines.push(
        "Achievements:",
        JSON.stringify(
          resume.achievements,
        ),
      );
    }

    if (resume.languages.length) {
      lines.push(
        "Languages:",
        JSON.stringify(
          resume.languages,
        ),
      );
    }

    return lines.join("\n");
  }

  /* ============================================================
     GENERATE
  ============================================================ */

  async function generateResume() {
    setIsGenerating(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume",
          )}`,
        );
        return;
      }

      const userInformation =
        buildUserInformation();

      if (
        !resume.personal.name.trim()
      ) {
        throw new Error(
          "Please enter your name before generating your resume.",
        );
      }

      const response = await fetch(
        "/api/resume/generate",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          credentials: "include",

          body: JSON.stringify({
            userInformation,
            template: getAiTemplate(template),
            templateId: template,
            resumeDesignDescription:
              designDescription,

            profilePhoto:
              profilePhotoFile
                ? await fileToBase64(
                    profilePhotoFile,
                  )
                : null,

            profilePhotoName:
              profilePhotoFile?.name ??
              null,

            profilePhotoType:
              profilePhotoFile?.type ??
              null,
          }),
        },
      );

      const data =
        await response.json();

      if (!response.ok) {
        if (
          response.status === 401
        ) {
          router.push(
            `/login?next=${encodeURIComponent(
              "/dashboard/resume",
            )}`,
          );
          return;
        }

        throw new Error(
          data?.error ||
            "Failed to generate resume.",
        );
      }

      if (!data?.resume) {
        throw new Error(
          "The AI did not return a resume.",
        );
      }

      setResume(
        normalizeResume(
          data.resume,
        ),
      );
      setIsSamplePreview(false);
      setHasSavedResume(true);
      setResumeId(data.resumeId ?? null);

      if (data.design) {
        setDesign({
          ...data.design,
          custom: {
            ...getDefaultCustomDesign(template),
            ...((data.design as ResumeDesign & { custom?: object }).custom ?? {}),
          },
        });
      }

      if (
        data.profileImageUrl
      ) {
        setProfilePhoto(
          data.profileImageUrl,
        );
      }

      setMessage(
        "Resume generated and saved successfully.",
      );

      setOpenSection(
        "personal",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating the resume.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  /* ============================================================
     PDF
  ============================================================ */

  async function downloadPDF() {
    if (!design) {
      setError(
        "Generate the resume before downloading the PDF.",
      );
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push(
          `/login?next=${encodeURIComponent(
            "/dashboard/resume",
          )}`,
        );
        return;
      }

      const response = await fetch(
        "/api/resume/pdf",
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            resume,
            design,
            profilePhoto,
          }),
        },
      );

      if (!response.ok) {
        const data =
          await response
            .json()
            .catch(() => null);

        if (
          response.status === 401
        ) {
          router.push(
            `/login?next=${encodeURIComponent(
              "/dashboard/resume",
            )}`,
          );
          return;
        }

        throw new Error(
          data?.error ||
            "Failed to generate PDF.",
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(
          blob,
        );

      const anchor =
        document.createElement(
          "a",
        );

      anchor.href = url;

      const safeName =
        resume.personal.name
          .trim()
          .replace(
            /[^a-zA-Z0-9]+/g,
            "-",
          )
          .replace(
            /^-+|-+$/g,
            "",
          ) ||
        "Resume";

      anchor.download =
        `${safeName}-Resume.pdf`;

      document.body.appendChild(
        anchor,
      );

      anchor.click();

      anchor.remove();

      window.URL.revokeObjectURL(
        url,
      );

      setMessage(
        "Resume PDF downloaded successfully.",
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to download PDF.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  /* ============================================================
     RESET
  ============================================================ */

  async function resetResume() {
    const resumeToDelete = resumeId;

    if (resumeToDelete) {
      const confirmed = window.confirm(
        "Reset this resume? This will remove the saved resume and its history from HirePro. Your resume will return to the selected template sample.",
      );

      if (!confirmed) return;

      try {
        const response = await fetch(
          `/api/resume/manage?id=${encodeURIComponent(resumeToDelete)}`,
          {
            method: "DELETE",
            credentials: "include",
          },
        );

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(data?.error || "Failed to reset the saved resume.");
        }
      } catch (resetError) {
        setError(
          resetError instanceof Error
            ? resetError.message
            : "Failed to reset the saved resume.",
        );
        return;
      }
    }

    setTemplate("blue-02");
    setResume(getTemplateDemoResume("blue-02"));
    setIsSamplePreview(true);
    setHasSavedResume(false);
    setResumeId(null);
    setDesign({
      ...getTemplateDesign("blue-02"),
      colors: {
        ...getTemplateDesign("blue-02").colors,
        primary: "#D4A017",
        secondary: "#D4A017",
      },
      custom: {
        ...getDefaultCustomDesign("blue-02"),
        primaryColor: "#D4A017",
        secondaryColor: "#D4A017",
      },
    });
    setProfilePhoto(null);
    setProfilePhotoFile(null);
    setDesignDescription("");
    setMessage("Resume reset. You are starting from a clean template.");
    setError(null);

    try {
      if (currentUserId) {
        Object.keys(window.localStorage)
          .filter((key) => key.startsWith(`hirepro-resume-draft-v5:${currentUserId}:`))
          .forEach((key) => window.localStorage.removeItem(key));
      }
    } catch {}

    if (photoInputRef.current) {
      photoInputRef.current.value = "";
    }

    router.replace("/dashboard/resume?new=1");
  }

  /* ============================================================
     ARRAY HELPERS
  ============================================================ */

  function addSkillGroup() {
    updateResume("skills", [
      ...resume.skills,
      {
        category: "Skills",
        items: [""],
      },
    ]);
  }

  function addExperience() {
    updateResume("experience", [
      ...resume.experience,
      {
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        responsibilities: [""],
      },
    ]);
  }

  function addEducation() {
    updateResume("education", [
      ...resume.education,
      {
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        details: [""],
      },
    ]);
  }

  function addProject() {
    updateResume("projects", [
      ...resume.projects,
      {
        name: "",
        description: "",
        technologies: [],
        url: "",
      },
    ]);
  }

  function addCertification() {
    updateResume("certifications", [
      ...resume.certifications,
      {
        name: "",
        issuer: "",
        date: "",
        url: "",
      },
    ]);
  }

  function addAchievement() {
    updateResume("achievements", [
      ...resume.achievements,
      "",
    ]);
  }

  function addLanguage() {
    updateResume("languages", [
      ...resume.languages,
      "",
    ]);
  }

  /* ============================================================
     LOADING
  ============================================================ */

  if (isCheckingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 rounded-2xl bg-white px-6 py-5 shadow-sm">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="font-semibold text-slate-700">
            Checking your HirePro session...
          </span>
        </div>
      </main>
    );
  }

  /* ============================================================
     START SCREEN — choose NEW or RESUME EDITING
  ============================================================ */

  if (isResumeStartChooser) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">HirePro Resume Studio</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">What would you like to do?</h1>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Start a completely new resume, or continue editing one of your saved resumes exactly where you left off.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard/resume?new=1")}
              className="group rounded-3xl border border-blue-100 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 transition group-hover:scale-105">
                <Plus className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-2xl font-black">Create New Resume</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Start from the beginning with a clean template sample. Your previous resumes will not be loaded or changed.
              </p>
              <span className="mt-6 inline-flex rounded-xl bg-slate-950 px-5 py-3 text-sm font-black text-white group-hover:bg-blue-600">
                Start New Resume →
              </span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/dashboard/resume/saved")}
              className="group rounded-3xl border border-slate-200 bg-white p-7 text-left shadow-sm transition hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition group-hover:scale-105">
                <FileText className="h-7 w-7" />
              </div>
              <h2 className="mt-6 text-2xl font-black">Resume Editing</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Open your saved resumes, continue exactly where you stopped, duplicate a version, or delete a resume you no longer need.
              </p>
              <span className="mt-6 inline-flex rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-black text-slate-800 group-hover:border-blue-200 group-hover:text-blue-700">
                Open Resume Editing →
              </span>
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-center text-xs font-semibold text-slate-500 shadow-sm">
            Your saved resumes are always separated from a new resume. Creating a new resume never loads an older resume automatically.
          </div>
        </div>
      </main>
    );
  }

  /* ============================================================
     UI
  ============================================================ */

  return (
    <main className="min-h-screen bg-[#f6f8fc] text-slate-900">
      {/* HEADER */}

      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              HirePro
            </p>

            <h1 className="text-xl font-black tracking-tight sm:text-2xl">
              Resume Builder
            </h1>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600">
              <span className={`h-2 w-2 rounded-full ${isSaving ? "animate-pulse bg-amber-400" : "bg-emerald-500"}`} />
              {isSaving ? "Saving changes..." : "All changes saved"}
            </div>
            <div className="text-xs font-semibold text-slate-400">
              {isSamplePreview ? "Template preview" : `Resume ${resumeId ? "saved" : "draft"}`}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetResume}
              className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 sm:flex"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              type="button"
              onClick={downloadPDF}
              disabled={
                isDownloading ||
                !design
              }
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDownloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}

              Download PDF
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setActiveTab("information")} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${activeTab === "information" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${activeTab === "information" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>1</span>
              <span><span className="block text-sm font-black">Information</span><span className="hidden text-[11px] font-semibold sm:block">Build your content</span></span>
            </button>
            <button type="button" onClick={() => setActiveTab("styling")} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left transition ${activeTab === "styling" ? "bg-blue-50 text-blue-700" : "text-slate-500 hover:bg-slate-50"}`}>
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${activeTab === "styling" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"}`}>2</span>
              <span><span className="block text-sm font-black">Styling</span><span className="hidden text-[11px] font-semibold sm:block">Make it look professional</span></span>
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1fr)_420px] lg:px-8">
        {/* EDITOR */}

        <div className="space-y-4">
          {/* HERO */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                  <Sparkles className="h-3.5 w-3.5" />
                  AI-powered resume builder
                </div>

                <h2 className="text-2xl font-black tracking-tight">
                  Build a professional resume
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  HirePro generates structured resume content,
                  keeps your facts intact, and produces a
                  clean recruiter-friendly PDF.
                </p>
              </div>

              <button
                type="button"
                onClick={generateResume}
                disabled={isGenerating}
                className="flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Wand2 className="h-5 w-5" />
                )}

                {isGenerating
                  ? "Generating..."
                  : "Generate with AI"}
              </button>
            </div>

            {!isSamplePreview && (() => {
              const readiness = getResumeReadiness(resume);
              return (
                <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                        <div className="text-center"><div className="text-lg font-black text-slate-900">{readiness.score}%</div><div className="text-[8px] font-black uppercase tracking-wide text-slate-400">Ready</div></div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2"><p className="text-sm font-black text-slate-900">Resume readiness</p><span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${readiness.score >= 75 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{readiness.label}</span></div>
                        <p className="mt-1 text-xs leading-5 text-slate-500">This measures content completeness only. It does not replace the ATS analysis.</p>
                      </div>
                    </div>
                    {readiness.missing.length > 0 && (<div className="min-w-0 sm:max-w-sm"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Suggested next</p><div className="mt-2 flex flex-wrap gap-2">{readiness.missing.map((item) => <span key={item} className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">+ {item}</span>)}</div></div>)}
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200"><div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${readiness.score}%` }} /></div>
                </div>
              );
            })()}
          </div>

          {message && (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
              <Check className="h-5 w-5" />
              {message}
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
              {error}
            </div>
          )}

          {/* WORKSPACE TABS */}

          <div className="sticky top-[81px] z-20 rounded-2xl border border-slate-200 bg-white/95 p-1.5 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setActiveTab("information")}
                  className={`rounded-lg px-5 py-2.5 text-sm font-black transition ${activeTab === "information" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Information
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("styling")}
                  className={`rounded-lg px-5 py-2.5 text-sm font-black transition ${activeTab === "styling" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}
                >
                  Styling
                </button>
              </div>
              <span className="hidden pr-3 text-xs font-semibold text-slate-400 sm:block">Edits are saved automatically</span>
            </div>
          </div>

          {activeTab === "information" && (
            <>

          {/* PERSONAL */}

          <SectionCard
            icon={<User className="h-5 w-5" />}
            title="Personal information"
            description="Name, contact details and professional links"
            open={openSection === "personal"}
            onToggle={() =>
              toggleSection("personal")
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Full name"
                value={resume.personal.name}
                onChange={(value) =>
                  updatePersonal(
                    "name",
                    value,
                  )
                }
                placeholder="Rajeev Thotakura"
              />

              <Input
                label="Email"
                value={resume.personal.email}
                onChange={(value) =>
                  updatePersonal(
                    "email",
                    value,
                  )
                }
                type="email"
                placeholder="you@example.com"
              />

              <Input
                label="Phone"
                value={resume.personal.phone}
                onChange={(value) =>
                  updatePersonal(
                    "phone",
                    value,
                  )
                }
                placeholder="+91 XXXXX XXXXX"
              />

              <Input
                label="Location"
                value={resume.personal.location}
                onChange={(value) =>
                  updatePersonal(
                    "location",
                    value,
                  )
                }
                placeholder="Hyderabad, India"
              />

              <Input
                label="LinkedIn"
                value={resume.personal.linkedin}
                onChange={(value) =>
                  updatePersonal(
                    "linkedin",
                    value,
                  )
                }
                placeholder="https://linkedin.com/in/..."
              />

              <Input
                label="GitHub"
                value={resume.personal.github}
                onChange={(value) =>
                  updatePersonal(
                    "github",
                    value,
                  )
                }
                placeholder="https://github.com/..."
              />

              <div className="sm:col-span-2">
                <Input
                  label="Website / Portfolio"
                  value={
                    resume.personal.website
                  }
                  onChange={(value) =>
                    updatePersonal(
                      "website",
                      value,
                    )
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-bold">
                    Profile photo
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Optional for professional,
                    modern and executive resumes.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {profilePhoto && (
                    <img
                      src={profilePhoto}
                      alt="Profile preview"
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-100"
                    />
                  )}

                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={
                      handlePhotoChange
                    }
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      photoInputRef.current?.click()
                    }
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50"
                  >
                    <ImageIcon className="mr-2 inline h-4 w-4" />
                    {profilePhoto
                      ? "Change"
                      : "Upload"}
                  </button>

                  {profilePhoto && (
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="rounded-xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* SUMMARY */}

          <SectionCard
            icon={
              <FileText className="h-5 w-5" />
            }
            title="Professional summary"
            description="A concise recruiter-facing introduction"
            open={openSection === "summary"}
            onToggle={() =>
              toggleSection("summary")
            }
          >
            <TextArea
              label="Professional summary"
              value={
                resume.professionalSummary
              }
              onChange={(value) =>
                updateResume(
                  "professionalSummary",
                  value,
                )
              }
              rows={7}
              placeholder="Describe your professional background, strongest skills, domain knowledge and career direction."
            />

            <AIResumeCoach
              mode="summary"
              content={resume.professionalSummary}
              context="Professional summary for a job application. Preserve the candidate's actual background, skills and career direction."
              onApply={(value) =>
                updateResume("professionalSummary", value)
              }
            />
          </SectionCard>

          {/* SKILLS */}

          <SectionCard
            icon={
              <Sparkles className="h-5 w-5" />
            }
            title="Skills"
            description="Group technical and professional skills clearly"
            open={openSection === "skills"}
            onToggle={() =>
              toggleSection("skills")
            }
          >
            <div className="space-y-4">
              {resume.skills.map(
                (group, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Input
                        label="Category"
                        value={
                          group.category
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.skills];

                          next[index] = {
                            ...next[index],
                            category: value,
                          };

                          updateResume(
                            "skills",
                            next,
                          );
                        }}
                        placeholder="Programming"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          updateResume(
                            "skills",
                            resume.skills.filter(
                              (_, i) =>
                                i !== index,
                            ),
                          )
                        }
                        className="mt-7 rounded-xl p-3 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4">
                      <TextArea
                        label="Skills"
                        value={
                          group.items.join(
                            ", ",
                          )
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.skills];

                          next[index] = {
                            ...next[index],
                            items:
                              value
                                .split(",")
                                .map(
                                  (x) =>
                                    x.trim(),
                                )
                                .filter(
                                  Boolean,
                                ),
                          };

                          updateResume(
                            "skills",
                            next,
                          );
                        }}
                        rows={3}
                        placeholder="Python, Java, JavaScript, React, SQL"
                      />
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addSkillGroup}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add skill category
              </button>
            </div>
          </SectionCard>

          {/* EXPERIENCE */}

          <SectionCard
            icon={
              <BriefcaseBusiness className="h-5 w-5" />
            }
            title="Experience"
            description="Work history and measurable responsibilities"
            open={openSection === "experience"}
            onToggle={() =>
              toggleSection("experience")
            }
          >
            <div className="space-y-5">
              {resume.experience.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold">
                        Experience{" "}
                        {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          updateResume(
                            "experience",
                            resume.experience.filter(
                              (_, i) =>
                                i !==
                                index,
                            ),
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Job title"
                        value={item.role}
                        onChange={(value) => {
                          const next =
                            [...resume.experience];

                          next[index] = {
                            ...next[index],
                            role: value,
                          };

                          updateResume(
                            "experience",
                            next,
                          );
                        }}
                        placeholder="Software Engineer"
                      />

                      <Input
                        label="Company"
                        value={
                          item.company
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.experience];

                          next[index] = {
                            ...next[index],
                            company:
                              value,
                          };

                          updateResume(
                            "experience",
                            next,
                          );
                        }}
                        placeholder="Company name"
                      />

                      <Input
                        label="Location"
                        value={
                          item.location
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.experience];

                          next[index] = {
                            ...next[index],
                            location:
                              value,
                          };

                          updateResume(
                            "experience",
                            next,
                          );
                        }}
                        placeholder="Hyderabad, India"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Start"
                          value={
                            item.startDate
                          }
                          onChange={(value) => {
                            const next =
                              [...resume.experience];

                            next[index] = {
                              ...next[index],
                              startDate:
                                value,
                            };

                            updateResume(
                              "experience",
                              next,
                            );
                          }}
                          placeholder="Jun 2024"
                        />

                        <Input
                          label="End"
                          value={
                            item.endDate
                          }
                          onChange={(value) => {
                            const next =
                              [...resume.experience];

                            next[index] = {
                              ...next[index],
                              endDate:
                                value,
                            };

                            updateResume(
                              "experience",
                              next,
                            );
                          }}
                          placeholder="Present"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <TextArea
                        label="Responsibilities / achievements"
                        value={item.responsibilities.join(
                          "\n",
                        )}
                        onChange={(value) => {
                          const next =
                            [...resume.experience];

                          next[index] = {
                            ...next[index],
                            responsibilities:
                              value
                                .split("\n")
                                .map(
                                  (x) =>
                                    x.trim(),
                                )
                                .filter(
                                  Boolean,
                                ),
                          };

                          updateResume(
                            "experience",
                            next,
                          );
                        }}
                        rows={6}
                        placeholder="One bullet per line."
                      />

                      <AIResumeCoach
                        mode="bullets"
                        content={item.responsibilities.join("\n")}
                        context={`Experience: ${item.role || "Role"} at ${item.company || "Company"}. Preserve all supplied facts, dates, technologies, metrics and responsibilities.`}
                        onApply={(value) => {
                          const next = [...resume.experience];
                          next[index] = {
                            ...next[index],
                            responsibilities: value
                              .split("\n")
                              .map((x) => x.trim())
                              .filter(Boolean),
                          };
                          updateResume("experience", next);
                        }}
                      />
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add experience
              </button>
            </div>
          </SectionCard>

          {/* EDUCATION */}

          <SectionCard
            icon={
              <GraduationCap className="h-5 w-5" />
            }
            title="Education"
            description="Degrees, institutions and academic details"
            open={openSection === "education"}
            onToggle={() =>
              toggleSection("education")
            }
          >
            <div className="space-y-5">
              {resume.education.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold">
                        Education{" "}
                        {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          updateResume(
                            "education",
                            resume.education.filter(
                              (_, i) =>
                                i !==
                                index,
                            ),
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Degree"
                        value={
                          item.degree
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.education];

                          next[index] = {
                            ...next[index],
                            degree:
                              value,
                          };

                          updateResume(
                            "education",
                            next,
                          );
                        }}
                        placeholder="B.Tech"
                      />

                      <Input
                        label="Field"
                        value={
                          item.field
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.education];

                          next[index] = {
                            ...next[index],
                            field: value,
                          };

                          updateResume(
                            "education",
                            next,
                          );
                        }}
                        placeholder="Computer Science"
                      />

                      <Input
                        label="Institution"
                        value={
                          item.institution
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.education];

                          next[index] = {
                            ...next[index],
                            institution:
                              value,
                          };

                          updateResume(
                            "education",
                            next,
                          );
                        }}
                        placeholder="University name"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          label="Start"
                          value={
                            item.startDate
                          }
                          onChange={(value) => {
                            const next =
                              [...resume.education];

                            next[index] = {
                              ...next[index],
                              startDate:
                                value,
                            };

                            updateResume(
                              "education",
                              next,
                            );
                          }}
                          placeholder="2021"
                        />

                        <Input
                          label="End"
                          value={
                            item.endDate
                          }
                          onChange={(value) => {
                            const next =
                              [...resume.education];

                            next[index] = {
                              ...next[index],
                              endDate:
                                value,
                            };

                            updateResume(
                              "education",
                              next,
                            );
                          }}
                          placeholder="2025"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <TextArea
                        label="Academic details"
                        value={item.details.join(
                          "\n",
                        )}
                        onChange={(value) => {
                          const next =
                            [...resume.education];

                          next[index] = {
                            ...next[index],
                            details:
                              value
                                .split("\n")
                                .map(
                                  (x) =>
                                    x.trim(),
                                )
                                .filter(
                                  Boolean,
                                ),
                          };

                          updateResume(
                            "education",
                            next,
                          );
                        }}
                        rows={4}
                        placeholder="Relevant coursework, academic achievements, activities..."
                      />
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add education
              </button>
            </div>
          </SectionCard>

          {/* PROJECTS */}

          <SectionCard
            icon={
              <FolderKanban className="h-5 w-5" />
            }
            title="Projects"
            description="Projects that demonstrate practical ability"
            open={openSection === "projects"}
            onToggle={() =>
              toggleSection("projects")
            }
          >
            <div className="space-y-5">
              {resume.projects.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <h3 className="font-bold">
                        Project{" "}
                        {index + 1}
                      </h3>

                      <button
                        type="button"
                        onClick={() =>
                          updateResume(
                            "projects",
                            resume.projects.filter(
                              (_, i) =>
                                i !==
                                index,
                            ),
                          )
                        }
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <Input
                        label="Project name"
                        value={
                          item.name
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.projects];

                          next[index] = {
                            ...next[index],
                            name: value,
                          };

                          updateResume(
                            "projects",
                            next,
                          );
                        }}
                        placeholder="AI Career Platform"
                      />

                      <TextArea
                        label="Description"
                        value={
                          item.description
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.projects];

                          next[index] = {
                            ...next[index],
                            description:
                              value,
                          };

                          updateResume(
                            "projects",
                            next,
                          );
                        }}
                        rows={4}
                        placeholder="Explain what you built and what problem it solves."
                      />

                      <AIResumeCoach
                        mode="project"
                        content={item.description}
                        context={`Project: ${item.name || "Project"}. Technologies supplied by the user: ${item.technologies.join(", ") || "none"}. Preserve only the user's factual claims.`}
                        onApply={(value) => {
                          const next = [...resume.projects];
                          next[index] = {
                            ...next[index],
                            description: value,
                          };
                          updateResume("projects", next);
                        }}
                      />

                      <Input
                        label="Technologies"
                        value={
                          item.technologies.join(
                            ", ",
                          )
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.projects];

                          next[index] = {
                            ...next[index],
                            technologies:
                              value
                                .split(",")
                                .map(
                                  (x) =>
                                    x.trim(),
                                )
                                .filter(
                                  Boolean,
                                ),
                          };

                          updateResume(
                            "projects",
                            next,
                          );
                        }}
                        placeholder="Next.js, Supabase, Gemini"
                      />

                      <Input
                        label="Project URL"
                        value={
                          item.url
                        }
                        onChange={(value) => {
                          const next =
                            [...resume.projects];

                          next[index] = {
                            ...next[index],
                            url: value,
                          };

                          updateResume(
                            "projects",
                            next,
                          );
                        }}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add project
              </button>
            </div>
          </SectionCard>

          {/* CERTIFICATIONS */}

          <SectionCard
            icon={
              <Award className="h-5 w-5" />
            }
            title="Certifications"
            description="Professional certifications and credentials"
            open={
              openSection ===
              "certifications"
            }
            onToggle={() =>
              toggleSection(
                "certifications",
              )
            }
          >
            <div className="space-y-4">
              {resume.certifications.map(
                (item, index) => (
                  <div
                    key={index}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Input
                        label="Certification"
                        value={
                          item.name
                        }
                        onChange={(value) => {
                          const next =
                            [
                              ...resume.certifications,
                            ];

                          next[index] = {
                            ...next[index],
                            name: value,
                          };

                          updateResume(
                            "certifications",
                            next,
                          );
                        }}
                        placeholder="AWS Certified..."
                      />

                      <Input
                        label="Issuer"
                        value={
                          item.issuer
                        }
                        onChange={(value) => {
                          const next =
                            [
                              ...resume.certifications,
                            ];

                          next[index] = {
                            ...next[index],
                            issuer:
                              value,
                          };

                          updateResume(
                            "certifications",
                            next,
                          );
                        }}
                        placeholder="Amazon Web Services"
                      />

                      <Input
                        label="Date"
                        value={
                          item.date
                        }
                        onChange={(value) => {
                          const next =
                            [
                              ...resume.certifications,
                            ];

                          next[index] = {
                            ...next[index],
                            date: value,
                          };

                          updateResume(
                            "certifications",
                            next,
                          );
                        }}
                        placeholder="2026"
                      />

                      <Input
                        label="URL"
                        value={
                          item.url
                        }
                        onChange={(value) => {
                          const next =
                            [
                              ...resume.certifications,
                            ];

                          next[index] = {
                            ...next[index],
                            url: value,
                          };

                          updateResume(
                            "certifications",
                            next,
                          );
                        }}
                        placeholder="https://..."
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateResume(
                          "certifications",
                          resume.certifications.filter(
                            (_, i) =>
                              i !==
                              index,
                          ),
                        )
                      }
                      className="mt-3 text-sm font-semibold text-red-600"
                    >
                      Remove certification
                    </button>
                  </div>
                ),
              )}

              <button
                type="button"
                onClick={addCertification}
                className="flex items-center gap-2 rounded-xl border border-dashed border-blue-300 px-4 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-4 w-4" />
                Add certification
              </button>
            </div>
          </SectionCard>

          {/* ACHIEVEMENTS */}

          <SectionCard
            icon={
              <Award className="h-5 w-5" />
            }
            title="Achievements"
            description="Awards and notable accomplishments"
            open={
              openSection ===
              "achievements"
            }
            onToggle={() =>
              toggleSection(
                "achievements",
              )
            }
          >
            <TextArea
              label="Achievements"
              value={resume.achievements.join(
                "\n",
              )}
              onChange={(value) =>
                updateResume(
                  "achievements",
                  value
                    .split("\n")
                    .map((x) =>
                      x.trim(),
                    )
                    .filter(Boolean),
                )
              }
              rows={5}
              placeholder="One achievement per line."
            />

            {resume.achievements.length > 0 && (
              <div className="mt-3 space-y-3">
                {resume.achievements.map((achievement, index) => (
                  <AIResumeCoach
                    key={`${index}-${achievement}`}
                    mode="achievement"
                    content={achievement}
                    context="Achievement or award supplied by the candidate. Preserve every factual claim and number."
                    onApply={(value) => {
                      const next = [...resume.achievements];
                      next[index] = value;
                      updateResume("achievements", next);
                    }}
                  />
                ))}
              </div>
            )}
          </SectionCard>

          {/* LANGUAGES */}

          <SectionCard
            icon={
              <Languages className="h-5 w-5" />
            }
            title="Languages"
            description="Languages you can communicate in"
            open={
              openSection === "languages"
            }
            onToggle={() =>
              toggleSection("languages")
            }
          >
            <Input
              label="Languages"
              value={resume.languages.join(
                ", ",
              )}
              onChange={(value) =>
                updateResume(
                  "languages",
                  value
                    .split(",")
                    .map((x) =>
                      x.trim(),
                    )
                    .filter(Boolean),
                )
              }
              placeholder="English, Telugu, Hindi"
            />
          </SectionCard>

            </>
          )}

          {activeTab === "styling" && (
          <>
          {/* STYLING + TEMPLATES */}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Palette className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold">Styling & templates</h2>
                  <p className="text-xs text-slate-500">Choose a template, then control the exact visual styling.</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <Save className="h-3.5 w-3.5" />
                {isSaving ? "Saving to HirePro..." : isSamplePreview ? "Template sample" : "Saved to HirePro"}
              </div>
            </div>

            <div className="mb-6">
  <TemplateGallery
    templates={RESUME_TEMPLATES}
    selectedId={template}
    onSelect={selectTemplate}
  />
</div>
            {design && (
              <div className="space-y-5 border-t border-slate-100 pt-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-semibold text-slate-700">
                    Heading font
                    <select
                      value={getCustomDesign(design).headingFont}
                      onChange={(e) => updateCustomDesign({ headingFont: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      {['Arial','Helvetica','Georgia','Times New Roman','Courier New','Trebuchet MS'].map((font) => <option key={font}>{font}</option>)}
                    </select>
                  </label>
                  <label className="text-sm font-semibold text-slate-700">
                    Body font
                    <select
                      value={getCustomDesign(design).bodyFont}
                      onChange={(e) => updateCustomDesign({ bodyFont: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                    >
                      {['Arial','Helvetica','Georgia','Times New Roman','Courier New','Trebuchet MS'].map((font) => <option key={font}>{font}</option>)}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <RangeControl label="Heading size" value={getCustomDesign(design).headingSizePx} min={10} max={22} step={1} onChange={(value) => updateCustomDesign({ headingSizePx: value })} suffix="px" />
                  <RangeControl label="Body size" value={getCustomDesign(design).bodySizePx} min={8} max={14} step={0.5} onChange={(value) => updateCustomDesign({ bodySizePx: value })} suffix="px" />
                  <RangeControl label="Line height" value={getCustomDesign(design).lineHeight} min={1.1} max={2} step={0.05} onChange={(value) => updateCustomDesign({ lineHeight: value })} suffix="" />
                  <RangeControl label="Section gap" value={getCustomDesign(design).sectionGapPx} min={6} max={32} step={1} onChange={(value) => updateCustomDesign({ sectionGapPx: value })} suffix="px" />
                  <RangeControl label="Letter spacing" value={getCustomDesign(design).letterSpacingPx} min={-0.5} max={2} step={0.1} onChange={(value) => updateCustomDesign({ letterSpacingPx: value })} suffix="px" />
                  <RangeControl label="Word spacing" value={getCustomDesign(design).wordSpacingPx} min={0} max={8} step={0.5} onChange={(value) => updateCustomDesign({ wordSpacingPx: value })} suffix="px" />
                  <RangeControl label="Page margin" value={getCustomDesign(design).pageMarginPx} min={20} max={60} step={1} onChange={(value) => updateCustomDesign({ pageMarginPx: value })} suffix="px" />
                  <RangeControl label="Item gap" value={getCustomDesign(design).itemGapPx} min={3} max={18} step={1} onChange={(value) => updateCustomDesign({ itemGapPx: value })} suffix="px" />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <ColorControl label="Primary" value={getCustomDesign(design).primaryColor} onChange={(value) => updateCustomDesign({ primaryColor: value })} />
                  <ColorControl label="Secondary" value={getCustomDesign(design).secondaryColor} onChange={(value) => updateCustomDesign({ secondaryColor: value })} />
                  <ColorControl label="Text" value={getCustomDesign(design).textColor} onChange={(value) => updateCustomDesign({ textColor: value })} />
                  <ColorControl label="Muted text" value={getCustomDesign(design).mutedColor} onChange={(value) => updateCustomDesign({ mutedColor: value })} />
                  <ColorControl label="Border" value={getCustomDesign(design).borderColor} onChange={(value) => updateCustomDesign({ borderColor: value })} />
                  <ColorControl label="Background" value={getCustomDesign(design).backgroundColor} onChange={(value) => updateCustomDesign({ backgroundColor: value })} />
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <label className="text-sm font-semibold text-slate-700">Heading style<select value={getCustomDesign(design).headingCase} onChange={(e) => updateCustomDesign({ headingCase: e.target.value as "normal" | "uppercase" })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="uppercase">UPPERCASE</option><option value="normal">Normal</option></select></label>
                  <label className="text-sm font-semibold text-slate-700">Heading weight<select value={getCustomDesign(design).headingWeight} onChange={(e) => updateCustomDesign({ headingWeight: Number(e.target.value) as 500 | 600 | 700 | 800 })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="500">Medium</option><option value="600">Semi-bold</option><option value="700">Bold</option><option value="800">Extra bold</option></select></label>
                  <label className="text-sm font-semibold text-slate-700">Photo<select value={design.header.photo.enabled ? "enabled" : "disabled"} onChange={(e) => setDesign((current) => current ? { ...current, header: { ...current.header, photo: { ...current.header.photo, enabled: e.target.value === "enabled" } } } : current)} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"><option value="disabled">Hide photo</option><option value="enabled">Show photo</option></select></label>
                </div>

                <TextArea
                  label="AI design instructions"
                  value={designDescription}
                  onChange={setDesignDescription}
                  rows={3}
                  placeholder="Example: premium software engineer resume, navy and white, compact spacing, strong project section, ATS friendly."
                />
              </div>
            )}
          </section>
          </>
          )}

          {/* MOBILE ACTION */}

          <div className="sticky bottom-4 z-30 rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-xl backdrop-blur lg:hidden">
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={generateResume}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-bold text-white disabled:opacity-50"
              >
                {isGenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                Generate
              </button>

              <button
                type="button"
                onClick={downloadPDF}
                disabled={
                  isDownloading ||
                  !design
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 font-bold text-white disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                PDF
              </button>
            </div>
          </div>
        </div>

        {/* PREVIEW */}

        <aside className="hidden lg:block">
  <div className="sticky top-24">
    <ResumePreviewStudio
      resume={resume}
      sampleResume={getTemplateDemoResume(template)}
      design={design}
      template={template}
      profilePhoto={profilePhoto}
      isSamplePreview={isSamplePreview}
      isSaving={isSaving}
    />
  </div>
</aside>
      </div>
      {isHistoryOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/30 backdrop-blur-[2px]">
          <button
            type="button"
            aria-label="Close history"
            onClick={() => setIsHistoryOpen(false)}
            className="absolute inset-0 cursor-default"
          />

          <aside className="relative z-10 flex h-full w-full max-w-xl flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Resume History
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Review previous saved versions and restore one when needed.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsHistoryOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {isHistoryLoading ? (
                <div className="flex min-h-[240px] items-center justify-center">
                  <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading history...
                  </div>
                </div>
              ) : historyError ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {historyError}
                  <button
                    type="button"
                    onClick={loadHistory}
                    className="ml-2 font-bold underline"
                  >
                    Try again
                  </button>
                </div>
              ) : historyItems.length === 0 ? (
                <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
                  <History className="mb-3 h-8 w-8 text-slate-400" />
                  <p className="font-bold text-slate-700">
                    No saved versions yet
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Save a named version from the builder to create a restore point.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyItems.map((version, index) => {
                    const isLatest = index === 0;
                    const isPreviewing =
                      activeHistoryPreview === version.id;

                    return (
                      <div
                        key={version.id}
                        className={`rounded-2xl border p-4 transition ${
                          isPreviewing
                            ? "border-blue-300 bg-blue-50/50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-black text-slate-900">
                                {version.version_name ||
                                  `Version ${version.version_number}`}
                              </h3>

                              {isLatest && (
                                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                                  Latest
                                </span>
                              )}
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              {new Date(
                                version.created_at,
                              ).toLocaleString("en-IN")}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-lg bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">
                            v{version.version_number}
                          </span>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              previewHistoryVersion(version)
                            }
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            Preview
                          </button>

                          <button
                            type="button"
                            disabled={isRestoringVersion}
                            onClick={() =>
                              restoreHistoryVersion(version)
                            }
                            className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {isRestoringVersion ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RotateCcw className="h-3.5 w-3.5" />
                            )}
                            Restore
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>
        </div>
      )}

    </main>
  );
}

function RangeControl({
  label,
  value,
  min,
  max,
  step,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  suffix: string;
}) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      <span className="flex items-center justify-between gap-2">
        {label}
        <span className="text-xs font-bold text-slate-400">{value}{suffix}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-3 w-full accent-blue-600"
      />
    </label>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="text-sm font-semibold text-slate-700">
      {label}
      <div className="mt-2 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-2">
        <input type="color" value={value} onChange={(event) => onChange(event.target.value)} className="h-9 w-10 cursor-pointer rounded-lg border-0 bg-transparent" />
        <input type="text" value={value} onChange={(event) => onChange(event.target.value)} className="min-w-0 flex-1 bg-transparent px-1 text-sm font-mono outline-none" />
      </div>
    </label>
  );
}

function PreviewSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-4 text-[9px] leading-[1.45]">
      <h3 className="border-b border-slate-700 pb-1 text-[10px] font-black tracking-wide">
        {title}
      </h3>

      <div className="pt-2">
        {children}
      </div>
    </section>


  );
}

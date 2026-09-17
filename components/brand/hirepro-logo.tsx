import React from "react";

type HireProLogoProps = {
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  className?: string;
};

const sizes = {
  sm: {
    text: "text-2xl",
    bolt: "h-8 w-6",
    tagline: "text-[7px]",
  },
  md: {
    text: "text-3xl",
    bolt: "h-10 w-7",
    tagline: "text-[8px]",
  },
  lg: {
    text: "text-5xl sm:text-6xl",
    bolt: "h-16 w-11",
    tagline: "text-[10px]",
  },
};

export default function HireProLogo({
  size = "md",
  showTagline = false,
  className = "",
}: HireProLogoProps) {
  const current = sizes[size];

  return (
    <div className={`inline-flex flex-col ${className}`}>
      <div className="flex items-center leading-none">
        {/* HIRE */}
        <span
          className={`
            ${current.text}
            font-black
            tracking-[-0.07em]
            italic
            bg-gradient-to-br
            from-[#38bdf8]
            via-[#2563eb]
            to-[#1d4ed8]
            bg-clip-text
            text-transparent
            drop-shadow-[0_5px_3px_rgba(30,64,175,0.28)]
          `}
        >
          Hire
        </span>

        {/* 3D THUNDER */}
        <span className="relative mx-1 flex items-center justify-center">
          {/* Back shadow / extrusion */}
          <span
            className="
              absolute
              translate-x-[3px]
              translate-y-[4px]
              text-[#b45309]
              opacity-70
              blur-[0.5px]
            "
          >
            <svg
              viewBox="0 0 64 96"
              className={current.bolt}
              aria-hidden="true"
            >
              <path
                d="M39 2L5 54h22L18 94l41-57H37L49 2H39z"
                fill="currentColor"
              />
            </svg>
          </span>

          {/* Main lightning */}
          <svg
            viewBox="0 0 64 96"
            className={`
              ${current.bolt}
              relative
              z-10
              drop-shadow-[0_5px_5px_rgba(180,83,9,0.35)]
            `}
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="hireproLightning"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#fff7ae" />
                <stop offset="22%" stopColor="#fde047" />
                <stop offset="52%" stopColor="#facc15" />
                <stop offset="78%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>

              <linearGradient
                id="hireproHighlight"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="0%"
              >
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="45%" stopColor="#ffffff" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Main 3D body */}
            <path
              d="M39 2L5 54h22L18 94l41-57H37L49 2H39z"
              fill="url(#hireproLightning)"
              stroke="#d97706"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />

            {/* Gloss highlight */}
            <path
              d="M39 8L12 51h17L23 78l25-35H34L43 8h-4z"
              fill="url(#hireproHighlight)"
            />
          </svg>
        </span>

        {/* PRO */}
        <span
          className={`
            ${current.text}
            font-black
            tracking-[-0.07em]
            italic
            bg-gradient-to-br
            from-[#c084fc]
            via-[#9333ea]
            to-[#6b21a8]
            bg-clip-text
            text-transparent
            drop-shadow-[0_5px_3px_rgba(107,33,168,0.28)]
          `}
        >
          Pro
        </span>
      </div>

      {/* TAGLINE */}
      {showTagline && (
        <div
          className={`
            ${current.tagline}
            mt-2
            text-center
            font-bold
            uppercase
            tracking-[0.38em]
            text-[#172554]
          `}
        >
          Build&nbsp;&nbsp;/&nbsp;&nbsp;Improve&nbsp;&nbsp;/&nbsp;&nbsp;Get Hired
        </div>
      )}
    </div>
  );
}
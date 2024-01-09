import React, { ReactNode } from "react";
import TagList from "../lib/TagList";

interface ExpInfoProps {
  children: ReactNode;
  companyName: string;
  dateRange: string;
  jobTitle: string;
  technologies: string[];
}

interface TechTagsProps {
  companyName: string;
  dateRange: string;
  technologies: string[];
}

const TechTags: React.FC<TechTagsProps> = ({
  companyName,
  dateRange,
  technologies,
}) => (
  <ul className="mt-4 flex flex-wrap">
    {technologies.map((tech: string, i) => (
      <li
        key={`${tech}@${companyName}-${dateRange}-${i}`}
        className="text-xs text-slate-50 mr-4 mt-2 bg-emerald-500 rounded-full p-3"
      >
        {tech}
      </li>
    ))}
  </ul>
);

const ExpInfo: React.FC<ExpInfoProps> = ({
  children,
  companyName,
  dateRange,
  jobTitle,
  technologies,
}) => {
  return (
    <article className="mt-8">
      <h3 className="text-xl font-bold">
        {jobTitle} @ {companyName}
      </h3>
      <p className="text-slate-400 mt-2">{dateRange}</p>
      <p className="mt-4">{children}</p>
      <TechTags
        companyName={companyName}
        dateRange={dateRange}
        technologies={technologies}
      />
    </article>
  );
};

export default ExpInfo;

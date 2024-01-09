'use client';
import React, { ReactNode } from 'react';
import TagList from '../lib/TagList';
interface ExpInfoProps {
  children: ReactNode;
  companyName: string;
  dateRange: string;
  jobTitle: string;
  technologies: string[];
}

const ExpInfo: React.FC<ExpInfoProps> = ({ children, companyName, dateRange, jobTitle, technologies }) => {
  return (
    <article className="mt-4">
      <h3 className="text-xl font-bold">{jobTitle} @ {companyName}</h3>
      <p className="text-slate-400 mt-2">{dateRange}</p>
      <p className="mt-4">{children}</p>
      <TagList companyName={companyName} technologies={technologies} />
    </article>
  )
}

export default ExpInfo;
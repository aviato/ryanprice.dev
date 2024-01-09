interface TagListProps {
  companyName: string;
  technologies: string[];
}

const TagList: React.FC<TagListProps> = ({ companyName, technologies }) => {
  return (
    <ul className="mt-4 flex flex-wrap">
      {technologies.map((tech: string) => (
        <li
          className="text-xs text-slate-50 mr-4 mt-2 bg-gradient-to-br from-emerald-300 to-emerald-800 rounded-full p-3"
          key={`${tech}@${companyName}`}
        >
          {tech}
        </li>
      ))}
    </ul>
  );
};

export default TagList;

import '../app/globals.css'

interface TagListProps {
  companyName: string;
  dateRange: string;
  technologies: string[];
}

const TagList: React.FC<TagListProps> = ({ companyName, dateRange, technologies }) => {
  return (
    <ul className="mt-4 flex flex-wrap">
      {technologies.map((tech: string) => (
        <li
          key={`${tech}@${companyName}-${dateRange}`}
          className="text-xs text-slate-50 mr-4 mt-2 bg-emerald-500 rounded-full p-3"
        >
          {tech}
        </li>
      ))}
    </ul>
  );
};

export default TagList;

interface SubHeaderProps {
  title: string;
  imageUrl: string;
  path?: string;
}

const SubHeader: React.FC<SubHeaderProps> = ({ title, imageUrl, path }) => {
  return (
    <div
      className="w-full h-80 bg-no-repeat bg-cover bg-center relative flex items-center justify-start"
      style={{ backgroundImage: `url(${imageUrl})` }}
    >
      <div className="absolute inset-0 bg-transprent" />
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-6xl mb-10 font-bold">{title}</h1>
        {path && (
          <p className="mt-2 text-sm text-white text-start">
            HOME / PAGES /{" "}
            <span className="text-blue-500">{path.toUpperCase()}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SubHeader;

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
      <div className="relative z-10 text-center text-white px-9">
        <h1
          className="text-7xl mb-10 font-bold"
          style={{
            textShadow:
              "rgba(0, 0, 0, 0.25) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px",
          }}
        >
          {title}
        </h1>
        {path && (
          <p
            className="mt-2 text-lg text-white text-start"
            style={{
              textShadow:
                "rgba(0, 0, 0, 0.25) 0px 4px 6px, rgba(0, 0, 0, 0.17) 0px 12px 13px",
            }}
          >
            HOME / PAGES /{" "}
            <span className="text-blue-500">{path.toUpperCase()}</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default SubHeader;

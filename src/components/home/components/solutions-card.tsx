import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";

type SolutionsCardProps = {
  icon: string;
  title: string;
  description: string;
  link: string;
  index: number;
};

const text = "Learn more".split("");

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const letterVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

export default function SolutionsCard({
  icon,
  title,
  description,
  index,
}: SolutionsCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="w-full h-[370px] basis-full sm:basis-1/3 lg:basis-1/4 sm:max-w-1/3 lg:max-w-1/4 bg-[#EFF5FF] py-6 px-6 m-2 rounded-3xl flex flex-col justify-between cursor-pointer"
      whileHover={{
        scale: 1.01,
        boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.15)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        <div className="mb-6 bg-white rounded-full h-16 w-16 items-center inline-flex justify-center">
          <img src={icon} alt={title} className="h-10 w-10" />
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-[#8D8E92] mb-5 max-h-[144px] overflow-hidden">
          {description}
        </p>
      </div>

      {/* Parent container for the animated icon/text */}
      <motion.div
        layout
        className="bg-white rounded-full items-center flex justify-center px-2 overflow-hidden h-8"
        initial={{ width: "2rem" }}
        animate={{ width: isHovered ? "8rem" : "2rem" }}
        transition={{ duration: 0.7 }}
        style={{ position: "relative" }} // Make this container relative.
      >
        <motion.a
          href="#"
          className="text-blue-500 flex items-center font-medium w-full h-full relative"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: isHovered ? 1 : 0.6 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence initial={false}>
            {isHovered ? (
              <motion.div
                key="text"
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={containerVariants}
                className="flex absolute inset-0 items-center justify-center"
                // With absolute positioning, its layout is independent of its parent.
              >
                {text.map((char, i) => (
                  <motion.span
                    key={`char-${i}`}
                    variants={letterVariants}
                    exit={{ opacity: 0, y: 10 }}
                    className={`font-medium ${char === " " ? "w-4" : ""}`}
                    style={{ letterSpacing: "0.05em" }}
                  >
                    {char}
                  </motion.span>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="plus"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center absolute inset-0"
                transition={{ duration: 0.3 }}
              >
                <Plus size={20} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.a>
      </motion.div>
    </motion.div>
  );
}

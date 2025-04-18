import { Facebook, Twitter, Instagram } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

type DoctorCardProps = {
  image: string;
  address: string;
  name: string;
  index: number;
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

export default function DoctorCard({
  image,
  address,
  name,
  index,
}: DoctorCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const [responsiveHeight, setResponsiveHeight] = useState({
    base: 150,
    hover: 160,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width >= 1024) {
        // lg+
        setResponsiveHeight({ base: 110, hover: 130 });
      } else if (width >= 768) {
        // md
        setResponsiveHeight({ base: 100, hover: 130 });
      } else {
        // sm and below
        setResponsiveHeight({ base: 80, hover: 110 });
      }
    };

    handleResize(); // Initial sizing
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.15 }}
      className="mt-6 px-3 cursor-pointer"
      // Handle hover on the outer container only
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="rounded-lg relative overflow-hidden h-full md:h-[410px] lg:h-[320px] xl:h-[450px]">
        <motion.div
          className="overflow-hidden"
          animate={{ y: isHovered ? -30 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <img src={image} alt={name} className="w-full h-full object-cover" />
        </motion.div>

        {/* Info overlay */}
        <motion.div
          className="bg-[#EFF5FF] text-center pt-2 pb-4 px-4 absolute bottom-[-10px] w-full"
          // Remove inner hover handlers so the outer container controls the hover state
          animate={{
            height: isHovered ? responsiveHeight.hover : responsiveHeight.base,
            y: isHovered ? -10 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <h5 className="mb-2 font-semibold text-base md:text-2xl text-[#1B2C51]">
            {name}
          </h5>
          <p className="text-sm md:text-base text-[#0463FA]">{address}</p>
        </motion.div>

        {/* Social icons with AnimatePresence; disable pointer events on the container */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 pointer-events-none"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {[
                { icon: <Facebook size={20} />, href: "https://facebook.com" },
                { icon: <Twitter size={20} />, href: "https://twitter.com" },
                {
                  icon: <Instagram size={20} />,
                  href: "https://instagram.com",
                },
              ].map(({ icon, href }, idx) => (
                <a
                  href={href}
                  key={idx}
                  target="_blank"
                  rel="noopener noreferrer"
                  // Re-enable pointer events on the link if necessary
                  className="pointer-events-auto text-[#0463FA] inline-flex hover:text-white duration-350 ease-in-out hover:bg-[#0463FA] bg-white rounded-full p-2 shadow"
                >
                  {icon}
                </a>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

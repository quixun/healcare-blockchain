import { motion } from "framer-motion";

type Feature = {
  icon: string;
  title: string;
  description: string;
};

type FeaturesSectionProps = {
  image?: string;
};

const features: Feature[] = [
  {
    icon: "/icons/doctor.svg",
    title: "Experience",
    description: "Doctors",
  },
  {
    icon: "/icons/tick.svg",
    title: "Quality",
    description: "Services",
  },
  {
    icon: "/icons/consultation.svg",
    title: "Positive",
    description: "Consultation",
  },
  {
    icon: "/icons/support.svg",
    title: "24 Hours",
    description: "Support",
  },
];

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

const featureVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.15 },
  }),
};

export default function FeaturesSection({ image }: FeaturesSectionProps) {
  return (
    <div className="relative w-full mb-20">
      <img
        src={image ?? "/images/banner1.jpg"}
        alt="Why Choose Us"
        className="w-full h-auto object-cover"
      />

      <div
        className={`absolute inset-0 flex items-center pb-20 ${
          image ? "justify-end" : "px-4 sm:px-10 lg:px-20 justify-start"
        }`}
      >
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className={`p-6 sm:p-10 rounded-xl max-w-2xl text-white ${
            image && "flex justify-end items-center flex-col"
          }`}
        >
          <motion.button
            custom={0}
            variants={textVariants}
            className="text-base border border-white rounded-4xl px-6 mb-4 py-1"
          >
            Features
          </motion.button>

          <motion.h2
            custom={0.2}
            variants={textVariants}
            className="text-2xl sm:text-3xl lg:text-5xl font-bold mb-4"
          >
            Why Choose Us
          </motion.h2>

          <motion.p
            custom={0.4}
            variants={textVariants}
            className="md:block hidden mb-6 text-sm lg:text-sm md:max-w-[70%] lg:max-w-[100%]"
          >
            We are committed to delivering exceptional medical care with
            compassion and precision. With a team of highly experienced
            professionals and access to advanced technologies, we ensure every
            patient receives personalized attention, accurate diagnosis, and
            timely support — whenever and wherever it’s needed.
          </motion.p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 text-sm sm:text-base font-medium text-white"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={featureVariants}
                className="flex items-center space-x-2 p-2"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                    delay: index * 0.15,
                  }}
                  className="bg-white rounded-full h-9 w-9 lg:h-16 lg:w-16 items-center inline-flex justify-center"
                >
                  <img
                    src={feature.icon}
                    alt={feature.title}
                    className="h-5 w-5 md:w-8  md:h-8"
                  />
                </motion.div>

                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-xl font-semibold">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

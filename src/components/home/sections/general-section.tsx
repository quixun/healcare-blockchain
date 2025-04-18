import { motion } from "framer-motion";
import Carousel from "../components/carousel";

type beginningSectionType = {
  title: string;
  number: number;
};

export default function GeneralSection() {
  const beginningSection: beginningSectionType[] = [
    { title: "Expert Doctors", number: 123 },
    { title: "Medical Stuff", number: 1234 },
    { title: "Total Patients", number: 12345 },
  ];

  return (
    <div className="items-center h-[calc(100vh-90px)] mb-20 lg:mb-0 flex-col lg:flex-row flex w-ful lg:justify-between">
      <div className="w-full order-2 lg:order-1 basis-0 max-w-full lg:basis-1/2 flex flex-col lg:max-w-1/2 bg-gradient-to-l justify-center items-center from-blue-300 to-blue-600 h-auto lg:h-full py-10 lg:py-30 px-6 lg:px-12">
        <motion.h1
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          className="mb-12 text-3xl lg:text-5xl font-[900] text-white"
        >
          Good Health Is The Root Of All Happiness
        </motion.h1>

        <div className="flex flex-wrap w-full">
          <div className="basis-auto gap-2 flex w-full lg:justify-start justify-center items-center">
            {beginningSection.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.2, duration: 0.8 }}
                className="pl-6 border-l border-[#EFF5FF]"
              >
                <h2 className="text-xl lg:text-3xl font-bold mb-2 text-white">
                  {item.number}
                </h2>
                <p className="lg:text-lg text-base text-white">{item.title}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <Carousel />
    </div>
  );
}

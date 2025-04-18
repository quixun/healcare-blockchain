import { CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

type AboutUsSectionProps = {
  children: React.ReactNode;
};

export default function AboutUsSection({ children }: AboutUsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1 }}
      className="items-center flex flex-col lg:flex-row w-full justify-center gap-4 max-h-[700px] h-full lg:h-screen px-3 mx-auto pt-20 lg:pt-5 mb-30 md:my-30 lg:my-0"
    >
      {children}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1, delay: 0.3 }}
      >
        <button className="text-base border border-blue-200 rounded-4xl px-6 mb-4 py-1 text-[#8D8E92]">
          About Us
        </button>

        <h1 className="mb-4 text-3xl lg:text-[40px] font-bold text-[#1B2C51]">
          Why You Should Trust Us? Get Know About Us!
        </h1>

        <p className="mb-2 text-sm lg:text-md text-[#8D8E92]">
          Your health matters to us. That’s why our app uses secure blockchain
          technology to keep your medical data safe and private.
        </p>
        <p className="text-sm lg:text-md text-[#8D8E92]">
          We work with trusted doctors and pharmacists to provide reliable care,
          easy access to medicine, and the support you need — anytime, anywhere.
        </p>

        <div className="flex flex-col gap-3 py-6">
          {[
            "Quality health care",
            "Only Qualified Doctors",
            "Medical Research Professionals",
          ].map((text, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 + i * 0.2 }}
              className="flex items-center text-sm lg:text-md text-[#8D8E92] mb-2"
            >
              <CheckCircle className="text-blue-500 w-5 h-5" />
              <span className="ml-2">{text}</span>
            </motion.p>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="bg-blue-500 cursor-pointer hover:bg-blue-500/80 duration-200 ease-in-out py-2 px-5 text-sm lg:text-base lg:py-4 lg:px-12 rounded-4xl text-white font-medium"
        >
          Read More
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

import { motion } from "motion/react";
import SolutionsCard from "../components/solutions-card";

type HealthCareSolutions = {
  icon: string;
  title: string;
  description: string;
  link: string;
};

const healthCareSolutions: HealthCareSolutions[] = [
  {
    icon: "/icons/cardiology-svgrepo-com.svg",
    title: "Cardiology",
    description:
      "Comprehensive heart care, from diagnosis to treatment, managed by experienced cardiologists using the latest medical technology.",
    link: "#",
  },
  {
    icon: "/icons/punlmonary.svg",
    title: "Pulmonary",
    description:
      "Advanced care for lung and respiratory conditions, helping patients breathe easier with personalized treatment plans.",
    link: "#",
  },
  {
    icon: "/icons/brain.svg",
    title: "Neurology",
    description:
      "Expert diagnosis and management of brain and nervous system disorders, tailored to support long-term neurological health.",
    link: "#",
  },
  {
    icon: "/icons/wheel-chair.svg",
    title: "Orthopedics",
    description:
      "Effective solutions for bone, joint, and muscle conditions to restore movement and relieve pain with surgical and non-surgical care.",
    link: "#",
  },
  {
    icon: "/icons/teeth.svg",
    title: "Dental Surgery",
    description:
      "Professional dental care including extractions, implants, and oral surgery to ensure a healthy, confident smile.",
    link: "#",
  },
  {
    icon: "/icons/labotary.svg",
    title: "Laboratory",
    description:
      "Fast, accurate lab testing and diagnostics to support early detection and better decision-making in your healthcare journey.",
    link: "#",
  },
];

export default function ServicesSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1 }}
      className="h-full flex flex-col justify-start items-center mb-30"
    >
      <motion.button
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-base border border-blue-200 rounded-4xl px-6 mb-4 py-1 text-[#8D8E92]"
      >
        Services
      </motion.button>

      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="mb-12 text-3xl lg:text-[40px] font-bold text-[#1B2C51]"
      >
        Health Care Solutions
      </motion.h1>

      <div className="flex flex-row justify-center flex-wrap px-6">
        {healthCareSolutions.map((solution, index) => (
          <SolutionsCard key={index} {...solution} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

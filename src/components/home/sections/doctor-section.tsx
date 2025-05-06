import DoctorCard from "../components/doctor-card";
import { motion } from "framer-motion";

type Doctor = {
  image: string;
  address: string;
  name: string;
};

const doctors: Doctor[] = [
  {
    image: "/images/doctors/doctor-1.jpg",
    name: "Dr. Jane",
    address: "Cardiologist",
  },
  {
    name: "Dr. Doe",
    address: "Dermatologist",
    image: "/images/doctors/doctor-2.jpg",
  },
  {
    name: "Dr. Emily",
    address: "Pediatrician",
    image: "/images/doctors/doctor-3.jpg",
  },
  {
    name: "Dr. Smith",
    address: "Pulmonology",
    image: "/images/doctors/doctor-4.jpg",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

export default function DoctorSection() {
  return (
    <motion.div
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="h-full flex flex-col justify-start items-center my-20 px-3"
    >
      <button className="text-base border border-blue-200 rounded-4xl px-6 mb-4 py-1 text-[#8D8E92]">
        Doctors
      </button>
      <h1 className="mb-12 text-3xl lg:text-[40px] font-bold text-[#1B2C51]">
        Our Experienced Doctors
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 px-3 gap-4 w-full">
        {doctors.map((doctor, index) => (
          <DoctorCard {...doctor} key={index} index={index} />
        ))}
      </div>
    </motion.div>
  );
}

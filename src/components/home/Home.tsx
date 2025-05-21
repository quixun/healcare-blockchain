import { lazy, Suspense } from "react";
import LazyLoad from "../common/lazy-load";
import GeneralSection from "./sections/general-section";
import { motion } from "motion/react";

const AboutUsSection = lazy(() => import("./sections/about-us-section"));
const FeaturesSection = lazy(() => import("./sections/services-section"));
const ServicesSection = lazy(() => import("./sections/features-section"));
const DoctorSection = lazy(() => import("./sections/doctor-section"));
const AppointmentSection = lazy(() => import("./sections/appointment-section"));

const Home = () => {
  return (
    <div className="pt-5 pb-14 gap-2">
      <GeneralSection />
      <Suspense fallback={<div>Loading About...</div>}>
        <LazyLoad>
          <AboutUsSection>
            <motion.img
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1 }}
              src="/images/head_bg.webp"
              alt=""
              className="max-w-full max-h-[500px] lg:max-w-[700px] w-full h-full object-contain"
            />
          </AboutUsSection>
        </LazyLoad>
      </Suspense>

      <Suspense fallback={<div>Loading Features...</div>}>
        <LazyLoad>
          <FeaturesSection />
        </LazyLoad>
      </Suspense>

      <Suspense fallback={<div>Loading Services...</div>}>
        <LazyLoad>
          <ServicesSection />
        </LazyLoad>
      </Suspense>

      <Suspense fallback={<div>Loading Doctors...</div>}>
        <LazyLoad>
          <DoctorSection />
        </LazyLoad>
      </Suspense>

      <Suspense fallback={<div>Loading Appointment...</div>}>
        <LazyLoad>
          <AppointmentSection />
        </LazyLoad>
      </Suspense>
    </div>
  );
};

export default Home;

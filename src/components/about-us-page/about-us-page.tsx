import { motion } from "motion/react";
import SubHeader from "../../layouts/sub-header/sub-header";
import AboutUsSection from "../home/sections/about-us-section";
import { Suspense, lazy } from "react";
import LazyLoad from "../common/lazy-load";

const DoctorSection = lazy(() => import("../home/sections/doctor-section"));
const FeaturesSection = lazy(() => import("../home/sections/features-section"));

export default function AboutUsPage() {
  return (
    <div className="my-20">
      <SubHeader
        title="About Us"
        path="about"
        imageUrl="/images/about-us-banner.jpg"
      />
      <AboutUsSection>
        <div className="px-6">
          <div className="flex flex-col">
            <motion.img
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1 }}
              className="rounded-lg self-end w-[75%] max-w-full h-auto"
              src="/images/doctors/about-us/about-1.jpg"
              alt=""
            />
            <motion.img
              initial={{ opacity: 0, y: -50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1 }}
              src="/images/doctors/about-us/about-2.jpg"
              alt=""
              className="-mt-[25%] rounded-lg bg-white pt-4 pr-4 w-[50%] h-auto max-w-full"
            />
          </div>
        </div>
      </AboutUsSection>

      <Suspense fallback={<div>Loading Features...</div>}>
        <LazyLoad>
          <div className="my-5">
            <FeaturesSection image="/images/banner2.jpg" />
          </div>
        </LazyLoad>
      </Suspense>

      <Suspense fallback={<div>Loading Doctor...</div>}>
        <LazyLoad>
          <DoctorSection />
        </LazyLoad>
      </Suspense>
    </div>
  );
}

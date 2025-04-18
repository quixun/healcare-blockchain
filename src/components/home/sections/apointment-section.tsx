import { motion } from "motion/react";
import { Controller, useForm } from "react-hook-form";

type AppointmentFormData = {
  name: string;
  email: string;
  mobile: string;
  doctor: string;
  date: string;
  time: string;
  description: string;
};

const textVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay },
  }),
};

const contactUs = [
  { icon: "/icons/phone.svg", text: "Call Us Now", link: "+1234567890" },
  {
    icon: "/icons/mail.svg",
    text: "Mail Us Now",
    link: "xuanphan742@gmail.com",
  },
];

export default function ApointmentSection() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AppointmentFormData>();

  const onSubmit = (data: AppointmentFormData) => {
    console.log("Submitted Data:", data);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 1 }}
      className="w-full flex py-12 px-3"
    >
      <div className="mx-auto flex flex-col gap-4 md:flex-row w-full max-w-full sm:max-w-[540px] md:max-w-[720px] lg:max-w-[960px]">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-col basis-full md:basis-1/2 items-start h-full px-6 justify-end"
        >
          <motion.button
            custom={0}
            variants={textVariants}
            className="text-base border border-[#C7DCFB] inline-block rounded-4xl px-6 mb-4 py-1 text-[#8D8E92]"
          >
            Appointment
          </motion.button>
          <h1 className="text-[#1B2C51] mb-6 font-bold text-4xl">
            Make An Appointment To Visit Our Doctor
          </h1>
          <p className="text-[#8D8E92]">
            Take the first step towards better health. Our doctors are here to
            help you with personalized care. Book an appointment today and
            experience professional medical assistance tailored to your needs.
          </p>
          <>
            {contactUs.map((item, index) => (
              <div
                key={index}
                className="p-8 mt-6 w-full bg-[#EFF5FF] flex items-center rounded-lg"
              >
                <div className="bg-white rounded-full items-center flex justify-center px-2 overflow-hidden h-14 w-14">
                  <img src={item.icon} alt="icon" />
                </div>
                <div className="ml-6 flex flex-col items-start justify-start">
                  <p className="mb-2 text-lg text-[#8D8E92]">{item.text}</p>
                  <p className="text-[#1B2C51] text-xl font-bold">
                    {item.link}
                  </p>
                </div>
              </div>
            ))}
          </>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex flex-col basis-full md:basis-1/2 items-center justify-start px-6"
        >
          <div className="rounded-lg bg-[#EFF5FF] p-12 flex items-center h-full w-full">
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <Controller
                    name="name"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Your name"
                        className="w-full p-2 rounded-md border"
                      />
                    )}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-sm">
                      Name is required
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Controller
                    name="email"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="email"
                        placeholder="Your email"
                        className="w-full p-2 rounded-md border"
                      />
                    )}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-sm">
                      Email is required
                    </span>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <Controller
                    name="mobile"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        placeholder="Your mobile"
                        className="w-full p-2 rounded-md border"
                      />
                    )}
                  />
                  {errors.mobile && (
                    <span className="text-red-500 text-sm">
                      Mobile is required
                    </span>
                  )}
                </div>

                {/* Doctor */}
                <div>
                  <Controller
                    name="doctor"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 rounded-md border"
                      >
                        <option value="">Select a doctor</option>
                        <option value="dr-smith">Dr. Smith</option>
                        <option value="dr-jones">Dr. Jones</option>
                        <option value="dr-williams">Dr. Williams</option>
                      </select>
                    )}
                  />
                  {errors.doctor && (
                    <span className="text-red-500 text-sm">
                      Please select a doctor
                    </span>
                  )}
                </div>

                {/* Date */}
                <div>
                  <Controller
                    name="date"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="date"
                        className="w-full p-2 rounded-md border"
                      />
                    )}
                  />
                  {errors.date && (
                    <span className="text-red-500 text-sm">
                      Date is required
                    </span>
                  )}
                </div>

                {/* Time */}
                <div>
                  <Controller
                    name="time"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="time"
                        className="w-full p-2 rounded-md border"
                      />
                    )}
                  />
                  {errors.time && (
                    <span className="text-red-500 text-sm">
                      Time is required
                    </span>
                  )}
                </div>
              </div>

              <div>
                <Controller
                  name="description"
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      rows={4}
                      placeholder="Write your health issue here..."
                      className="w-full p-2 rounded-md border"
                    />
                  )}
                />
                {errors.description && (
                  <span className="text-red-500 text-sm">
                    Description is required
                  </span>
                )}
              </div>

              <div className="flex justify-center">
                <button
                  type="submit"
                  className="bg-blue-600 w-full text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Book Appointment
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

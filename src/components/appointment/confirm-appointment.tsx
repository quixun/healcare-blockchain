import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, Edit } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../features/store";
import { clearAppointment, confirmAppointment } from "@/features/appointment/appointmentSlice";

export default function ConfirmAppointment() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { appointmentData, isConfirmed } = useSelector((state: RootState) => state.appointment);

  if (!appointmentData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">No Appointment Data Found</h1>
        <button
          onClick={() => navigate("/")}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Return to Home
        </button>
      </div>
    );
  }

  const handleConfirm = () => {
    dispatch(confirmAppointment());
    // Here you would typically make an API call to save the appointment
    // console.log("Appointment confirmed:", appointmentData);
    // Navigate to success page or show success message
  };

  const handleModify = () => {
    navigate("/");
  };

  const handleCancel = () => {
    dispatch(clearAppointment());
    navigate("/");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-50 py-12 mt-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Confirm Your Appointment
            </h1>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-lg text-gray-900">{appointmentData.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1 text-lg text-gray-900">{appointmentData.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Mobile</h3>
                  <p className="mt-1 text-lg text-gray-900">{appointmentData.mobile}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Doctor</h3>
                  <p className="mt-1 text-lg text-gray-900">{appointmentData.doctor}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date</h3>
                  <p className="mt-1 text-lg text-gray-900">{appointmentData.date}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Time</h3>
                  <p className="mt-1 text-lg text-gray-900">{appointmentData.time}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1 text-lg text-gray-900">{appointmentData.description}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleConfirm}
                disabled={isConfirmed}
                className={`flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                  isConfirmed ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                {isConfirmed ? 'Appointment Confirmed' : 'Confirm Appointment'}
              </button>
              <button
                onClick={handleModify}
                disabled={isConfirmed}
                className={`flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white ${
                  isConfirmed ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              >
                <Edit className="w-5 h-5 mr-2" />
                Modify Appointment
              </button>
              <button
                onClick={handleCancel}
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

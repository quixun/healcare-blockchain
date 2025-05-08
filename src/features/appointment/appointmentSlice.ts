import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AppointmentFormData = {
  name: string;
  email: string;
  mobile: string;
  doctor: string;
  date: string;
  time: string;
  description: string;
};

type AppointmentState = {
  appointmentData: AppointmentFormData | null;
  isConfirmed: boolean;
};

const initialState: AppointmentState = {
  appointmentData: null,
  isConfirmed: false,
};

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    setAppointmentData(
      state,
      action: PayloadAction<AppointmentFormData>
    ) {
      state.appointmentData = action.payload;
    },
    confirmAppointment(state) {
      state.isConfirmed = true;
    },
    clearAppointment(state) {
      state.appointmentData = null;
      state.isConfirmed = false;
    },
  },
});

export const { setAppointmentData, confirmAppointment, clearAppointment } = appointmentSlice.actions;
export default appointmentSlice.reducer;

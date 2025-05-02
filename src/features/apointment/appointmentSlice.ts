import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type appointmentState = {
  name: string;
  price: number;
}

const initialState: appointmentState = { name: "", price: 0 };

const selectedProductSlice = createSlice({
  name: "selectedProduct",
  initialState,
  reducers: {
    selectProduct(
      _state,
      action: PayloadAction<{ name: string; price: number }>
    ) {
      return action.payload;
    },
    clearProduct() {
      return initialState;
    },
  },
});

export const { selectProduct, clearProduct } = selectedProductSlice.actions;
const selectedProductReducer = selectedProductSlice.reducer;
export default selectedProductReducer;

import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface SelectedProductState {
  name: string;
  price: number;
}

const initialState: SelectedProductState = { name: "", price: 0 };

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

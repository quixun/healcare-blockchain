import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AccountState {
  address: string | null;
  balance: string | null;
  nonce: string | null;
  status: boolean;
  name: string;
}

interface UpdateAccountPayload {
  balance: string | null;
  nonce: string | null;
}

const initialState: AccountState = {
  address: null,
  balance: null,
  nonce: null,
  status: false,
  name: "",
};

const accountSlice = createSlice({
  name: "account",
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AccountState>) => {
      return { ...state, ...action.payload };
    },

    logout: (state) => {
      state.address = null;
      state.balance = null;
      state.nonce = null;
      state.status = false;
      state.name = "";
    },

    updateAcount: (state, action: PayloadAction<UpdateAccountPayload>) => {
      return { ...state, ...action.payload };
    },
  },
});

export const { logout, login, updateAcount } = accountSlice.actions;
const acountReducer = accountSlice.reducer;
export default acountReducer;

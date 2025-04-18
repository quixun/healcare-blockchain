import { configureStore } from "@reduxjs/toolkit";
import acountReducer from "./account/accountSlice";
import selectedProductReducer from "./product/productSlice";
// ...

export const store = configureStore({
  reducer: {
    account: acountReducer,
    product: selectedProductReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;

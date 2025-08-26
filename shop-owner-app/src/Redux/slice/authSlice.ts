// src/store/authSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AuthState = {
  id?: number | null;
  role?: string | null;
  shopId?: number | null;
  token?: string | null;
  user?: any | null; // optional full user object
};

const initialState: AuthState = {
  id: null,
  role: null,
  shopId: null,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state: { id: any; role: any; shopId: any; token: any; user: any; }, action: PayloadAction<Partial<AuthState>>) {
      const payload = action.payload;
      if (payload.id !== undefined) state.id = payload.id;
      if (payload.role !== undefined) state.role = payload.role;
      if (payload.shopId !== undefined) state.shopId = payload.shopId;
      if (payload.token !== undefined) state.token = payload.token;
      if (payload.user !== undefined) state.user = payload.user;
    },
    clearUser(state: { id: null; role: null; shopId: null; token: null; user: null; }) {
      state.id = null;
      state.role = null;
      state.shopId = null;
      state.token = null;
      state.user = null;
    },
  },
});

export const { setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;

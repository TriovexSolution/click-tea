// profileSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/api";

export const fetchUserProfile = createAsyncThunk(
  "profile/fetchUserProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
    //   console.log(token);
      
      if (!token) {
        return rejectWithValue("No auth token found");
      }

      const res = await axios.get(`${BASE_URL}/api/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Always return a normalized object, even if API fails
      const safeData = {
        userId: res.data?.userId ?? null,
        username: res.data?.username ?? "",
        email: res.data?.userEmail ?? "",
        phone: res.data?.userPhone ?? "",
        coinBalance: res.data?.coin ?? 0, // 👈 normalize here
        role: res.data?.role ?? "user",
        userImage: res.data?.userImage ?? null,
      };

      return safeData;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Profile fetch failed");
    }
  }
);

interface ProfileState {
  data: {
    userId: number | null;
    username: string;
    email: string;
    phone: string;
    coinBalance: number;
    role: string;
    userImage: string | null;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.data = null; // reset stale profile
      });
  },
});

export const { clearProfile } = profileSlice.actions;
export default profileSlice.reducer;

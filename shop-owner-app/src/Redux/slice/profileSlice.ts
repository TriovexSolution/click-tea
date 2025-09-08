
import axiosClient from "@/src/assets/api/client";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
type ProfileData = {
  userId: number | null;
  username: string;
  email: string;
  phone: string;
  coinBalance: number;
  role: string;
  userImage: string | null;
  shopId: number | null; // Allow null
};

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
  lastFetchedAt?: number | null;
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  lastFetchedAt: null,
};

export const fetchUserProfile = createAsyncThunk<
  ProfileData,
  void,
  { rejectValue: string }
>("profile/fetchUserProfile", async (_, thunkAPI) => {
  try {
    if (thunkAPI.signal.aborted) return thunkAPI.rejectWithValue("aborted");

    const CancelToken = (axiosClient as any).CancelToken;
    const source = CancelToken ? CancelToken.source() : null;
    if (source && thunkAPI.signal) {
      thunkAPI.signal.addEventListener("abort", () => {
        source.cancel("thunk aborted by caller");
      });
    }

    const res = await axiosClient.get("/api/profile", {
      cancelToken: source?.token,
    });

    const d = res.data ?? {};
    const safe: ProfileData = {
      userId: d.userId ?? d.id ?? null,
      username: d.username ?? d.name ?? "",
      email: d.userEmail ?? d.email ?? "",
      phone: d.userPhone ?? d.phone ?? "",
      coinBalance: Number(d.coin ?? d.coins ?? 0),
      role: d.role ?? "user",
      userImage: d.userImage ?? d.avatar ?? null,
      shopId: d.shopId ?? d.shop_id ?? null, // Handle null shopId
    };

    return safe;
  } catch (err: any) {
    if (axiosClient.isCancel?.(err) || err?.message === "thunk aborted by caller")
      return thunkAPI.rejectWithValue("request_canceled");

    const msg = err.response?.data?.message || err.message || "Profile fetch failed";
    return thunkAPI.rejectWithValue(msg);
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.error = null;
      state.loading = false;
      state.lastFetchedAt = null;
    },
    setProfile: (state, action: PayloadAction<Partial<ProfileData>>) => {
      state.data = { ...(state.data ?? ({} as ProfileData)), ...action.payload } as ProfileData;
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
        state.error = null;
        state.lastFetchedAt = Date.now();
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload ?? String(action.error?.message ?? "unknown");
        state.data = null;
      });
  },
});

export const { clearProfile, setProfile } = profileSlice.actions;
export default profileSlice.reducer;
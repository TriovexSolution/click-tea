// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
// import { RootState } from "../store";
// import { BASE_URL } from "@/api";



// interface ServiceState {
//   serviceable: boolean | null;
//   checking: boolean;
//   nearestShop: any | null;
// }

// const initialState: ServiceState = {
//   serviceable: null,
//   checking: false,
//   nearestShop: null,
// };

// // Async thunk to call backend API
// export const checkAvailability = createAsyncThunk(
//   "service/checkAvailability",
//   async ({ lat, lng }: { lat: number; lng: number }) => {
//     const res = await axios.get(`${BASE_URL}/api/service/availability`, {
//       params: { lat, lng, radiusKm: 3 },
//     });
//     return res.data;
//   }
// );

// const serviceSlice = createSlice({
//   name: "service",
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder
//       .addCase(checkAvailability.pending, (state) => {
//         state.checking = true;
//       })
//       .addCase(checkAvailability.fulfilled, (state, action) => {
//         state.checking = false;
//         state.serviceable = action.payload.available;
//         state.nearestShop = action.payload.nearestShop || null;
//       })
//       .addCase(checkAvailability.rejected, (state) => {
//         state.checking = false;
//         state.serviceable = false;
//       });
//   },
// });

// export const selectService = (state: RootState) => state.service;

// export default serviceSlice.reducer;
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { BASE_URL } from "@/api";



interface ServiceState {
  serviceable: boolean | null;
  checking: boolean;
  nearestShop: any | null;
}

const initialState: ServiceState = {
  serviceable: null,
  checking: false,
  nearestShop: null,
};

// Async thunk to call backend API
export const checkAvailability = createAsyncThunk(
  "service/checkAvailability",
  async ({ lat, lng }: { lat: number; lng: number }) => {
    const res = await axios.get(`${BASE_URL}/api/service/availability`, {
      params: { lat, lng, radiusKm: 3 },
    });
    return res.data;
  }
);

const serviceSlice = createSlice({
  name: "service",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkAvailability.pending, (state) => {
        state.checking = true;
      })
      .addCase(checkAvailability.fulfilled, (state, action) => {
        state.checking = false;
        state.serviceable = action.payload.available;
        state.nearestShop = action.payload.nearestShop || null;
      })
      .addCase(checkAvailability.rejected, (state) => {
        state.checking = false;
        state.serviceable = false;
      });
  },
});

export const selectService = (state: RootState) => state.service;

export default serviceSlice.reducer;

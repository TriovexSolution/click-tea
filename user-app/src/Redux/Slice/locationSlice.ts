// // src/store/locationSlice.ts
// import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// interface LocationState {
//   latitude: number | null;
//   longitude: number | null;
//   lastUpdated: number | null; // timestamp
// }

// const initialState: LocationState = {
//   latitude:null,// here remove null foo testing no service available
//   longitude: null,// here remove null 
//   lastUpdated: null,
// };

// const locationSlice = createSlice({
//   name: 'location',
//   initialState,
//   reducers: {
//     setLocation: (
//       state,
//       action: PayloadAction<{ latitude: number; longitude: number }>
//     ) => {
//       state.latitude = action.payload.latitude;
//       state.longitude = action.payload.longitude;
//       state.lastUpdated = Date.now();
//     },
//     clearLocation: (state) => {
//       state.latitude = null;
//       state.longitude = null;
//       state.lastUpdated = null;
//     },
//   },
// });

// export const { setLocation, clearLocation } = locationSlice.actions;
// export default locationSlice.reducer;
// src/store/locationSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  lastUpdated: number | null; // timestamp
}

const initialState: LocationState = {
  latitude:null,// here remove null foo testing no service available
  longitude: null,// here remove null 
  lastUpdated: null,
};

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    setLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number }>
    ) => {
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.lastUpdated = Date.now();
    },
    clearLocation: (state) => {
      state.latitude = null;
      state.longitude = null;
      state.lastUpdated = null;
    },
  },
});

export const { setLocation, clearLocation } = locationSlice.actions;
export default locationSlice.reducer;

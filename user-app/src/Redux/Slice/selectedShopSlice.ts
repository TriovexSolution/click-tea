// src/Redux2/Slice2/selectedShopSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface SelectedShopState {
  shopId: number | null;
}

const initialState: SelectedShopState = {
  shopId: null,
};

const selectedShopSlice = createSlice({
  name: "selectedShop",
  initialState,
  reducers: {
    setSelectedShopId: (state, action: PayloadAction<number>) => {
      state.shopId = action.payload;
    },
    clearSelectedShopId: (state) => {
      state.shopId = null;
    },
  },
});

export const { setSelectedShopId, clearSelectedShopId } = selectedShopSlice.actions;
export const selectSelectedShopId = (state: RootState) => state.selectedShop.shopId;
export default selectedShopSlice.reducer;

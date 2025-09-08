
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BASE_URL } from "@/api";
import type { RootState } from "../store";

export interface CartItem {
  cartId?: number;
  menuId: number;
  variantId?: number | null;
  quantity: number;
  addons?: any[];
  notes?: string;
  price?: number; // old field
  snapshotPrice?: number;
  snapshotName?: string | null;
  imageUrl?: string | null;
  subtotal?: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = { items: [], loading: false, error: null };

const authHeader = async () => {
  const token = await AsyncStorage.getItem("authToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// addToCart - expects backend to return res.data.cartItem
export const addToCartAsync = createAsyncThunk<
  CartItem | void,
  { shopId: number; menuId: number; variantId?: number | null; quantity?: number; addons?: any[]; notes?: string },
  { rejectValue: string }
>(
  "cart/addToCart",
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const headers = await authHeader();
      const res = await axios.post(`${BASE_URL}/api/cart/add`, data, { headers });
      if (res.data?.cartItem) return res.data.cartItem as CartItem;
      if (res.data?.cartId) {
        // fallback: re-fetch canonical cart
        await dispatch(fetchCartAsync({ shopId: data.shopId }));
        return;
      }
      return;
    } catch (err: any) {
      console.error("Add to cart failed:", err?.response?.data ?? err);
      return rejectWithValue(err?.response?.data?.message || "Add to cart failed");
    }
  }
);

// updateCartItem - server may return { deleted: true, cartId } or { deleted:false, cartItem }
export const updateCartItemAsync = createAsyncThunk<
  any,
  { cartId: number; quantity: number; addons?: any[]; notes?: string; variantId?: number | null },
  { rejectValue: string }
>("cart/updateCartItem", async (payload, { rejectWithValue }) => {
  try {
    const headers = await authHeader();
    const res = await axios.put(`${BASE_URL}/api/cart/update/${payload.cartId}`, payload, { headers });
    return res.data; // expect { deleted, cartItem?, cartId? } OR cartItem directly
  } catch (err: any) {
    console.error("Update cart item failed:", err?.response?.data ?? err);
    return rejectWithValue(err?.response?.data?.message || "Update failed");
  }
});

// fetchCart
export const fetchCartAsync = createAsyncThunk<CartItem[], { shopId: number }, { rejectValue: string }>(
  "cart/fetchCart",
  async ({ shopId }, { rejectWithValue }) => {
    try {
      const headers = await authHeader();
      const res = await axios.get(`${BASE_URL}/api/cart/${shopId}`, { headers });
      if (Array.isArray(res.data)) return res.data;
      if (Array.isArray(res.data?.items)) return res.data.items;
      if (Array.isArray(res.data?.data)) return res.data.data;
      return [];
    } catch (err: any) {
      console.error("Fetch cart failed:", err?.response?.data ?? err);
      return rejectWithValue(err?.response?.data?.message || "Fetch cart failed");
    }
  }
);

export const removeFromCartAsync = createAsyncThunk<number, number, { rejectValue: string }>(
  "cart/removeFromCart",
  async (cartId, { rejectWithValue }) => {
    try {
      const headers = await authHeader();
      await axios.delete(`${BASE_URL}/api/cart/${cartId}`, { headers });
      return cartId;
    } catch (err: any) {
      console.error("Remove error:", err?.response?.data ?? err);
      return rejectWithValue(err?.response?.data?.message || "Remove failed");
    }
  }
);

export const placeOrderAsync = createAsyncThunk<any, { cartItems: any[]; shopId: number; totalAmount: number; payment_type: string; delivery_note?: string }, { rejectValue: string }>(
  "cart/placeOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const headers = await authHeader();
      const res = await axios.post(`${BASE_URL}/api/order/place`, payload, { headers });
      return res.data;
    } catch (err: any) {
      console.error("Place order failed:", err?.response?.data ?? err);
      return rejectWithValue(err?.response?.data?.message || "Order failed");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart(state) {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // addToCart
    builder.addCase(addToCartAsync.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(addToCartAsync.fulfilled, (state, action) => {
      state.loading = false;
      if (action.payload && action.payload.cartId) {
        const exists = state.items.find((i) => i.cartId === action.payload!.cartId);
        if (!exists) state.items.push(action.payload as CartItem);
      }
      state.error = null;
    });
    builder.addCase(addToCartAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // ---------- IMPORTANT: optimistic removal on pending when qty === 0 ----------
    builder.addCase(updateCartItemAsync.pending, (state, action) => {
      // action.meta.arg holds the original thunk args
      const arg = action.meta.arg as { cartId: number; quantity: number };
      if (arg && arg.quantity === 0 && arg.cartId) {
        // remove immediately for instant UI feedback
        state.items = state.items.filter((i) => i.cartId !== arg.cartId);
      }
    });

    // update fulfilled - handle server shapes
    builder.addCase(updateCartItemAsync.fulfilled, (state, action) => {
      const payload = action.payload;
      // If backend returns { deleted: true, cartId }
      if (payload && payload.deleted) {
        state.items = state.items.filter((i) => i.cartId !== payload.cartId);
        return;
      }

      // If backend returned wrapped object like { cartItem: {...} }
      if (payload && payload.cartItem) {
        const updated = payload.cartItem as CartItem;
        const idx = state.items.findIndex((i) => i.cartId === updated.cartId);
        if (idx !== -1) state.items[idx] = updated;
        else state.items.push(updated); // safety
        return;
      }

      // If backend returned just the updated cart item
      if (payload && payload.cartId && typeof payload.quantity === "number") {
        const idx = state.items.findIndex((i) => i.cartId === payload.cartId);
        if (idx !== -1) {
          state.items[idx] = { ...state.items[idx], ...payload };
        } else {
          // If not present and quantity > 0, add it
          if (payload.quantity > 0) state.items.push(payload as CartItem);
        }
      }
    });

    builder.addCase(updateCartItemAsync.rejected, (state, action) => {
      // If request failed after optimistic removal, we don't have a direct way to restore previous item here.
      // Best remedy: component should call fetchCartAsync on error to re-sync.
      state.error = action.payload as string;
    });

    // fetchCart
    builder.addCase(fetchCartAsync.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(fetchCartAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // remove explicit
    builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
      state.items = state.items.filter((i) => i.cartId !== action.payload);
    });
    builder.addCase(removeFromCartAsync.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    // place order
    builder.addCase(placeOrderAsync.fulfilled, (state) => {
      state.items = [];
      state.error = null;
    });
    builder.addCase(placeOrderAsync.rejected, (state, action) => {
      state.error = action.payload as string;
    });
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items || [];
export const selectCartCount = (state: RootState) => (state.cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
export const selectCartTotalPrice = (state: RootState) =>
  (state.cart.items || []).reduce((sum, item) => {
    const unit = typeof item.snapshotPrice === "number" ? item.snapshotPrice : (item.price ?? 0);
    return sum + unit * (item.quantity || 0);
  }, 0);


import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL } from "@/api";
import { RootState } from "../store";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Types
interface CartItem {
  cartId?: number;
  menuId: number;
  quantity: number;
  addons?: any[];
  notes?: string;
  price?: number;
  subtotal?: number;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
};

// 🔄 Add to Cart
export const addToCartAsync = createAsyncThunk(
  "cart/addToCart",
  async (data: CartItem & { shopId: number }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.post(`${BASE_URL}/api/cart/add`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { ...data, cartId: res.data.cartId }; // ✅ Include backend cartId

    } catch (err: any) {
      console.error("Add to cart failed:", err.response?.data);
      return rejectWithValue(err.response?.data?.message || "Add to cart failed");
    }
  }
);

// ✏️ Update Cart Item
export const updateCartItemAsync = createAsyncThunk(
  "cart/updateCartItem",
  async (
    {
      cartId,
      quantity,
      addons,
      notes,
    }: { cartId: number; quantity: number; addons?: any[]; notes?: string },
    { rejectWithValue }
  ) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.put(
        `${BASE_URL}/api/cart/update/${cartId}`,
        { quantity, addons, notes },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return { cartId, quantity, addons, notes };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Update failed");
    }
  }
);

// ❌ Clear Cart
export const clearCartAsync = createAsyncThunk("cart/clearCart", async (_, { rejectWithValue }) => {
  try {
    const token = await AsyncStorage.getItem("authToken");
    await axios.delete(`${BASE_URL}/api/cart/clear`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return true;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.message || "Clear cart failed");
  }
});

// ✅ Place Order
export const placeOrderAsync = createAsyncThunk(
  "cart/placeOrder",
  async (
    {
      cartItems,
      shopId,
      totalAmount,
      payment_type,
      delivery_note,
    }: {
      cartItems: CartItem[];
      shopId: number;
      totalAmount: number;
      payment_type: string;
      delivery_note?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.post(
        `${BASE_URL}/api/order/place`,
        { cartItems, shopId, totalAmount, payment_type, delivery_note },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Order failed");
    }
  }
);

// ✅ Fetch Cart Items by UserId
export const fetchCartAsync = createAsyncThunk(
  "cart/fetchCart",
  async ({userId,shopId }: { userId: number; shopId: number }, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await axios.get(`${BASE_URL}/api/cart/${shopId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
         params: { userId }, // if backend reads userId from token, maybe no need
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || "Fetch cart failed");
    }
  }
);

// ✅ Remove Item by cartId
export const removeFromCartAsync = createAsyncThunk(
  "cart/removeFromCart",
  async (cartId: number, { rejectWithValue }) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.delete(`${BASE_URL}/api/cart/${cartId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return cartId;
    } catch (err: any) {
            console.error("🔥 Remove Error:", err.response?.data); 
      return rejectWithValue(err.response?.data?.message || "Remove failed");
    }
  }
);

// Slice
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.items = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCartAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.items.push(action.payload);
        state.error = null;
      })
      .addCase(addToCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(updateCartItemAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex((item) => item.cartId === action.payload.cartId);
        if (index !== -1) {
          state.items[index] = { ...state.items[index], ...action.payload };
        }
      })

      .addCase(clearCartAsync.fulfilled, (state) => {
        state.items = [];
      })

      .addCase(placeOrderAsync.fulfilled, (state) => {
        state.items = [];
        state.error = null;
      })

      .addCase(fetchCartAsync.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.error = null;
      })
      .addCase(fetchCartAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.cartId !== action.payload);
      });
  },
});

// Exports
export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items;

export const selectCartCount = (state: RootState) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotalPrice = (state: RootState) =>
  state.cart.items.reduce((sum, item) => {
    const price =
      typeof item.subtotal === "number"
        ? item.subtotal
        : typeof item.price === "number"
        ? item.price * item.quantity
        : 0;
    return sum + price;
  }, 0);

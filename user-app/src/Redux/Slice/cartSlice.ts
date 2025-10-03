
// // // import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// // // import axios from "axios";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import { BASE_URL } from "@/api";
// // // import type { RootState } from "../store";
// // // import { useSelector } from "react-redux";

// // // export interface CartItem {
// // //   cartId?: number;
// // //   menuId: number;
// // //   variantId?: number | null;
// // //   quantity: number;
// // //   addons?: any[];
// // //   notes?: string;
// // //   price?: number; // old field
// // //   snapshotPrice?: number;
// // //   snapshotName?: string | null;
// // //   imageUrl?: string | null;
// // //   subtotal?: number;
// // // }

// // // interface CartState {
// // //   items: CartItem[];
// // //   loading: boolean;
// // //   error: string | null;
// // // }

// // // const initialState: CartState = { items: [], loading: false, error: null };

// // // const authHeader = async () => {

  
// // //   const token = await AsyncStorage.getItem("authToken");
// // //   return token ? { Authorization: `Bearer ${token}` } : {};
// // // };

// // // // addToCart - expects backend to return res.data.cartItem
// // // export const addToCartAsync = createAsyncThunk<
// // //   CartItem | void,
// // //   { shopId: number; menuId: number; variantId?: number | null; quantity?: number; addons?: any[]; notes?: string },
// // //   { rejectValue: string }
// // // >(
// // //   "cart/addToCart",
// // //   async (data, { rejectWithValue, dispatch }) => {
// // //     try {
// // //       const headers = await authHeader();
// // //       console.log(headers,"headers");
      
// // //       const res = await axios.post(`${BASE_URL}/api/cart/add`, data, { headers });
// // //       if (res.data?.cartItem) return res.data.cartItem as CartItem;
// // //       if (res.data?.cartId) {
// // //         // fallback: re-fetch canonical cart
// // //         await dispatch(fetchCartAsync({ shopId: data.shopId }));
// // //         return;
// // //       }
// // //       return;
// // //     } catch (err: any) {
// // //       console.error("Add to cart failed:", err?.response?.data ?? err);
// // //       return rejectWithValue(err?.response?.data?.message || "Add to cart failed");
// // //     }
// // //   }
// // // );

// // // // updateCartItem - server may return { deleted: true, cartId } or { deleted:false, cartItem }
// // // export const updateCartItemAsync = createAsyncThunk<
// // //   any,
// // //   { cartId: number; quantity: number; addons?: any[]; notes?: string; variantId?: number | null },
// // //   { rejectValue: string }
// // // >("cart/updateCartItem", async (payload, { rejectWithValue }) => {
// // //   try {
// // //     const headers = await authHeader();
// // //     const res = await axios.put(`${BASE_URL}/api/cart/update/${payload.cartId}`, payload, { headers });
// // //     return res.data; // expect { deleted, cartItem?, cartId? } OR cartItem directly
// // //   } catch (err: any) {
// // //     console.error("Update cart item failed:", err?.response?.data ?? err);
// // //     return rejectWithValue(err?.response?.data?.message || "Update failed");
// // //   }
// // // });

// // // // fetchCart
// // // export const fetchCartAsync = createAsyncThunk<CartItem[], { shopId: number }, { rejectValue: string }>(
// // //   "cart/fetchCart",
// // //   async ({ shopId }, { rejectWithValue }) => {
// // //     try {
// // //       const headers = await authHeader();
// // //       const res = await axios.get(`${BASE_URL}/api/cart/${shopId}`, { headers });
// // //       // console.log(res.data,"res");
      
// // //       if (Array.isArray(res.data)) return res.data;
// // //       if (Array.isArray(res.data?.items)) return res.data.items;
// // //       if (Array.isArray(res.data?.data)) return res.data.data;
// // //       return [];
// // //     } catch (err: any) {
// // //       console.error("Fetch cart failed:", err?.response?.data ?? err);
// // //       return rejectWithValue(err?.response?.data?.message || "Fetch cart failed");
// // //     }
// // //   }
// // // );

// // // export const removeFromCartAsync = createAsyncThunk<number, number, { rejectValue: string }>(
// // //   "cart/removeFromCart",
// // //   async (cartId, { rejectWithValue }) => {
// // //     try {
// // //       const headers = await authHeader();
// // //       await axios.delete(`${BASE_URL}/api/cart/${cartId}`, { headers });
// // //       return cartId;
// // //     } catch (err: any) {
// // //       console.error("Remove error:", err?.response?.data ?? err);
// // //       return rejectWithValue(err?.response?.data?.message || "Remove failed");
// // //     }
// // //   }
// // // );

// // // export const placeOrderAsync = createAsyncThunk<any, { cartItems: any[]; shopId: number; totalAmount: number; payment_type: string; delivery_note?: string }, { rejectValue: string }>(
// // //   "cart/placeOrder",
// // //   async (payload, { rejectWithValue }) => {
// // //     try {
// // //       const headers = await authHeader();
// // //       const res = await axios.post(`${BASE_URL}/api/order/place`, payload, { headers });
// // //       return res.data;
// // //     } catch (err: any) {
// // //       console.error("Place order failed:", err?.response?.data ?? err);
// // //       return rejectWithValue(err?.response?.data?.message || "Order failed");
// // //     }
// // //   }
// // // );

// // // const cartSlice = createSlice({
// // //   name: "cart",
// // //   initialState,
// // //   reducers: {
// // //     resetCart(state) {
// // //       state.items = [];
// // //       state.error = null;
// // //     },
// // //   },
// // //   extraReducers: (builder) => {
// // //     // addToCart
// // //     builder.addCase(addToCartAsync.pending, (state) => {
// // //       state.loading = true;
// // //     });
// // //     builder.addCase(addToCartAsync.fulfilled, (state, action) => {
// // //       state.loading = false;
// // //       if (action.payload && action.payload.cartId) {
// // //         const exists = state.items.find((i) => i.cartId === action.payload!.cartId);
// // //         if (!exists) state.items.push(action.payload as CartItem);
// // //       }
// // //       state.error = null;
// // //     });
// // //     builder.addCase(addToCartAsync.rejected, (state, action) => {
// // //       state.loading = false;
// // //       state.error = action.payload as string;
// // //     });

// // //     // ---------- IMPORTANT: optimistic removal on pending when qty === 0 ----------
// // //     builder.addCase(updateCartItemAsync.pending, (state, action) => {
// // //       // action.meta.arg holds the original thunk args
// // //       const arg = action.meta.arg as { cartId: number; quantity: number };
// // //       if (arg && arg.quantity === 0 && arg.cartId) {
// // //         // remove immediately for instant UI feedback
// // //         state.items = state.items.filter((i) => i.cartId !== arg.cartId);
// // //       }
// // //     });

// // //     // update fulfilled - handle server shapes
// // //     builder.addCase(updateCartItemAsync.fulfilled, (state, action) => {
// // //       const payload = action.payload;
// // //       // If backend returns { deleted: true, cartId }
// // //       if (payload && payload.deleted) {
// // //         state.items = state.items.filter((i) => i.cartId !== payload.cartId);
// // //         return;
// // //       }

// // //       // If backend returned wrapped object like { cartItem: {...} }
// // //       if (payload && payload.cartItem) {
// // //         const updated = payload.cartItem as CartItem;
// // //         const idx = state.items.findIndex((i) => i.cartId === updated.cartId);
// // //         if (idx !== -1) state.items[idx] = updated;
// // //         else state.items.push(updated); // safety
// // //         return;
// // //       }

// // //       // If backend returned just the updated cart item
// // //       if (payload && payload.cartId && typeof payload.quantity === "number") {
// // //         const idx = state.items.findIndex((i) => i.cartId === payload.cartId);
// // //         if (idx !== -1) {
// // //           state.items[idx] = { ...state.items[idx], ...payload };
// // //         } else {
// // //           // If not present and quantity > 0, add it
// // //           if (payload.quantity > 0) state.items.push(payload as CartItem);
// // //         }
// // //       }
// // //     });

// // //     builder.addCase(updateCartItemAsync.rejected, (state, action) => {
// // //       // If request failed after optimistic removal, we don't have a direct way to restore previous item here.
// // //       // Best remedy: component should call fetchCartAsync on error to re-sync.
// // //       state.error = action.payload as string;
// // //     });

// // //     // fetchCart
// // //   builder.addCase(fetchCartAsync.fulfilled, (state, action) => {
// // //   console.log('[cartSlice] fetchCartAsync.fulfilled — items:', action.payload?.length);
// // //   // If payload is empty but we already have items, don't overwrite.
// // //   if (
// // //     Array.isArray(action.payload) &&
// // //     action.payload.length === 0 &&
// // //     Array.isArray(state.items) &&
// // //     state.items.length > 0
// // //   ) {
// // //     console.log('[cartSlice] Ignoring empty fetch to avoid clobbering existing cart');
// // //     state.loading = false;
// // //     state.error = null;
// // //     return;
// // //   }
// // //   state.items = action.payload;
// // //   state.loading = false;
// // //   state.error = null;
// // // });

// // //     builder.addCase(fetchCartAsync.rejected, (state, action) => {
// // //       state.loading = false;
// // //       state.error = action.payload as string;
// // //     });

// // //     // remove explicit
// // //     builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
// // //       state.items = state.items.filter((i) => i.cartId !== action.payload);
// // //     });
// // //     builder.addCase(removeFromCartAsync.rejected, (state, action) => {
// // //       state.error = action.payload as string;
// // //     });

// // //     // place order
// // //     builder.addCase(placeOrderAsync.fulfilled, (state) => {
// // //       state.items = [];
// // //       state.error = null;
// // //     });
// // //     builder.addCase(placeOrderAsync.rejected, (state, action) => {
// // //       state.error = action.payload as string;
// // //     });
// // //   },
// // // });

// // // export const { resetCart } = cartSlice.actions;
// // // export default cartSlice.reducer;

// // // // Selectors
// // // export const selectCartItems = (state: RootState) => state.cart.items || [];
// // // export const selectCartCount = (state: RootState) => (state.cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
// // // export const selectCartTotalPrice = (state: RootState) =>
// // //   (state.cart.items || []).reduce((sum, item) => {
// // //     const unit = typeof item.snapshotPrice === "number" ? item.snapshotPrice : (item.price ?? 0);
// // //     return sum + unit * (item.quantity || 0);
// // //   }, 0);
// // // src/Redux/Slice/cartSlice.ts
// // import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// // import axiosClient from "@/src/api/client";
// // import type { RootState } from "../store";
// // import { GST_RATE } from "@/src/config/tax";

// // export interface CartItem {
// //   cartId?: number;
// //   menuId: number;
// //   variantId?: number | null;
// //   quantity: number;
// //   addons?: any[];
// //   notes?: string;
// //   price?: number;
// //   snapshotPrice?: number;
// //   snapshotName?: string | null;
// //   imageUrl?: string | null;
// //   subtotal?: number;
// // }

// // interface CartState {
// //   items: CartItem[];
// //   loading: boolean;
// //   error: string | null;
// //   optimisticBackup: Record<string, CartItem>;
// // }

// // const initialState: CartState = {
// //   items: [],
// //   loading: false,
// //   error: null,
// //   optimisticBackup: {},
// // };

// // export const addToCartAsync = createAsyncThunk<
// //   CartItem | undefined,
// //   { shopId: number; menuId: number; variantId?: number | null; quantity?: number; addons?: any[]; notes?: string },
// //   { rejectValue: string }
// // >("cart/addToCart", async (data, { rejectWithValue, dispatch }) => {
// //   try {
// //     const res = await axiosClient.post("/api/cart/add", data);
// //     // server may return { cartItem } or cartItem directly or partial
// //     const payload = res.data?.cartItem ?? res.data;
// //     if (payload && typeof payload === "object") return payload as CartItem;
// //     // fallback: re-fetch server cart for canonical state
// //     await dispatch(fetchCartAsync({ shopId: data.shopId }));
// //     return;
// //   } catch (err: any) {
// //     console.error("[cart] addToCart failed", err?.response?.data ?? err);
// //     return rejectWithValue(err?.response?.data?.message || "Add to cart failed");
// //   }
// // });

// // /**
// //  * Update cart item (quantity/addons/notes)
// //  * Payload: { cartId, quantity, addons?, notes?, variantId? }
// //  * Server may return { deleted:true, cartId } or { cartItem } or cartItem directly
// //  */
// // export const updateCartItemAsync = createAsyncThunk<
// //   any,
// //   { cartId: number; quantity: number; addons?: any[]; notes?: string; variantId?: number | null },
// //   { rejectValue: string }
// // >("cart/updateCartItem", async (payload, { rejectWithValue }) => {
// //   try {
// //     const res = await axiosClient.put(`/api/cart/update/${payload.cartId}`, payload);
// //     return res.data;
// //   } catch (err: any) {
// //     console.error("[cart] updateCartItem failed", err?.response?.data ?? err);
// //     return rejectWithValue(err?.response?.data?.message || "Update failed");
// //   }
// // });

// // /**
// //  * Fetch cart. Accepts { shopId, force?: boolean }.
// //  * If force is true, reducers MUST overwrite the local cart even when server returns empty array.
// //  */
// // export const fetchCartAsync = createAsyncThunk<
// //   CartItem[],
// //   { shopId: number; force?: boolean },
// //   { rejectValue: string }
// // >("cart/fetchCart", async ({ shopId }, { rejectWithValue }) => {
// //   try {
// //     const res = await axiosClient.get(`/api/cart/${shopId}`);
// //     const data = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.data ?? [];
// //     return Array.isArray(data) ? data : [];
// //   } catch (err: any) {
// //     console.error("[cart] fetchCart failed", err?.response?.data ?? err);
// //     return rejectWithValue(err?.response?.data?.message || "Fetch cart failed");
// //   }
// // });
// // export const fetchCartAllAsync = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
// //   "cart/fetchCartAll",
// //   async (_, { rejectWithValue }) => {
// //     try {
// //       const res = await axiosClient.get("/api/cart");
// //       // server returns grouped [{ shopId, shopname, items: [...] }, ...]
// //       const grouped = Array.isArray(res.data) ? res.data : [];
// //       // flatten to items array with shop info included for compatibility with store shape
// //       const flattened: CartItem[] = [];
// //       grouped.forEach((g: any) => {
// //         (g.items || []).forEach((it: any) => {
// //           flattened.push({ ...it, shopId: g.shopId, shopname: g.shopname } as any);
// //         });
// //       });
// //       return flattened;
// //     } catch (err: any) {
// //       console.error("[cart] fetchCartAll failed", err?.response?.data ?? err);
// //       return rejectWithValue(err?.response?.data?.message || "Fetch cart failed");
// //     }
// //   }
// // );
// // /**
// //  * Remove from cart (server)
// //  */
// // export const removeFromCartAsync = createAsyncThunk<number, number, { rejectValue: string }>(
// //   "cart/removeFromCart",
// //   async (cartId, { rejectWithValue }) => {
// //     try {
// //       await axiosClient.delete(`/api/cart/${cartId}`);
// //       return cartId;
// //     } catch (err: any) {
// //       console.error("[cart] removeFromCart failed", err?.response?.data ?? err);
// //       return rejectWithValue(err?.response?.data?.message || "Remove failed");
// //     }
// //   }
// // );

// // /**
// //  * Place order (server-side)
// //  * payload: { cartItems, shopId, totalAmount, payment_type, delivery_note? }
// //  * On success we will clear cart (server authoritative).
// //  */
// // export const placeOrderAsync = createAsyncThunk<any, { cartItems: any[]; shopId: number; totalAmount: number; payment_type: string; delivery_note?: string }, { rejectValue: string }>(
// //   "cart/placeOrder",
// //   async (payload, { rejectWithValue }) => {
// //     try {
// //       const res = await axiosClient.post("/api/order/place", payload);
// //       return res.data;
// //     } catch (err: any) {
// //       console.error("[cart] placeOrder failed", err?.response?.data ?? err);
// //       return rejectWithValue(err?.response?.data?.message || "Order failed");
// //     }
// //   }
// // );

// // /* ---------- Slice ---------- */

// // const cartSlice = createSlice({
// //   name: "cart",
// //   initialState,
// //   reducers: {
// //     resetCart(state) {
// //       state.items = [];
// //       state.error = null;
// //       state.optimisticBackup = {};
// //     },
// //     // Optional: a manual setCart to replace store (useful in tests)
// //     setCart(state, action: PayloadAction<CartItem[]>) {
// //       state.items = action.payload;
// //       state.optimisticBackup = {};
// //       state.error = null;
// //     },
// //   },
// //   extraReducers: (builder) => {
// //     // addToCart
// //     builder.addCase(addToCartAsync.pending, (state) => {
// //       state.loading = true;
// //     });
// //     builder.addCase(addToCartAsync.fulfilled, (state, action) => {
// //       state.loading = false;
// //       if (action.payload && action.payload.cartId) {
// //         const exists = state.items.find((i) => i.cartId === action.payload!.cartId);
// //         if (!exists) state.items.push(action.payload as CartItem);
// //       }
// //       state.error = null;
// //     });
// //     builder.addCase(addToCartAsync.rejected, (state, action) => {
// //       state.loading = false;
// //       state.error = action.payload ?? "Add failed";
// //     });

// //     // updateCart - optimistic removal handling
// //     builder.addCase(updateCartItemAsync.pending, (state, action) => {
// //       const arg = action.meta.arg as { cartId: number; quantity: number };
// //       if (arg && arg.cartId && arg.quantity === 0) {
// //         // Move item to optimistic backup so we can restore if update fails
// //         const idx = state.items.findIndex((i) => i.cartId === arg.cartId);
// //         if (idx !== -1) {
// //           const item = state.items[idx];
// //           state.optimisticBackup[String(arg.cartId)] = item;
// //           state.items.splice(idx, 1);
// //         }
// //       }
// //     });

// //     builder.addCase(updateCartItemAsync.fulfilled, (state, action) => {
// //       const payload = action.payload;
// //       // If backend returned { deleted: true, cartId }
// //       if (payload && payload.deleted) {
// //         // ensure backup is removed if present
// //         if (payload.cartId) delete state.optimisticBackup[String(payload.cartId)];
// //         state.items = state.items.filter((i) => i.cartId !== payload.cartId);
// //         return;
// //       }

// //       // If backend returned wrapped object like { cartItem: {...} }
// //       if (payload && payload.cartItem) {
// //         const updated = payload.cartItem as CartItem;
// //         const idx = state.items.findIndex((i) => i.cartId === updated.cartId);
// //         if (idx !== -1) state.items[idx] = updated;
// //         else state.items.push(updated);
// //         // clear any backup related
// //         delete state.optimisticBackup[String(updated.cartId)];
// //         return;
// //       }

// //       // If backend returned just the updated cart item
// //       if (payload && payload.cartId && typeof payload.quantity === "number") {
// //         const idx = state.items.findIndex((i) => i.cartId === payload.cartId);
// //         if (idx !== -1) {
// //           state.items[idx] = { ...state.items[idx], ...payload };
// //         } else {
// //           if (payload.quantity > 0) state.items.push(payload as CartItem);
// //         }
// //         delete state.optimisticBackup[String(payload.cartId)];
// //       }
// //     });

// //     builder.addCase(updateCartItemAsync.rejected, (state, action) => {
// //       const arg = action.meta.arg as { cartId: number; quantity: number };
// //       state.error = action.payload ?? "Update failed";
// //       // restore from optimistic backup if present
// //       if (arg && arg.cartId) {
// //         const backup = state.optimisticBackup[String(arg.cartId)];
// //         if (backup) {
// //           state.items.push(backup);
// //           delete state.optimisticBackup[String(arg.cartId)];
// //         }
// //       }
// //     });

// //     // fetchCart: honor force flag
// //     builder.addCase(fetchCartAsync.pending, (state) => {
// //       state.loading = true;
// //     });
// //     builder.addCase(fetchCartAsync.fulfilled, (state, action) => {
// //       const incoming = Array.isArray(action.payload) ? action.payload : [];
// //       const force = !!(action.meta && (action.meta.arg as any)?.force);

// //       if (incoming.length === 0 && state.items.length > 0 && !force) {
// //         // intentionally ignore to avoid clobbering local optimistic items
// //         state.loading = false;
// //         state.error = null;
// //         return;
// //       }

// //       // adopt server-canonical array
// //       state.items = incoming;
// //       state.optimisticBackup = {};
// //       state.loading = false;
// //       state.error = null;
// //     });
// //     builder.addCase(fetchCartAsync.rejected, (state, action) => {
// //       state.loading = false;
// //       state.error = action.payload ?? "Fetch failed";
// //     });
// //     // fetchCartAll (whole-cart)
// // builder.addCase(fetchCartAllAsync.pending, (state) => {
// //   state.loading = true;
// // });

// // builder.addCase(fetchCartAllAsync.fulfilled, (state, action) => {
// //   const incoming = Array.isArray(action.payload) ? action.payload : [];
// //   // adopt server-canonical array for whole-cart
// //   state.items = incoming;
// //   state.optimisticBackup = {};
// //   state.loading = false;
// //   state.error = null;
// // });

// // builder.addCase(fetchCartAllAsync.rejected, (state, action) => {
// //   state.loading = false;
// //   state.error = action.payload ?? "Fetch all cart failed";
// // });
// //     // removeFromCartAsync success: remove item and clear any backup
// //     builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
// //       const cartId = action.payload;
// //       state.items = state.items.filter((i) => i.cartId !== cartId);
// //       delete state.optimisticBackup[String(cartId)];
// //     });
// //     builder.addCase(removeFromCartAsync.rejected, (state, action) => {
// //       state.error = action.payload ?? "Remove failed";
// //     });

// //     // place order: server canonical — clear cart
// //     builder.addCase(placeOrderAsync.fulfilled, (state) => {
// //       state.items = [];
// //       state.optimisticBackup = {};
// //       state.error = null;
// //     });
// //     builder.addCase(placeOrderAsync.rejected, (state, action) => {
// //       state.error = action.payload ?? "Place order failed";
// //     });
// //   },
// // });

// // export const { resetCart, setCart } = cartSlice.actions;
// // export default cartSlice.reducer;

// // // /* ---------- Selectors ---------- */
// // // export const selectCartItems = (state: RootState) => state.cart.items || [];
// // // export const selectCartCount = (state: RootState) =>
// // //   (state.cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
// // // export const selectCartTotalPrice = (state: RootState) =>
// // //   (state.cart.items || []).reduce((sum, item) => {
// // //     const unit = typeof item.snapshotPrice === "number" ? item.snapshotPrice : (item.price ?? 0);
// // //     return sum + unit * (item.quantity || 0);
// // //   }, 0);

// // export const selectCartItems = (state: RootState) => state.cart.items || [];
// // export const selectCartGroupedByShop = (state: RootState) => {
// //   const items = state.cart.items || [];
// //   // console.log(items,"item");
  
// //   return items.reduce<Record<number, { shopId: number; shopname?: string; items: CartItem[] }>>((acc, it) => {
// //     const sid = Number((it as any).shopId || 0);
// //     if (!acc[sid]) acc[sid] = { shopId: sid, shopname: (it as any).shopname, items: [] };
// //     acc[sid].items.push(it);
// //     return acc;
// //   }, {});
// // };export const selectShopTotals = (state: RootState) => {
// //   const groups = selectCartGroupedByShop(state);
// //   const map: Record<number, { subtotal: number; gst: number; total: number; count: number }> = {};
// //   Object.values(groups).forEach(g => {
// //     const subtotal = g.items.reduce((s, it) => s + (typeof it.snapshotPrice === 'number' ? it.snapshotPrice : (it.price ?? 0)) * (it.quantity || 0), 0);
// //     const gst = Number((subtotal * GST_RATE).toFixed(2));
// //     const total = Number((subtotal + gst).toFixed(2));
// //     map[g.shopId] = { subtotal, gst, total, count: g.items.reduce((a,b)=>a+(b.quantity||0),0) };
// //   });
// //   return map;
// // };


// // export const selectCartCount = (state: RootState) =>
// //   (state.cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);

// // // subtotal (pre-tax) — keeps previous name for compatibility
// // export const selectCartTotalPrice = (state: RootState) =>
// //   (state.cart.items || []).reduce((sum, item) => {
// //     const unit = typeof item.snapshotPrice === "number" ? item.snapshotPrice : (item.price ?? 0);
// //     return sum + unit * (item.quantity || 0);
// //   }, 0);

// // // GST (cart-level)
// // export const selectCartGst = (state: RootState) => {
// //   const subtotal = selectCartTotalPrice(state);
// //   return Number((subtotal * GST_RATE).toFixed(2));
// // };

// // // total including GST
// // export const selectCartTotalWithGst = (state: RootState) => {
// //   const subtotal = selectCartTotalPrice(state);
// //   const gst = Number((subtotal * GST_RATE).toFixed(2));
// //   return Number((subtotal + gst).toFixed(2));
// // };
// // src/Redux/Slice/cartSlice.ts
// import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
// import axiosClient from "@/src/api/client";
// import type { RootState } from "../store";
// import { GST_RATE } from "@/src/config/tax";

// export interface CartItem {
//   cartId?: number;
//   menuId: number;
//   variantId?: number | null;
//   quantity: number;
//   addons?: any[];
//   notes?: string;
//   price?: number;
//   snapshotPrice?: number;
//   snapshotName?: string | null;
//   imageUrl?: string | null;
//   subtotal?: number;
//   shopId?: number;
//   shopname?: string;
// }

// interface CartState {
//   items: CartItem[];
//   loading: boolean;
//   error: string | null;
//   optimisticBackup: Record<string, CartItem>;
// }

// const initialState: CartState = {
//   items: [],
//   loading: false,
//   error: null,
//   optimisticBackup: {},
// };

// /* ---------- Thunks (kept similar to your existing ones) ---------- */

// export const addToCartAsync = createAsyncThunk<
//   CartItem | undefined,
//   { shopId: number; menuId: number; variantId?: number | null; quantity?: number; addons?: any[]; notes?: string },
//   { rejectValue: string; state: RootState }
// >("cart/addToCart", async (data, { rejectWithValue, dispatch }) => {
//   try {
//     const res = await axiosClient.post("/api/cart/add", data);
//     const payload = res.data?.cartItem ?? res.data;
//     if (payload && typeof payload === "object") return payload as CartItem;
//     await dispatch(fetchCartAsync({ shopId: data.shopId }));
//     return;
//   } catch (err: any) {
//     console.error("[cart] addToCart failed", err?.response?.data ?? err);
//     return rejectWithValue(err?.response?.data?.message || "Add to cart failed");
//   }
// });

// export const updateCartItemAsync = createAsyncThunk<
//   any,
//   { cartId: number; quantity: number; addons?: any[]; notes?: string; variantId?: number | null },
//   { rejectValue: string }
// >("cart/updateCartItem", async (payload, { rejectWithValue }) => {
//   try {
//     const res = await axiosClient.put(`/api/cart/update/${payload.cartId}`, payload);
//     return res.data;
//   } catch (err: any) {
//     console.error("[cart] updateCartItem failed", err?.response?.data ?? err);
//     return rejectWithValue(err?.response?.data?.message || "Update failed");
//   }
// });

// export const fetchCartAsync = createAsyncThunk<
//   CartItem[],
//   { shopId: number; force?: boolean },
//   { rejectValue: string }
// >("cart/fetchCart", async ({ shopId }, { rejectWithValue }) => {
//   try {
//     const res = await axiosClient.get(`/api/cart/${shopId}`);
//     const data = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.data ?? [];
//     return Array.isArray(data) ? data : [];
//   } catch (err: any) {
//     console.error("[cart] fetchCart failed", err?.response?.data ?? err);
//     return rejectWithValue(err?.response?.data?.message || "Fetch cart failed");
//   }
// });

// export const fetchCartAllAsync = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
//   "cart/fetchCartAll",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await axiosClient.get("/api/cart");
//       // server returns grouped [{ shopId, shopname, items: [...] }, ...]
//       const grouped = Array.isArray(res.data) ? res.data : [];
//       const flattened: CartItem[] = [];
//       grouped.forEach((g: any) => {
//         (g.items || []).forEach((it: any) => {
//           flattened.push({ ...(it || {}), shopId: Number(g.shopId ?? it.shopId), shopname: g.shopname } as any);
//         });
//       });
//       return flattened;
//     } catch (err: any) {
//       console.error("[cart] fetchCartAll failed", err?.response?.data ?? err);
//       return rejectWithValue(err?.response?.data?.message || "Fetch cart failed");
//     }
//   }
// );

// export const removeFromCartAsync = createAsyncThunk<number, number, { rejectValue: string }>(
//   "cart/removeFromCart",
//   async (cartId, { rejectWithValue }) => {
//     try {
//       await axiosClient.delete(`/api/cart/${cartId}`);
//       return cartId;
//     } catch (err: any) {
//       console.error("[cart] removeFromCart failed", err?.response?.data ?? err);
//       return rejectWithValue(err?.response?.data?.message || "Remove failed");
//     }
//   }
// );

// export const placeOrderAsync = createAsyncThunk<
//   any,
//   { cartItems: any[]; shopId: number; totalAmount: number; payment_type: string; delivery_note?: string },
//   { rejectValue: string }
// >("cart/placeOrder", async (payload, { rejectWithValue }) => {
//   try {
//     const res = await axiosClient.post("/api/order/place", payload);
//     return res.data;
//   } catch (err: any) {
//     console.error("[cart] placeOrder failed", err?.response?.data ?? err);
//     return rejectWithValue(err?.response?.data?.message || "Order failed");
//   }
// });

// /* ---------- Slice ---------- */

// const cartSlice = createSlice({
//   name: "cart",
//   initialState,
//   reducers: {
//     resetCart(state) {
//       state.items = [];
//       state.error = null;
//       state.optimisticBackup = {};
//     },
//     setCart(state, action: PayloadAction<CartItem[]>) {
//       state.items = action.payload;
//       state.optimisticBackup = {};
//       state.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     // addToCart
//     builder.addCase(addToCartAsync.pending, (state) => {
//       state.loading = true;
//     });
//     builder.addCase(addToCartAsync.fulfilled, (state, action) => {
//       state.loading = false;
//       if (action.payload && action.payload.cartId) {
//         const exists = state.items.find((i) => i.cartId === action.payload!.cartId);
//         if (!exists) state.items.push(action.payload as CartItem);
//       }
//       state.error = null;
//     });
//     builder.addCase(addToCartAsync.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload ?? "Add failed";
//     });

//     // updateCart optimistic logic (basic)
//     builder.addCase(updateCartItemAsync.pending, (state, action) => {
//       const arg = action.meta.arg as { cartId: number; quantity: number };
//       if (arg && arg.cartId && arg.quantity === 0) {
//         const idx = state.items.findIndex((i) => i.cartId === arg.cartId);
//         if (idx !== -1) {
//           const item = state.items[idx];
//           state.optimisticBackup[String(arg.cartId)] = item;
//           state.items.splice(idx, 1);
//         }
//       }
//     });

//     builder.addCase(updateCartItemAsync.fulfilled, (state, action) => {
//       const payload = action.payload;
//       if (payload && payload.deleted) {
//         if (payload.cartId) delete state.optimisticBackup[String(payload.cartId)];
//         state.items = state.items.filter((i) => i.cartId !== payload.cartId);
//         return;
//       }
//       if (payload && payload.cartItem) {
//         const updated = payload.cartItem as CartItem;
//         const idx = state.items.findIndex((i) => i.cartId === updated.cartId);
//         if (idx !== -1) state.items[idx] = updated;
//         else state.items.push(updated);
//         delete state.optimisticBackup[String(updated.cartId)];
//         return;
//       }
//       if (payload && payload.cartId && typeof payload.quantity === "number") {
//         const idx = state.items.findIndex((i) => i.cartId === payload.cartId);
//         if (idx !== -1) state.items[idx] = { ...state.items[idx], ...payload };
//         else if (payload.quantity > 0) state.items.push(payload as CartItem);
//         delete state.optimisticBackup[String(payload.cartId)];
//       }
//     });

//     builder.addCase(updateCartItemAsync.rejected, (state, action) => {
//       const arg = action.meta.arg as { cartId: number; quantity: number };
//       state.error = action.payload ?? "Update failed";
//       if (arg && arg.cartId) {
//         const backup = state.optimisticBackup[String(arg.cartId)];
//         if (backup) {
//           state.items.push(backup);
//           delete state.optimisticBackup[String(arg.cartId)];
//         }
//       }
//     });

//     // fetchCart (per-shop) - MERGE semantics
//     builder.addCase(fetchCartAsync.pending, (state) => {
//       state.loading = true;
//     });

//     builder.addCase(fetchCartAsync.fulfilled, (state, action) => {
//       const incoming = Array.isArray(action.payload) ? action.payload : [];
//       const force = !!(action.meta && (action.meta.arg as any)?.force);
//       const argShopId = (action.meta && (action.meta.arg as any)?.shopId) ?? null;
//       const inferredShopId = incoming.length ? Number((incoming[0] as any).shopId ?? argShopId ?? 0) : argShopId;

//       if (!inferredShopId && !force && incoming.length === 0) {
//         state.loading = false;
//         state.error = null;
//         return;
//       }

//       if (force && incoming.length === 0 && inferredShopId != null) {
//         state.items = state.items.filter((i: any) => Number((i as any).shopId) !== Number(inferredShopId));
//         state.loading = false;
//         state.error = null;
//         return;
//       }

//       if (inferredShopId != null) {
//         state.items = state.items.filter((i: any) => Number((i as any).shopId) !== Number(inferredShopId));
//         const normalized = incoming.map((it: any) => ({ ...(it || {}), shopId: Number(it.shopId ?? inferredShopId) }));
//         state.items = state.items.concat(normalized);
//         state.loading = false;
//         state.error = null;
//         state.optimisticBackup = {};
//         return;
//       }

//       // fallback: replace all
//       state.items = incoming;
//       state.optimisticBackup = {};
//       state.loading = false;
//       state.error = null;
//     });

//     builder.addCase(fetchCartAsync.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload ?? "Fetch failed";
//     });

//     // fetchCartAll (overwrite canonical view)
//     builder.addCase(fetchCartAllAsync.pending, (state) => {
//       state.loading = true;
//     });

//     builder.addCase(fetchCartAllAsync.fulfilled, (state, action) => {
//       const incoming = Array.isArray(action.payload) ? action.payload : [];
//       state.items = incoming;
//       state.optimisticBackup = {};
//       state.loading = false;
//       state.error = null;
//     });

//     builder.addCase(fetchCartAllAsync.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload ?? "Fetch all cart failed";
//     });

//     // removeFromCart
//     builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
//       const cartId = action.payload;
//       state.items = state.items.filter((i) => i.cartId !== cartId);
//       delete state.optimisticBackup[String(cartId)];
//     });
//     builder.addCase(removeFromCartAsync.rejected, (state, action) => {
//       state.error = action.payload ?? "Remove failed";
//     });

//     // placeOrder: clear cart on success
//     builder.addCase(placeOrderAsync.fulfilled, (state) => {
//       state.items = [];
//       state.optimisticBackup = {};
//       state.error = null;
//     });
//     builder.addCase(placeOrderAsync.rejected, (state, action) => {
//       state.error = action.payload ?? "Place order failed";
//     });
//   },
// });

// export const { resetCart, setCart } = cartSlice.actions;
// export default cartSlice.reducer;

// /* ---------- Selectors ---------- */

// export const selectCartItems = (state: RootState) => state.cart.items || [];

// export const selectCartGroupedByShop = (state: RootState) => {
//   const items = state.cart.items || [];
//   return items.reduce<Record<number, { shopId: number; shopname?: string; items: CartItem[] }>>((acc, it) => {
//     const sid = Number((it as any).shopId ?? 0);
//     if (!acc[sid]) acc[sid] = { shopId: sid, shopname: (it as any).shopname, items: [] };
//     acc[sid].items.push(it);
//     return acc;
//   }, {});
// };

// export const selectShopTotals = (state: RootState) => {
//   const groups = selectCartGroupedByShop(state);
//   const map: Record<number, { subtotal: number; gst: number; total: number; count: number }> = {};
//   Object.values(groups).forEach((g) => {
//     const subtotal = g.items.reduce((s, it) => s + (typeof it.snapshotPrice === "number" ? it.snapshotPrice : (it.price ?? 0)) * (it.quantity || 0), 0);
//     const gst = Number((subtotal * GST_RATE).toFixed(2));
//     const total = Number((subtotal + gst).toFixed(2));
//     map[g.shopId] = { subtotal, gst, total, count: g.items.reduce((a, b) => a + (b.quantity || 0), 0) };
//   });
//   return map;
// };

// export const selectCartCount = (state: RootState) => (state.cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);

// export const selectCartDistinctCount = (state: RootState) => (state.cart.items || []).length;

// export const selectCartTotalPrice = (state: RootState) =>
//   (state.cart.items || []).reduce((sum, item) => {
//     const unit = typeof item.snapshotPrice === "number" ? item.snapshotPrice : (item.price ?? 0);
//     return sum + unit * (item.quantity || 0);
//   }, 0);

// export const selectCartGst = (state: RootState) => {
//   const subtotal = selectCartTotalPrice(state);
//   return Number((subtotal * GST_RATE).toFixed(2));
// };

// export const selectCartTotalWithGst = (state: RootState) => {
//   const subtotal = selectCartTotalPrice(state);
//   const gst = Number((subtotal * GST_RATE).toFixed(2));
//   return Number((subtotal + gst).toFixed(2));
// };

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosClient from "@/src/api/client";
import type { RootState } from "../store";
import { GST_RATE } from "@/src/config/tax";

export interface CartItem {
  cartId?: number;
  menuId: number;
  variantId?: number | null;
  quantity: number;
  addons?: any[];
  notes?: string;
  price?: number;
  snapshotPrice?: number;
  snapshotName?: string | null;
  imageUrl?: string | null;
  subtotal?: number;
  shopId?: number;
  shopname?: string;
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  optimisticBackup: Record<string, CartItem>;
}

const initialState: CartState = {
  items: [],
  loading: false,
  error: null,
  optimisticBackup: {},
};

/* ---------- Thunks (kept similar to your existing ones) ---------- */

export const addToCartAsync = createAsyncThunk<
  CartItem | undefined,
  { shopId: number; menuId: number; variantId?: number | null; quantity?: number; addons?: any[]; notes?: string },
  { rejectValue: string; state: RootState }
>("cart/addToCart", async (data, { rejectWithValue, dispatch }) => {
  try {
    const res = await axiosClient.post("/api/cart/add", data);
    const payload = res.data?.cartItem ?? res.data;
    if (payload && typeof payload === "object") return payload as CartItem;
    await dispatch(fetchCartAsync({ shopId: data.shopId }));
    return;
  } catch (err: any) {
    console.error("[cart] addToCart failed", err?.response?.data ?? err);
    return rejectWithValue(err?.response?.data?.message || "Add to cart failed");
  }
});

export const updateCartItemAsync = createAsyncThunk<
  any,
  { cartId: number; quantity: number; addons?: any[]; notes?: string; variantId?: number | null },
  { rejectValue: string }
>("cart/updateCartItem", async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosClient.put(`/api/cart/update/${payload.cartId}`, payload);
    return res.data;
  } catch (err: any) {
    console.error("[cart] updateCartItem failed", err?.response?.data ?? err);
    return rejectWithValue(err?.response?.data?.message || "Update failed");
  }
});

export const fetchCartAsync = createAsyncThunk<
  CartItem[],
  { shopId: number; force?: boolean },
  { rejectValue: string }
>("cart/fetchCart", async ({ shopId }, { rejectWithValue }) => {
  try {
    const res = await axiosClient.get(`/api/cart/${shopId}`);
    const data = Array.isArray(res.data) ? res.data : res.data?.items ?? res.data?.data ?? [];
    return Array.isArray(data) ? data : [];
  } catch (err: any) {
    console.error("[cart] fetchCart failed", err?.response?.data ?? err);
    return rejectWithValue(err?.response?.data?.message || "Fetch cart failed");
  }
});

export const fetchCartAllAsync = createAsyncThunk<CartItem[], void, { rejectValue: string }>(
  "cart/fetchCartAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get("/api/cart");
      // server returns grouped [{ shopId, shopname, items: [...] }, ...]
      const grouped = Array.isArray(res.data) ? res.data : [];
      const flattened: CartItem[] = [];
      grouped.forEach((g: any) => {
        (g.items || []).forEach((it: any) => {
          flattened.push({ ...(it || {}), shopId: Number(g.shopId ?? it.shopId), shopname: g.shopname } as any);
        });
      });
      return flattened;
    } catch (err: any) {
      console.error("[cart] fetchCartAll failed", err?.response?.data ?? err);
      return rejectWithValue(err?.response?.data?.message || "Fetch cart failed");
    }
  }
);

export const removeFromCartAsync = createAsyncThunk<number, number, { rejectValue: string }>(
  "cart/removeFromCart",
  async (cartId, { rejectWithValue }) => {
    try {
      await axiosClient.delete(`/api/cart/${cartId}`);
      return cartId;
    } catch (err: any) {
      console.error("[cart] removeFromCart failed", err?.response?.data ?? err);
      return rejectWithValue(err?.response?.data?.message || "Remove failed");
    }
  }
);

export const placeOrderAsync = createAsyncThunk<
  any,
  { cartItems: any[]; shopId: number; totalAmount: number; payment_type: string; delivery_note?: string },
  { rejectValue: string }
>("cart/placeOrder", async (payload, { rejectWithValue }) => {
  try {
    const res = await axiosClient.post("/api/order/place", payload);
    return res.data;
  } catch (err: any) {
    console.error("[cart] placeOrder failed", err?.response?.data ?? err);
    return rejectWithValue(err?.response?.data?.message || "Order failed");
  }
});

/* ---------- Slice ---------- */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart(state) {
      state.items = [];
      state.error = null;
      state.optimisticBackup = {};
    },
    setCart(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload;
      state.optimisticBackup = {};
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
      state.error = action.payload ?? "Add failed";
    });

    // updateCart optimistic logic (basic)
    builder.addCase(updateCartItemAsync.pending, (state, action) => {
      const arg = action.meta.arg as { cartId: number; quantity: number };
      if (arg && arg.cartId && arg.quantity === 0) {
        const idx = state.items.findIndex((i) => i.cartId === arg.cartId);
        if (idx !== -1) {
          const item = state.items[idx];
          state.optimisticBackup[String(arg.cartId)] = item;
          state.items.splice(idx, 1);
        }
      }
    });

    builder.addCase(updateCartItemAsync.fulfilled, (state, action) => {
      const payload = action.payload;
      if (payload && payload.deleted) {
        if (payload.cartId) delete state.optimisticBackup[String(payload.cartId)];
        state.items = state.items.filter((i) => i.cartId !== payload.cartId);
        return;
      }
      if (payload && payload.cartItem) {
        const updated = payload.cartItem as CartItem;
        const idx = state.items.findIndex((i) => i.cartId === updated.cartId);
        if (idx !== -1) state.items[idx] = updated;
        else state.items.push(updated);
        delete state.optimisticBackup[String(updated.cartId)];
        return;
      }
      if (payload && payload.cartId && typeof payload.quantity === "number") {
        const idx = state.items.findIndex((i) => i.cartId === payload.cartId);
        if (idx !== -1) state.items[idx] = { ...state.items[idx], ...payload };
        else if (payload.quantity > 0) state.items.push(payload as CartItem);
        delete state.optimisticBackup[String(payload.cartId)];
      }
    });

    builder.addCase(updateCartItemAsync.rejected, (state, action) => {
      const arg = action.meta.arg as { cartId: number; quantity: number };
      state.error = action.payload ?? "Update failed";
      if (arg && arg.cartId) {
        const backup = state.optimisticBackup[String(arg.cartId)];
        if (backup) {
          state.items.push(backup);
          delete state.optimisticBackup[String(arg.cartId)];
        }
      }
    });

    // fetchCart (per-shop) - MERGE semantics
    builder.addCase(fetchCartAsync.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchCartAsync.fulfilled, (state, action) => {
      const incoming = Array.isArray(action.payload) ? action.payload : [];
      const force = !!(action.meta && (action.meta.arg as any)?.force);
      const argShopId = (action.meta && (action.meta.arg as any)?.shopId) ?? null;
      const inferredShopId = incoming.length ? Number((incoming[0] as any).shopId ?? argShopId ?? 0) : argShopId;

      if (!inferredShopId && !force && incoming.length === 0) {
        state.loading = false;
        state.error = null;
        return;
      }

      if (force && incoming.length === 0 && inferredShopId != null) {
        state.items = state.items.filter((i: any) => Number((i as any).shopId) !== Number(inferredShopId));
        state.loading = false;
        state.error = null;
        return;
      }

      if (inferredShopId != null) {
        state.items = state.items.filter((i: any) => Number((i as any).shopId) !== Number(inferredShopId));
        const normalized = incoming.map((it: any) => ({ ...(it || {}), shopId: Number(it.shopId ?? inferredShopId) }));
        state.items = state.items.concat(normalized);
        state.loading = false;
        state.error = null;
        state.optimisticBackup = {};
        return;
      }

      // fallback: replace all
      state.items = incoming;
      state.optimisticBackup = {};
      state.loading = false;
      state.error = null;
    });

    builder.addCase(fetchCartAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "Fetch failed";
    });

    // fetchCartAll (overwrite canonical view)
    builder.addCase(fetchCartAllAsync.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchCartAllAsync.fulfilled, (state, action) => {
      const incoming = Array.isArray(action.payload) ? action.payload : [];
      state.items = incoming;
      state.optimisticBackup = {};
      state.loading = false;
      state.error = null;
    });

    builder.addCase(fetchCartAllAsync.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload ?? "Fetch all cart failed";
    });

    // removeFromCart
    builder.addCase(removeFromCartAsync.fulfilled, (state, action) => {
      const cartId = action.payload;
      state.items = state.items.filter((i) => i.cartId !== cartId);
      delete state.optimisticBackup[String(cartId)];
    });
    builder.addCase(removeFromCartAsync.rejected, (state, action) => {
      state.error = action.payload ?? "Remove failed";
    });

    // placeOrder: clear cart on success
    builder.addCase(placeOrderAsync.fulfilled, (state) => {
      state.items = [];
      state.optimisticBackup = {};
      state.error = null;
    });
    builder.addCase(placeOrderAsync.rejected, (state, action) => {
      state.error = action.payload ?? "Place order failed";
    });
  },
});

export const { resetCart, setCart } = cartSlice.actions;
export default cartSlice.reducer;

/* ---------- Selectors ---------- */

export const selectCartItems = (state: RootState) => state.cart.items || [];

export const selectCartGroupedByShop = (state: RootState) => {
  const items = state.cart.items || [];
  return items.reduce<Record<number, { shopId: number; shopname?: string; items: CartItem[] }>>((acc, it) => {
    const sid = Number((it as any).shopId ?? 0);
    if (!acc[sid]) acc[sid] = { shopId: sid, shopname: (it as any).shopname, items: [] };
    acc[sid].items.push(it);
    return acc;
  }, {});
};

export const selectShopTotals = (state: RootState) => {
  const groups = selectCartGroupedByShop(state);
  const map: Record<number, { subtotal: number; gst: number; total: number; count: number }> = {};
  Object.values(groups).forEach((g) => {
    const subtotal = g.items.reduce((s, it) => s + (typeof it.snapshotPrice === "number" ? it.snapshotPrice : (it.price ?? 0)) * (it.quantity || 0), 0);
    const gst = Number((subtotal * GST_RATE).toFixed(2));
    const total = Number((subtotal + gst).toFixed(2));
    map[g.shopId] = { subtotal, gst, total, count: g.items.reduce((a, b) => a + (b.quantity || 0), 0) };
  });
  return map;
};

export const selectCartCount = (state: RootState) => (state.cart.items || []).reduce((s, i) => s + (i.quantity || 0), 0);

export const selectCartDistinctCount = (state: RootState) => (state.cart.items || []).length;

export const selectCartTotalPrice = (state: RootState) =>
  (state.cart.items || []).reduce((sum, item) => {
    const unit = typeof item.snapshotPrice === "number" ? item.snapshotPrice : (item.price ?? 0);
    return sum + unit * (item.quantity || 0);
  }, 0);

export const selectCartGst = (state: RootState) => {
  const subtotal = selectCartTotalPrice(state);
  return Number((subtotal * GST_RATE).toFixed(2));
};

export const selectCartTotalWithGst = (state: RootState) => {
  const subtotal = selectCartTotalPrice(state);
  const gst = Number((subtotal * GST_RATE).toFixed(2));
  return Number((subtotal + gst).toFixed(2));
};

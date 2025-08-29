import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import AsyncStorage from "@react-native-async-storage/async-storage";
import selectedShopReducer from "./Slice/selectedShopSlice";
import cartReducer from './Slice/cartSlice';
import locationReducer from './Slice/locationSlice'
import serviceReducer from './Slice/serviceAvailablilitySlice'
import profileReducer from "@/src/Redux/Slice/profileSlice";
// 1️⃣ Combine reducers
const rootReducer = combineReducers({
  cart:cartReducer,
  selectedShop: selectedShopReducer,
  location:locationReducer,
  service:serviceReducer,// later add thi line bcz when app is started then app is crash ,
  profile:profileReducer
});
// 2️⃣ Create persist config
const persistConfig = {
  key: "root",
  storage: AsyncStorage,
  whitelist: ["selectedShop"], // only persist this slice
};


// 3️⃣ Wrap reducer with persistReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);
// 4️⃣ Create store with persisted reducer
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required for redux-persist
    }),
});
// 5️⃣ Export persistor
export const persistor = persistStore(store);
// Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
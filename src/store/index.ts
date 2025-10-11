import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

// 🧩 Combine all reducers
const rootReducer = combineReducers({
  auth: authReducer,
  // user: userReducer,        // (future)
  // product: productReducer,  // (future)
});

// 💾 redux-persist config
const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

// 🏗️ Create store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // required by redux-persist
    }),
});

// 🔁 Persistor
export const persistor = persistStore(store);

// 🧠 Types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// ✅ Typed hooks (most important!)
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

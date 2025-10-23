import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type SocketState = {
  isConnected: boolean;
  lastDisconnectReason?: string | null;
};

const initialState: SocketState = {
  isConnected: false,
  lastDisconnectReason: null,
};

const socketSlice = createSlice({
  name: "socket",
  initialState,
  reducers: {
    setSocketConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    setSocketDisconnectReason: (state, action: PayloadAction<string | null>) => {
      state.lastDisconnectReason = action.payload;
    },
  },
});

export const { setSocketConnected, setSocketDisconnectReason } = socketSlice.actions;
export default socketSlice.reducer;

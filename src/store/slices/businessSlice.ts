import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"; import { businessService } from "../../services/businessService";
import type { Business } from "../../types/business";

interface BusinessState {
    currentBusiness: Business | null;
    businesses: Business[];
    status: "idle" | "loading" | "succeeded" | "failed";
    error: string | null;
}

const initialState: BusinessState = {
    currentBusiness: null,
    businesses: [],
    status: "idle",
    error: null,
};

// 🧩 CREATE BUSINESS (API)
export const createBusiness = createAsyncThunk(
    "business/create",
    async (
        { token, data }: { token: string; data: Partial<Business> },
        { rejectWithValue }
    ) => {
        try {
            const business = await businessService.createBusiness(token, data);
            return business;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// ✏️ UPDATE BUSINESS (API)
export const updateBusiness = createAsyncThunk(
    "business/update",
    async (
        { token, businessId, data }: { token: string; businessId: string; data: Partial<Business> },
        { rejectWithValue }
    ) => {
        try {
            const business = await businessService.updateBusiness(token, businessId, data);
            return business;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

// 🔍 FETCH BUSINESS (API)
export const fetchBusiness = createAsyncThunk(
    "business/fetch",
    async (
        { token, businessId }: { token: string; businessId: string },
        { rejectWithValue }
    ) => {
        try {
            const business = await businessService.getBusiness(token, businessId);
            return business;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const businessSlice = createSlice({
    name: "business",
    initialState,
    reducers: {
        // 🧭 Manual/local state updates for socket events:
        addBusinessLocally(state, action: PayloadAction<Business>) {
            state.businesses.push(action.payload);
            state.currentBusiness = action.payload;
        },
        updateBusinessLocally(state, action: PayloadAction<Business>) {
            const idx = state.businesses.findIndex(
                (b) => b.businessId === action.payload.businessId
            );
            if (idx !== -1) state.businesses[idx] = action.payload;
            if (state.currentBusiness?.businessId === action.payload.businessId) {
                state.currentBusiness = action.payload;
            }
        },
        removeBusinessLocally(state, action: PayloadAction<string>) {
            state.businesses = state.businesses.filter(
                (b) => b.businessId !== action.payload
            );
            if (state.currentBusiness?.businessId === action.payload) {
                state.currentBusiness = null;
            }
        },
        setCurrentBusiness(state, action: PayloadAction<Business | null>) {
            state.currentBusiness = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createBusiness.pending, (state) => {
                state.status = "loading";
            })
            .addCase(createBusiness.fulfilled, (state, action) => {
                state.status = "succeeded";
                state.currentBusiness = action.payload;
                state.businesses.push(action.payload);
            })
            .addCase(createBusiness.rejected, (state, action) => {
                state.status = "failed";
                state.error = action.payload as string;
            })
            .addCase(updateBusiness.fulfilled, (state, action) => {
                const updated = action.payload;
                const idx = state.businesses.findIndex(
                    (b) => b.businessId === updated.businessId
                );
                if (idx !== -1) state.businesses[idx] = updated;
                state.currentBusiness = updated;
            })
            .addCase(fetchBusiness.fulfilled, (state, action) => {
                state.currentBusiness = action.payload;
            });
    },
});

export const {
    setCurrentBusiness,
    addBusinessLocally,
    updateBusinessLocally,
    removeBusinessLocally,
} = businessSlice.actions;

export const selectCurrentBusiness = (state: any) => state.business.currentBusiness;
export const selectBusinesses = (state: any) => state.business.businesses;

export default businessSlice.reducer;

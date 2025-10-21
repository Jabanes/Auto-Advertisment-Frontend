import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit"; import { businessService } from "../../services/businessService";
import type { Business } from "../../types/business";
import { RequestStatus } from "../../types/requestStatus";

interface BusinessState {
    currentBusinessId: string | null;
    currentBusiness: Business | null;
    businesses: Business[];
    status: RequestStatus;
    error: string | null;
}

const initialState: BusinessState = {
    currentBusinessId: null,
    currentBusiness: null,
    businesses: [],
    status: RequestStatus.IDLE,
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

// 📦 FETCH ALL BUSINESSES (API)
export const fetchAllBusinesses = createAsyncThunk(
    "business/fetchAll",
    async (token: string, { rejectWithValue }) => {
        try {
            const businesses = await businessService.getAllBusinesses(token);
            return businesses;
        } catch (err: any) {
            return rejectWithValue(err.message);
        }
    }
);

const businessSlice = createSlice({
    name: "business",
    initialState,
    reducers: {
        // Hydrates businesses from login payload
        setBusinesses: (state, action: PayloadAction<Business[]>) => {
            state.businesses = action.payload;
            state.status = RequestStatus.SUCCEEDED;
            // Auto-select first business if none selected
            if (!state.currentBusinessId && action.payload.length > 0) {
                state.currentBusinessId = action.payload[0].businessId;
                state.currentBusiness = action.payload[0];
            }
        },

        // 🧭 Manual/local state updates for socket events:
        addBusinessLocally(state, action: PayloadAction<Business>) {
            // Avoid duplicates
            const exists = state.businesses.some(
                (b) => b.businessId === action.payload.businessId
            );
            if (!exists) {
                state.businesses.push(action.payload);
                // Auto-select if it's the first business
                if (!state.currentBusinessId) {
                    state.currentBusinessId = action.payload.businessId;
                    state.currentBusiness = action.payload;
                }
            }
        },
        updateBusinessLocally(state, action: PayloadAction<Business>) {
            const idx = state.businesses.findIndex(
                (b) => b.businessId === action.payload.businessId
            );
            if (idx !== -1) {
                state.businesses[idx] = action.payload;
            } else {
                console.warn(`Business ${action.payload.businessId} not found locally, adding it`);
                state.businesses.push(action.payload);
            }
            
            // Update current business if it's the same one
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
                state.currentBusinessId = null;
                // Auto-select first remaining business
                if (state.businesses.length > 0) {
                    state.currentBusinessId = state.businesses[0].businessId;
                    state.currentBusiness = state.businesses[0];
                }
            }
        },
        setCurrentBusinessId(state, action: PayloadAction<string | null>) {
            state.currentBusinessId = action.payload;
            // Find and set the current business
            if (action.payload) {
                const business = state.businesses.find(
                    (b) => b.businessId === action.payload
                );
                state.currentBusiness = business || null;
            } else {
                state.currentBusiness = null;
            }
        },
        setCurrentBusiness(state, action: PayloadAction<Business | null>) {
            state.currentBusiness = action.payload;
            state.currentBusinessId = action.payload?.businessId || null;
        },
        clearBusinesses(state) {
            state.businesses = [];
            state.currentBusiness = null;
            state.currentBusinessId = null;
            state.status = RequestStatus.IDLE;
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // CREATE
            .addCase(createBusiness.pending, (state) => {
                state.status = RequestStatus.LOADING;
            })
            .addCase(createBusiness.fulfilled, (state, action) => {
                state.status = RequestStatus.SUCCEEDED;
                // Avoid duplicates
                const exists = state.businesses.some(
                    (b) => b.businessId === action.payload.businessId
                );
                if (!exists) {
                    state.businesses.push(action.payload);
                }
                state.currentBusiness = action.payload;
                state.currentBusinessId = action.payload.businessId;
            })
            .addCase(createBusiness.rejected, (state, action) => {
                state.status = RequestStatus.FAILED;
                state.error = action.payload as string;
            })
            
            // UPDATE
            .addCase(updateBusiness.pending, (state) => {
                state.status = RequestStatus.LOADING;
            })
            .addCase(updateBusiness.fulfilled, (state, action) => {
                state.status = RequestStatus.SUCCEEDED;
                const updated = action.payload;
                const idx = state.businesses.findIndex(
                    (b) => b.businessId === updated.businessId
                );
                if (idx !== -1) {
                    state.businesses[idx] = updated;
                }
                if (state.currentBusinessId === updated.businessId) {
                    state.currentBusiness = updated;
                }
            })
            .addCase(updateBusiness.rejected, (state, action) => {
                state.status = RequestStatus.FAILED;
                state.error = action.payload as string;
            })
            
            // FETCH ONE
            .addCase(fetchBusiness.pending, (state) => {
                state.status = RequestStatus.LOADING;
            })
            .addCase(fetchBusiness.fulfilled, (state, action) => {
                state.status = RequestStatus.SUCCEEDED;
                state.currentBusiness = action.payload;
                state.currentBusinessId = action.payload.businessId;
                // Update in list if exists
                const idx = state.businesses.findIndex(
                    (b) => b.businessId === action.payload.businessId
                );
                if (idx !== -1) {
                    state.businesses[idx] = action.payload;
                } else {
                    state.businesses.push(action.payload);
                }
            })
            .addCase(fetchBusiness.rejected, (state, action) => {
                state.status = RequestStatus.FAILED;
                state.error = action.payload as string;
            })
            
            // FETCH ALL
            .addCase(fetchAllBusinesses.pending, (state) => {
                state.status = RequestStatus.LOADING;
            })
            .addCase(fetchAllBusinesses.fulfilled, (state, action) => {
                state.status = RequestStatus.SUCCEEDED;
                state.businesses = action.payload;
                // Auto-select first if none selected
                if (!state.currentBusinessId && action.payload.length > 0) {
                    state.currentBusinessId = action.payload[0].businessId;
                    state.currentBusiness = action.payload[0];
                }
            })
            .addCase(fetchAllBusinesses.rejected, (state, action) => {
                state.status = RequestStatus.FAILED;
                state.error = action.payload as string;
            });
    },
});

export const {
    setBusinesses,
    setCurrentBusiness,
    setCurrentBusinessId,
    addBusinessLocally,
    updateBusinessLocally,
    removeBusinessLocally,
    clearBusinesses,
} = businessSlice.actions;

export const selectCurrentBusinessId = (state: any) => state.business.currentBusinessId;
export const selectCurrentBusiness = (state: any) => state.business.currentBusiness;
export const selectBusinesses = (state: any) => state.business.businesses;
export const selectBusinessStatus = (state: any) => state.business.status;

export default businessSlice.reducer;

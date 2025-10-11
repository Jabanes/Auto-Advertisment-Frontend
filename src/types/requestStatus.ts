// src/types/requestStatus.ts
// Used for async thunk lifecycle statuses in Redux

export const RequestStatus = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCEEDED: "succeeded",
  FAILED: "failed",
} as const;

export type RequestStatus =
  (typeof RequestStatus)[keyof typeof RequestStatus];

# Real-Time Sync Test Plan

## Overview
This document describes how to validate the WebSocket-driven real-time synchronization architecture.

---

## Prerequisites

1. **Backend running**: `npm start` in `Auto-Advertisment-Backend/product-uploader/`
2. **Frontend running**: `npm run dev` in `Auto-Advertisment-Frontend/auto-ads-web/`
3. **n8n workflow active**: `VITE_N8N_URL` configured and workflow enabled
4. **Environment variables set**:
   - `VITE_API_URL` (backend URL)
   - `VITE_N8N_URL` (n8n webhook URL)

---

## Test Scenarios

### 1. Socket Connection & Authentication

**Steps:**
1. Open browser DevTools → Network → WS tab
2. Log in with Google or email/password
3. Observe socket connection

**Expected Results:**
- ✅ WebSocket connection established to backend
- ✅ Console logs: `✅ Socket connected: <socket-id> → user:<uid>`
- ✅ Backend logs: `🔌 Socket connected: <socket-id> → joined room user:<uid>`
- ✅ No authentication errors

**Validation:**
```javascript
// In browser console:
// You should see:
// 🔌 Initializing socket connection...
// ✅ Socket connected: <id> → user:<uid>
```

---

### 2. Initial Data Load (Bootstrap)

**Steps:**
1. Clear browser cache/localStorage
2. Log in fresh
3. Check Redux DevTools

**Expected Results:**
- ✅ Products hydrated from login response (check listenerMiddleware)
- ✅ No redundant GET /products call after login
- ✅ Redux state populated with `items`, `businesses`, `user`

**Firestore Read Count:**
- Initial login: **1 read** (user doc + subcollections via backend)
- No additional reads for products (served from login response)

---

### 3. Product Creation (Real-Time)

**Steps:**
1. Open two browser tabs, both logged in as same user
2. In Tab 1: Click "Add Product" → Fill form → Save
3. Observe Tab 2 (do NOT refresh)

**Expected Results:**
- ✅ Tab 1: Product appears immediately after save
- ✅ Tab 2: Product appears automatically (within ~100ms)
- ✅ Console in both tabs: `📦 product:created <id>`
- ✅ Backend logs: `📡 Emitted product:created for <id>`

**Validation:**
- No manual refresh needed
- No additional GET requests to fetch the product
- Firestore: **1 write** (product doc), **0 extra reads**

---

### 4. Product Update via n8n Workflow (Processing → Enriched)

**Steps:**
1. Open product list
2. Right-click product → Click "Generate"
3. Observe UI (do NOT refresh)

**Expected Results:**

**Phase 1: Optimistic Update**
- ✅ Processing overlay appears immediately
- ✅ Animated spinner visible
- ✅ Product card slightly dimmed (grayscale filter)
- ✅ Status badge shows "PROCESSING"

**Phase 2: n8n Workflow Execution**
- ✅ n8n webhook called successfully (check n8n logs)
- ✅ n8n generates caption, prompt, and image
- ✅ n8n calls `PATCH /products/update/:businessId/:productId` with results

**Phase 3: Server Event & UI Update**
- ✅ Backend emits `product:updated` event with `status: "enriched"`
- ✅ Frontend receives event: `📦 product:updated <id> status: enriched`
- ✅ Processing overlay disappears
- ✅ New image displayed
- ✅ Status badge shows "ENRICHED" (green)

**Timing:**
- Optimistic update: **instant**
- n8n completion: **5-15 seconds** (depends on OpenAI)
- Socket event delivery: **< 100ms**

**Validation:**
```javascript
// In browser console, you should see:
// 1. (immediate) Optimistic status set to "processing"
// 2. (5-15s later) 📦 product:updated <id> status: enriched
```

**Firestore Operations:**
- n8n → backend PATCH: **1 write**
- Frontend: **0 reads** (data comes via WebSocket)

---

### 5. Product Update Failure (Processing → Failed)

**Steps:**
1. Temporarily break n8n workflow (disable a node or remove OpenAI key)
2. Trigger "Generate" on a product
3. Wait for workflow to fail

**Expected Results:**
- ✅ Processing overlay appears
- ✅ After failure (5-30s): Status changes to "FAILED" (red badge)
- ✅ Processing overlay disappears
- ✅ Console: `📦 product:updated <id> status: failed`
- ✅ Error message visible in product card (if implemented)

**Recovery:**
- User can retry "Generate" manually
- Fix n8n workflow and retry

---

### 6. Product Deletion (Real-Time)

**Steps:**
1. Open two browser tabs as same user
2. In Tab 1: Right-click product → Click "Delete" → Confirm
3. Observe Tab 2 (do NOT refresh)

**Expected Results:**
- ✅ Tab 1: Product disappears immediately
- ✅ Tab 2: Product disappears automatically
- ✅ Console in both tabs: `📦 product:deleted <id>`
- ✅ Backend logs: `📡 Emitted product:deleted for <id>`

**Firestore Operations:**
- **1 delete** (product doc)
- **Storage cleanup** (folder deleted)
- **0 extra reads**

---

### 7. Multiple Simultaneous Users (Isolation)

**Steps:**
1. Log in as User A in Tab 1
2. Log in as User B in Tab 2 (different account)
3. Create/update product in Tab 1 as User A
4. Observe Tab 2 (User B)

**Expected Results:**
- ✅ User B does NOT see User A's changes
- ✅ Each user only receives events in their own room: `user:<uid>`
- ✅ No cross-user data leakage

---

### 8. Socket Reconnection Handling

**Steps:**
1. Log in and load products
2. Open DevTools → Network → WS tab
3. Manually disconnect socket or kill backend temporarily
4. Restart backend after 5 seconds
5. Observe console

**Expected Results:**
- ✅ Console: `🔌 Socket disconnected: <reason>`
- ✅ Console: `🔄 Socket reconnection attempt 1...`
- ✅ Console: `🔄 Socket reconnected after <n> attempts`
- ✅ Socket automatically rejoins `user:<uid>` room
- ✅ UI continues to function after reconnection

**Fallback:**
- If reconnection fails after 5 attempts, user can refresh page
- Consider adding UI indicator for "offline" state (future enhancement)

---

### 9. Processing Overlay Animation Reliability

**Steps:**
1. Trigger "Generate" on a product
2. Observe spinner animation continuously
3. Wait for completion (enriched/failed)

**Expected Results:**
- ✅ Spinner rotates smoothly (1s per rotation, infinite loop)
- ✅ "Processing..." text visible
- ✅ Overlay doesn't flicker or disappear early
- ✅ Overlay only hides when server event updates status

**CSS Validation:**
```javascript
// In browser console:
const style = document.querySelector('style');
console.log(style.innerHTML);
// Should contain @keyframes spin and fadeIn
```

---

### 10. Browser Tab in Background

**Steps:**
1. Trigger "Generate" on a product
2. Switch to another browser tab for 10 seconds
3. Switch back to app tab

**Expected Results:**
- ✅ Product status updated correctly (no stale data)
- ✅ Socket events were queued and processed when tab regained focus
- ✅ UI reflects latest state

---

## Performance Metrics

### Firestore Usage (Per User Session)

**Before WebSocket Implementation:**
- Login: 1 read
- Product create: 1 write + 1 read
- Product update: 1 write + 1 read
- Product delete: 1 delete + 1 read (to confirm)
- Manual refresh: 1 read (all products)
- **Total for 10 operations: ~15-20 reads**

**After WebSocket Implementation:**
- Login: 1 read
- Product create: 1 write + **0 reads** (socket event)
- Product update: 1 write + **0 reads** (socket event)
- Product delete: 1 delete + **0 reads** (socket event)
- No manual refresh needed
- **Total for 10 operations: ~1-2 reads**

**Savings: ~70-85% reduction in Firestore reads**

---

## Debugging Tips

### Check Socket Connection Status
```javascript
// In browser console:
const state = store.getState();
console.log('Auth token:', state.auth.serverToken);
console.log('User UID:', state.auth.user?.uid);
```

### Monitor WebSocket Events in Real-Time
```javascript
// Add to useSocket temporarily:
socket.onAny((eventName, ...args) => {
  console.log(`🔔 Socket event: ${eventName}`, args);
});
```

### Verify Backend Event Emission
```bash
# In backend logs, search for:
grep "📡 Emitted" logs.txt
```

### Check Redux State
- Open Redux DevTools
- Watch `products.items` array during operations
- Verify `status` field transitions: `pending → processing → enriched/failed`

---

## Known Limitations & Future Improvements

1. **Socket authentication**: Currently requires manual token refresh when Firebase token expires. Consider implementing automatic token refresh.

2. **Offline mode**: No offline queue for mutations. If user is offline, operations will fail. Consider adding offline persistence.

3. **Optimistic rollback**: If server rejects an operation, optimistic update isn't rolled back. Consider implementing reconciliation logic.

4. **Multi-device sync**: Events are scoped per user, not per device. All tabs/devices for same user receive same events (this is desired behavior).

5. **Event ordering**: Socket.IO preserves event order, but if multiple events arrive simultaneously, order is FIFO. This is acceptable for current use case.

---

## Success Criteria

✅ **No polling**: Zero interval-based fetches  
✅ **No manual refresh**: Users never need to refresh page  
✅ **Instant UI updates**: Changes reflect within 100ms of server event  
✅ **Minimal Firestore reads**: Only on initial login  
✅ **Processing spinner works**: Animation runs smoothly until server event  
✅ **Multi-user isolation**: Users only see their own data  
✅ **Reconnection resilient**: Automatic reconnection after disconnect  

---

## Rollback Plan

If issues arise, revert to polling-based approach:

1. Disable socket hook in `App.tsx`: Comment out `useSocket()`
2. Add polling interval in `ProductsScreen.tsx`:
   ```typescript
   useEffect(() => {
     const interval = setInterval(() => {
       dispatch(fetchProducts(token));
     }, 5000); // Poll every 5 seconds
     return () => clearInterval(interval);
   }, [token]);
   ```
3. Keep backend socket emissions (harmless if frontend doesn't listen)

---

## Contact & Support

For issues or questions:
- Check backend logs: `Auto-Advertisment-Backend/product-uploader/`
- Check frontend console: Browser DevTools
- Review socket event contract: `SOCKET_EVENT_CONTRACT.md`


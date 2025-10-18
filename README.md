# Auto-Advertisement Frontend

React + TypeScript + Vite application for automated product advertisement generation.

## Features

- 🔐 **Firebase Authentication** (Google OAuth + Email/Password)
- 🔄 **Real-Time Sync** via WebSocket (Socket.IO)
- 🎨 **AI-Powered Ad Generation** (n8n + OpenAI)
- 📦 **Redux Toolkit** state management
- 🎯 **Type-Safe** with TypeScript
- ⚡ **Fast** with Vite

---

## Architecture

### Real-Time Synchronization

This app uses **WebSocket-driven event synchronization** to provide instant UI updates without polling or manual refresh.

**Key Benefits:**
- ✅ 70-85% reduction in Firestore reads
- ✅ No polling (100% event-driven)
- ✅ Instant UI updates (<100ms latency)
- ✅ Automatic reconnection on network issues

**Documentation:**
- 📖 [Real-Time Implementation Summary](./REALTIME_IMPLEMENTATION_SUMMARY.md) - Architecture overview and design decisions
- 📋 [Socket Event Contract](../../Auto-Advertisment-Backend/product-uploader/SOCKET_EVENT_CONTRACT.md) - Event definitions and payloads
- 🧪 [Test Plan](./REALTIME_SYNC_TEST_PLAN.md) - Validation scenarios and debugging tips

---

## Getting Started

### Prerequisites
- Node.js 18+ (LTS recommended)
- npm or yarn
- Firebase project with Authentication enabled
- Backend server running (see `Auto-Advertisment-Backend/`)

### Environment Variables

Create `.env.local` file:

```env
VITE_API_URL=http://localhost:3000
VITE_N8N_URL=https://your-n8n-instance.com
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

App will be available at `http://localhost:5173`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

---

## Project Structure

```
src/
├── api/              # HTTP client configuration
├── assets/           # Static assets
├── components/       # Reusable UI components
│   └── Dashboard/    # Dashboard-specific components
├── config/           # Configuration files (Firebase, etc.)
├── hooks/            # Custom React hooks (including WebSocket)
├── navigation/       # Route guards and navigation
├── screens/          # Page-level components
├── services/         # API service layer
├── store/            # Redux store
│   └── slices/       # Redux Toolkit slices
├── styles/           # Global styles and theme
└── types/            # TypeScript type definitions
```

---

## Key Technologies

- **React 18**: UI library with concurrent rendering
- **TypeScript**: Type safety and better DX
- **Vite**: Fast build tool and dev server
- **Redux Toolkit**: State management with less boilerplate
- **Socket.IO Client**: Real-time WebSocket communication
- **Firebase**: Authentication and file storage
- **Axios**: HTTP client for REST API calls
- **React Router v6**: Client-side routing

---

## State Management

### Redux Slices

1. **authSlice**: User authentication state, businesses
2. **productSlice**: Product list and CRUD operations

### Data Flow

```
Login → Backend → Auth Response (with products) → Redux Hydration
                                                      ↓
WebSocket Events → Socket Hook → Redux Actions → UI Updates
```

**No polling. No manual refresh. Pure event-driven.**

---

## WebSocket Events

The app listens to these events:

| Event | Description | Redux Action |
|-------|-------------|--------------|
| `product:created` | New product added | `addProductLocally()` |
| `product:updated` | Product modified (status, image, etc.) | `updateProductLocally()` |
| `product:deleted` | Product removed | `removeProductLocally()` |
| `business:created` | New business added | `addBusinessLocally()` |

See [Socket Event Contract](../../Auto-Advertisment-Backend/product-uploader/SOCKET_EVENT_CONTRACT.md) for detailed schemas.

---

## Product Lifecycle

```
pending → processing → enriched → posted
              ↓
            failed
```

1. **pending**: Newly created, awaiting enrichment
2. **processing**: AI workflow triggered (n8n)
3. **enriched**: AI-generated image and caption ready
4. **posted**: Manually published to social media (future)
5. **failed**: Enrichment failed (retry available)

---

## Development Guidelines

### TypeScript

- Use strict mode (enabled in `tsconfig.json`)
- Define types for all API responses in `src/types/`
- Prefer `interface` over `type` for object shapes

### Redux

- Use `createAsyncThunk` for API calls
- Keep reducers pure (no side effects)
- Use `listenerMiddleware` for cross-slice logic
- Avoid storing derived state (compute in selectors)

### Socket Events

- Handle events in `useProductSocket` hook only
- Dispatch Redux actions to update state
- Keep event handlers idempotent (can receive duplicates)

### Components

- Use functional components with hooks
- Avoid inline styles for complex components (use `theme.ts`)
- Keep components small and focused (SRP)

---

## Testing

See [Test Plan](./REALTIME_SYNC_TEST_PLAN.md) for manual testing scenarios.

**Quick Validation:**
```bash
# 1. Start backend
cd ../../Auto-Advertisment-Backend/product-uploader
npm start

# 2. Start frontend
npm run dev

# 3. Open browser DevTools → Network → WS tab
# 4. Log in and verify socket connection
# 5. Create/update/delete products and observe instant updates
```

---

## Troubleshooting

### Socket Connection Fails

**Symptoms**: No real-time updates, console shows connection errors

**Solutions:**
1. Verify backend is running: `curl http://localhost:3000`
2. Check `VITE_API_URL` in `.env.local`
3. Verify Firebase token is valid (check Redux state)
4. Check CORS settings in backend

### Products Don't Appear After Login

**Symptoms**: Empty product list despite having data

**Solutions:**
1. Check Redux DevTools → `products.items` array
2. Verify `listenerMiddleware` is hydrating products
3. Check backend logs for `/auth/google` or `/auth/register` response
4. Clear browser cache and localStorage

### Processing Spinner Doesn't Appear

**Symptoms**: Clicking "Generate" doesn't show overlay

**Solutions:**
1. Check if `product.status` is changing to "processing" (Redux DevTools)
2. Verify CSS keyframes are injected (check `<head>` in Elements tab)
3. Check console for errors in `ProductCard.tsx`

### Firestore Quota Exceeded

**Symptoms**: Backend errors mentioning quota

**Solutions:**
1. Verify WebSocket events are working (should reduce reads by 70%+)
2. Check for polling loops (shouldn't exist in this implementation)
3. Review Firestore usage in Firebase Console

---

## Contributing

1. Follow existing code style
2. Write type-safe code (no `any` without justification)
3. Test socket events with multiple tabs
4. Update documentation for API changes
5. Keep commits focused and descriptive

---

## License

Proprietary - All rights reserved

---

## Support

For issues or questions:
- Review [Implementation Summary](./REALTIME_IMPLEMENTATION_SUMMARY.md)
- Check [Test Plan](./REALTIME_SYNC_TEST_PLAN.md)
- Review backend logs and frontend console

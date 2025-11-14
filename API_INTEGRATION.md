# Hotshot Logistics API Integration

This document describes the integration of the Hotshot Logistics API into the mobile application.

## Overview

The mobile app has been updated to consume the Hotshot Logistics REST API (v1) as defined in the provided Swagger/OpenAPI specification. The integration includes:

- **TypeScript types** generated from the API schemas
- **Service layer** for all API endpoints
- **Authentication context** for managing auth state
- **Utility hooks** for API calls with loading and error handling
- **Data mappers** to convert API types to legacy UI types
- **Updated screens** to use real API data

## Architecture

### 1. Type Definitions (`/types/api.ts`)

Complete TypeScript interfaces generated from the Swagger specification, including:

- **Enums**: `JobStatus`, `JobPriority`, `InvoiceStatus`, `DriverStatus`, etc.
- **Models**: `Job`, `Customer`, `Driver`, `Invoice`, `Tracking`, etc.
- **Request/Response types**: Query parameters, request bodies, response models
- **Error handling**: `ProblemDetails` for API errors

### 2. API Client (`/services/apiClient.ts`)

Centralized API client that handles:

- **Authentication**: JWT token storage and management via AsyncStorage
- **Request building**: Automatic headers, URL construction, query params
- **Error handling**: Network errors, HTTP errors, response parsing
- **Retry logic**: Automatic retry for network failures (up to 2 retries)
- **Token management**: Automatic token injection and 401 handling

**Key Methods:**
- `get<T>(endpoint, params)` - GET requests
- `post<T>(endpoint, body)` - POST requests
- `put<T>(endpoint, body)` - PUT requests
- `patch<T>(endpoint, body)` - PATCH requests
- `delete<T>(endpoint)` - DELETE requests
- `upload<T>(endpoint, file, data)` - File uploads

### 3. Service Modules (`/services/`)

Organized service modules for each API domain:

- **JobService** (`jobService.ts`)
  - `getJobs(params)` - Get jobs with filtering/pagination
  - `getJobById(id)` - Get single job
  - `createJob(job)` - Create new job
  - `updateJob(id, job)` - Update job
  - `assignDriver(id, request)` - Assign driver to job
  - `updateJobStatus(id, request)` - Update job status
  - `getJobsByStatus(status)` - Filter by status
  - `getJobsByDriver(driverId)` - Driver's jobs
  - `getOverdueJobs()` - Get overdue jobs
  - `getJobStatusSummary()` - Job counts by status

- **DriverService** (`driverService.ts`)
  - `getDrivers()` - Get all drivers
  - `getDriverById(id)` - Get single driver
  - `createDriver(driver)` - Create driver
  - `updateDriver(id, driver)` - Update driver
  - `deleteDriver(id)` - Delete driver

- **TrackingService** (`trackingService.ts`)
  - `startTracking(request)` - Start tracking a job
  - `stopTracking(jobId)` - Stop tracking
  - `updateLocation(request)` - Update driver location
  - `getLocation(jobId)` - Get current location
  - `getLocationHistory(jobId, start, end)` - Location history
  - `checkDeviation(request)` - Check route deviation
  - `getPublicTracking(jobId)` - Public tracking for customers

- **CustomerService** (`customerService.ts`)
  - Full CRUD for customers
  - Get customer jobs and invoices
  - Update credit limits and terms

- **BillingService** (`billingService.ts`)
  - Generate invoices
  - Process payments
  - Calculate taxes
  - Get accounts receivable reports

- **UserProfileService** (`userProfileService.ts`)
  - Get/update user profile
  - Sync profile with server

- **JobAssignmentService** (`jobAssignmentService.ts`)
  - Assign/unassign jobs
  - Get assignments by driver or job
  - Update assignment status

### 4. Authentication Context (`/contexts/AuthContext.tsx`)

React Context for managing authentication state:

**State:**
- `isAuthenticated: boolean` - Auth status
- `isLoading: boolean` - Loading state
- `user: UserProfile | null` - Current user
- `token: string | null` - JWT token

**Methods:**
- `login(token)` - Login with JWT token
- `logout()` - Logout and clear state
- `refreshProfile()` - Reload user profile

**Usage:**
```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { isAuthenticated, user, login, logout } = useAuth();
  // ...
}
```

### 5. Custom Hooks (`/hooks/useApiCall.ts`)

Helper hooks for API calls:

**`useApiCall<T>(apiFunction, options)`**
For API calls that return data to display:

```tsx
const { data, error, isLoading, execute, reset } = useApiCall(
  jobService.getJobs
);

// Execute the API call
await execute({ status: JobStatus.Pending });
```

**`useApiAction<T>(apiFunction, options)`**
For one-off actions (delete, update, etc.):

```tsx
const { isLoading, execute } = useApiAction(jobService.deleteJob);

// Execute and get success/failure
const success = await execute(jobId);
```

### 6. Data Mappers (`/utils/mappers.ts`)

Utility functions to convert API types to legacy UI types:

- `mapApiJobToLegacy(apiJob)` - Convert API Job to LegacyJob
- `mapApiJobsToLegacy(apiJobs)` - Convert Job array
- `mapJobStatus(apiStatus)` - Map JobStatus enum
- `mapJobPriority(apiPriority)` - Map JobPriority enum
- `mapLegacyPriorityToApi(priority)` - Reverse mapping

**Why?** The UI components expect the `LegacyJob` interface format. These mappers provide backward compatibility while using the new API.

## Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# API Base URL
EXPO_PUBLIC_API_URL=https://api.hotshotlogistics.com
```

**For different environments:**
- **Local**: `http://localhost:3000` or `http://192.168.1.x:3000` (use your machine's IP)
- **Staging**: `https://staging-api.hotshotlogistics.com`
- **Production**: `https://api.hotshotlogistics.com`

> **Note**: For local development on iOS simulator, use `localhost`. For Android emulator, use `10.0.2.2`. For physical devices, use your computer's IP address on the local network.

## Updated Screens

### Jobs Screen (`/app/(tabs)/index.tsx`)

**Changes:**
- ✅ Fetches jobs from API on mount and filter change
- ✅ Loads only pending/available jobs
- ✅ Pull-to-refresh support
- ✅ Loading state with spinner
- ✅ Accept job functionality (assigns driver via API)
- ✅ Filter by priority (client-side + server-side)
- ✅ Error handling with alerts
- ✅ Maps API jobs to legacy format for UI

**API Calls:**
- `GET /api/Job?status=Pending&pageSize=50` - Load jobs
- `POST /api/Job/{id}/assign-driver` - Accept job

### Active Job Screen

**Status:** Pending - needs tracking API integration

**TODO:**
- Load assigned job for current driver
- Integrate real-time location tracking
- Update job status via API
- Start/stop tracking

### History Screen

**Status:** Pending - needs API integration

**TODO:**
- Load completed jobs
- Fetch earnings data
- Display performance metrics

### Profile Screen

**Status:** Pending - needs API integration

**TODO:**
- Load driver profile from API
- Update profile via API
- Upload profile photo
- Logout functionality

## Dependencies Added

The following dependencies were added to `package.json`:

```json
{
  "@react-native-async-storage/async-storage": "^2.1.0"
}
```

**Install dependencies:**
```bash
npm install
# or
yarn install
```

## Authentication Flow

1. **Login**: User logs in (authentication screen needed)
   - Receive JWT token from auth endpoint
   - Call `login(token)` from AuthContext
   - Token stored in AsyncStorage
   - User profile loaded from `/api/UserProfile/me`

2. **Authenticated Requests**: All API calls automatically include token
   - ApiClient adds `Authorization: Bearer {token}` header
   - 401 responses automatically clear token

3. **Logout**: User logs out
   - Call `logout()` from AuthContext
   - Token cleared from AsyncStorage
   - Navigation to login screen

## Error Handling

### API Errors

Errors are returned in the `ProblemDetails` format:

```typescript
{
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}
```

### Error Scenarios

1. **Network Errors**: Automatically retried up to 2 times
2. **401 Unauthorized**: Token cleared, user needs to re-authenticate
3. **400 Bad Request**: Validation error, show detail to user
4. **404 Not Found**: Resource not found
5. **500 Server Error**: Generic server error

### Error Display

- Alerts for critical errors
- Toast notifications for minor errors (future)
- Inline errors for form validation (future)

## Testing

### Mock vs Real API

The app now uses the **real API** instead of mock data.

To switch back to mock data (for development without API):
1. Comment out API calls in screen files
2. Import and use mock data from `/data/`

### Testing Checklist

- [ ] Test with valid API_URL in .env
- [ ] Test authentication flow
- [ ] Test job loading and filtering
- [ ] Test job acceptance
- [ ] Test pull-to-refresh
- [ ] Test error scenarios (network offline, 401, 404, etc.)
- [ ] Test loading states
- [ ] Test on iOS simulator
- [ ] Test on Android emulator
- [ ] Test on physical device

## Future Enhancements

### Immediate (Sprint 1)
- [ ] Implement login/signup screens
- [ ] Integrate Active Job screen with tracking API
- [ ] Integrate History screen with API
- [ ] Integrate Profile screens with API
- [ ] Add customer phone/name to Job API (currently missing)

### Short-term (Sprint 2)
- [ ] Real-time location tracking
- [ ] Push notifications for job updates
- [ ] Document upload/camera integration
- [ ] Offline mode with local caching
- [ ] Search functionality
- [ ] Advanced filtering

### Medium-term (Sprint 3)
- [ ] WebSocket integration for real-time updates
- [ ] Optimistic UI updates
- [ ] Better error handling (toast notifications)
- [ ] Retry failed requests
- [ ] Request queuing for offline mode
- [ ] Analytics integration

## API Limitations & Workarounds

### 1. Customer Information

**Issue**: Job API doesn't include customer name/phone directly.

**Workaround**:
- Jobs include `customerId`
- Need to fetch customer details separately via `/api/Customer/{id}`
- Consider adding customer info to Job response

**Current approach**: Display placeholder "Customer" text

### 2. Driver ID

**Issue**: Need current driver ID for job acceptance.

**Workaround**:
- Hardcoded to `driverId: 1` for now
- Should come from UserProfile or AuthContext
- Update once user management is implemented

### 3. Distance Calculation

**Issue**: API doesn't provide distance directly.

**Workaround**:
- Calculate from pricing data (estimate)
- Could calculate from lat/long coordinates
- Better: Add distance field to API response

## File Structure

```
hotshotLogistics-mobile/
├── types/
│   ├── api.ts                 # API type definitions (NEW)
│   └── job.ts                 # Legacy types (existing)
├── services/
│   ├── apiClient.ts           # HTTP client (NEW)
│   ├── jobService.ts          # Job API (NEW)
│   ├── driverService.ts       # Driver API (NEW)
│   ├── trackingService.ts     # Tracking API (NEW)
│   ├── customerService.ts     # Customer API (NEW)
│   ├── billingService.ts      # Billing API (NEW)
│   ├── userProfileService.ts  # User Profile API (NEW)
│   ├── jobAssignmentService.ts # Job Assignment API (NEW)
│   └── index.ts               # Service exports (NEW)
├── contexts/
│   └── AuthContext.tsx        # Auth state management (NEW)
├── hooks/
│   ├── useApiCall.ts          # API call hook (NEW)
│   └── useFrameworkReady.ts   # Framework init (existing)
├── utils/
│   └── mappers.ts             # Type mappers (NEW)
├── app/(tabs)/
│   ├── index.tsx              # Jobs screen (UPDATED)
│   ├── active.tsx             # Active job (TODO)
│   ├── history.tsx            # History (TODO)
│   └── profile.tsx            # Profile (TODO)
├── _layout.tsx                # Root layout (UPDATED - AuthProvider)
├── .env.example               # Environment template (NEW)
└── API_INTEGRATION.md         # This file (NEW)
```

## Support

For issues or questions about the API integration:

1. Check this documentation
2. Review the Swagger specification
3. Check the API error response
4. Look at console logs for detailed errors
5. Contact the backend team if API issues persist

## Changelog

### v1.0.0 - 2025-01-14

- ✅ Initial API integration
- ✅ TypeScript types from Swagger spec
- ✅ Complete service layer
- ✅ Authentication context
- ✅ API client with retry logic
- ✅ Jobs screen integration
- ✅ Error handling
- ✅ Loading states
- ✅ Data mappers for backward compatibility
- ⏳ Active job screen (pending)
- ⏳ History screen (pending)
- ⏳ Profile screens (pending)
- ⏳ Real-time tracking (pending)

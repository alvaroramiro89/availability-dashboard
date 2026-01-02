# System Architecture - Availability Dashboard

## 📐 General Architecture

### Architectural Pattern

**Client-Server** architecture with separation of concerns:

```
┌─────────────────┐         HTTP/REST API         ┌─────────────────┐
│                 │  ────────────────────────────> │                 │
│   Frontend      │                                │    Backend      │
│  (React SPA)    │  <─────────────────────────── │  (Vercel        │
│                 │         JSON Responses          │   Serverless)   │
└─────────────────┘                                └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │  GitHub Gist    │
                                                  │  availability   │
                                                  │     .json       │
                                                  │  (Cloud Storage)│
                                                  └─────────────────┘
```

## 🏗️ Technology Stack

### Frontend

- **Language**: TypeScript
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Framework**: Tailwind CSS
- **Font**: Google Fonts (Montserrat)
- **Local Storage**: localStorage (for user selection, authentication, and rate limiting)
- **Communication**: Fetch API (REST)

### Backend

- **Platform**: Vercel Serverless Functions
- **Runtime**: Node.js
- **Framework**: `@vercel/node`
- **API Client**: `@octokit/rest` (GitHub Gist API)
- **Endpoints**:
  - `GET /api/availability`: Read availability data
  - `POST /api/availability-batch`: Batch update availability

### Persistence

- **Type**: GitHub Gist (cloud-based JSON storage)
- **Format**: JSON
- **Location**: GitHub Gist (cloud)
- **Strategy**: Read-write entire JSON file
- **Versioning**: Automatic (GitHub Gist revisions)
- **Backup**: Automatic (GitHub Gist history)

### Local Development

- **Local Server**: Express.js (`server-local.js`)
- **Local Storage**: `data-local.json` (file-based)
- **Port**: 3000

## 📁 Project Structure

```
artifacts-project/
├── src/
│   ├── components/          # React components
│   │   ├── Calendar.tsx
│   │   ├── ControlCards.tsx
│   │   ├── MemberModal.tsx
│   │   ├── PasswordModal.tsx
│   │   └── TimeSlot.tsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.ts      # Authentication logic
│   │   └── useAvailability.ts  # Availability state management
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/              # Utility functions
│   │   ├── api.ts          # API client
│   │   ├── constants.ts    # Constants (members, time slots)
│   │   ├── dateUtils.ts    # Date formatting
│   │   └── rateLimit.ts    # Rate limiting logic
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── api/                    # Vercel Serverless Functions
│   ├── availability.ts     # GET /api/availability
│   └── availability-batch.ts  # POST /api/availability-batch
├── server-local.js          # Local development server
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## 🔄 Data Flow

### 1. Initialization

```
User opens application
  → React app loads
  → Checks localStorage for authenticated user
  → If no user: shows member selection modal
  → User selects member → password modal appears
  → User enters any password (dummy auth) → authenticated
  → GET /api/availability
  → Serverless Function reads GitHub Gist
  → Initializes missing data (all slots default to false/red)
  → Returns all 2026 dates data
  → Frontend renders calendar
```

### 2. Availability Update Flow

```
User clicks on time slot
  → toggleAvailability() executes
  → Updates local state (optimistic update)
  → Adds change to pendingChanges Map
  → UI updates immediately (green/red toggle)
  → User clicks "UPDATE" button
  → Rate limit check (max 3 updates per 15 minutes)
  → If allowed: POST /api/availability-batch with all pending changes
  → Serverless Function reads current Gist
  → Applies all changes to JSON
  → Updates Gist with complete JSON
  → Returns success response
  → Frontend clears pendingChanges
  → Updates "Last Updated" timestamp
  → Reloads data from API
```

### 3. Month Navigation

```
User clicks "Previous/Next Month"
  → changeMonth() executes
  → Updates currentDate state
  → Calendar component re-renders with new month
  → Data already loaded (all 2026 dates)
```

## 🎨 System Layers

### Presentation Layer (Frontend)

- **Responsibility**: UI/UX, user interaction
- **Technology**: React 18, TypeScript, Tailwind CSS
- **Local State**:
  - `selectedMember`: Current authenticated user
  - `viewAllMembers`: View mode (single/all members)
  - `currentDate`: Calendar date
  - `availabilityData`: Cached availability data
  - `pendingChanges`: Map of uncommitted changes
  - `lastUpdated`: Timestamp of last successful update

### Application Layer (Backend API)

- **Responsibility**: Business logic, validation, orchestration
- **Technology**: Vercel Serverless Functions
- **Endpoints**:
  - `GET /api/availability`: Read all availability data
  - `POST /api/availability-batch`: Batch update availability
- **Features**:
  - Automatic data initialization for all 2026 dates
  - Validation of member names and time slots
  - Error handling and logging

### Persistence Layer

- **Responsibility**: Data storage
- **Technology**: GitHub Gist API
- **Strategy**:
  - Read: Fetch entire JSON from Gist
  - Write: Update entire JSON in Gist
  - Format: JSON with indentation (readable)
  - Versioning: Automatic (GitHub Gist revisions)

## 🔌 REST API

### Endpoint Specifications

#### GET /api/availability

**Description**: Retrieves all availability data for year 2026

**Request**:

- Method: GET
- Headers: None
- Body: None

**Response**:

```json
{
  "2026-01-01": {
    "Alvaro": { "0-1": false, "1-2": false, ... },
    "Pablo": { "0-1": false, "1-2": false, ... },
    "Diego": { ... },
    "Bruno": { ... }
  },
  "2026-01-02": { ... },
  ...
  "2026-12-31": { ... }
}
```

**Logic**:

1. Reads GitHub Gist
2. Parses JSON content
3. Generates all 2026 dates (366 days)
4. Initializes missing data (all slots default to `false`/red)
5. Updates Gist if initialization occurred
6. Returns complete data structure

#### POST /api/availability-batch

**Description**: Batch updates multiple availability slots

**Request**:

- Method: POST
- Headers: `Content-Type: application/json`
- Body:

```json
{
  "changes": [
    {
      "date": "2026-01-15",
      "member": "Alvaro",
      "slot": "9-10",
      "available": true
    },
    {
      "date": "2026-01-15",
      "member": "Alvaro",
      "slot": "10-11",
      "available": true
    }
  ]
}
```

**Response**:

```json
{
  "success": true,
  "message": "2 cambios actualizados correctamente",
  "updatedCount": 2
}
```

**Validations**:

- `changes` array required and non-empty
- Each change must have: `date`, `member`, `slot`, `available`
- `member` must be in valid list (Alvaro, Pablo, Diego, Bruno)
- `slot` must be valid format (0-23 hours)
- `available` must be boolean

## 💾 Data Model

### JSON Structure

```json
{
  "YYYY-MM-DD": {
    "MemberName": {
      "H-H": boolean,
      ...
    },
    ...
  },
  ...
}
```

### Real Example

```json
{
  "2026-01-15": {
    "Alvaro": {
      "0-1": false,
      "1-2": false,
      "2-3": false,
      ...
      "9-10": true,
      "10-11": true,
      ...
      "23-0": false
    },
    "Pablo": { ... },
    "Diego": { ... },
    "Bruno": { ... }
  }
}
```

### Business Rules

- **Time Slots**: 24 blocks per day (0-23 hours)
- **Members**: 4 fixed members (Alvaro, Pablo, Diego, Bruno)
- **Default Value**: `false` (red/not available)
- **Date Range**: All days of year 2026 (366 days)
- **Initialization**: Automatic on first access

## 🔐 Security and Limitations

### Current Security Features

- ✅ CORS enabled (allows requests from any origin)
- ✅ Data validation in backend
- ✅ Basic error handling
- ✅ Rate limiting: 3 updates per 15 minutes per user
- ✅ Dummy authentication (any password works, but user selection required)

### Security Limitations

- ⚠️ Dummy authentication (no real password validation)
- ⚠️ No origin validation (CORS open)
- ⚠️ No data encryption
- ⚠️ Rate limiting stored in localStorage (client-side, can be bypassed)
- ⚠️ No HTTPS enforcement (depends on Vercel)

### Scalability Limitations

- **Concurrency**: Gist updates may have race conditions with multiple simultaneous updates
- **Size**: JSON file grows linearly with days (~500KB-1MB for full year)
- **Performance**: Reads/writes entire JSON file on each operation
- **Scalability**: Suitable for small teams (4-10 users)

## 🎯 Design Patterns Used

### 1. **Component-Based Architecture**

- React components for UI elements
- Separation of concerns (Calendar, Modals, Cards)

### 2. **Custom Hooks Pattern**

- `useAuth`: Authentication state management
- `useAvailability`: Availability data and pending changes management

### 3. **Optimistic UI Update**

- Frontend updates UI before server confirmation
- Reverts if operation fails

### 4. **Repository Pattern** (implicit)

- `getAvailability()`: Abstracts data reading
- `saveAvailabilityBatch()`: Abstracts data writing

### 5. **Rate Limiting Pattern**

- Client-side rate limiting using localStorage
- Tracks update timestamps per user
- Prevents excessive API calls

## 🔄 Data Lifecycle

### Initialization

1. User opens application
2. Authentication flow (member selection + dummy password)
3. Frontend requests data: `GET /api/availability`
4. Serverless Function reads GitHub Gist
5. If Gist is empty or missing data, initializes all 2026 dates
6. All slots default to `false` (red/not available)
7. Updates Gist if initialization occurred
8. Returns data to frontend
9. Frontend renders calendar

### CRUD Operations

- **Create**: Automatic initialization of missing dates/members/slots
- **Read**: `GET /api/availability` (returns all data)
- **Update**: `POST /api/availability-batch` (batch updates)
- **Delete**: Not implemented (can be added)

### Persistence

- **Strategy**: Write entire JSON to Gist on each update
- **Atomicity**: GitHub Gist handles atomic updates
- **Backup**: Automatic (GitHub Gist revision history)
- **Versioning**: Each update creates a new Gist revision

## 📊 Metrics and Performance

### Data Size

- **Per day**: ~400 bytes (4 members × 24 slots × ~4 bytes)
- **Per month**: ~12 KB (30 days)
- **Full year (366 days)**: ~146 KB
- **With formatting**: ~500KB - 1MB (JSON with indentation)

### Operations

- **GET**: ~200-500ms (GitHub Gist API call + processing)
- **POST**: ~300-800ms (Read Gist + Update + Write Gist)
- **Scalability**: Limited by GitHub Gist API rate limits (5,000 requests/hour)

### Rate Limiting

- **Limit**: 3 updates per 15 minutes per user
- **Storage**: localStorage (client-side)
- **Reset**: Automatic after 15 minutes

## 🚀 Future Improvements

### Short Term

1. **Real Authentication**: Replace dummy auth with proper login
2. **Server-side Rate Limiting**: Move rate limiting to backend
3. **Optimistic Updates**: Better error handling and rollback

### Medium Term

1. **Real Database**: Migrate from Gist to PostgreSQL/MySQL
2. **WebSockets**: Real-time updates across users
3. **Caching**: Redis for improved performance
4. **Pagination**: Load months on demand instead of entire year

### Long Term

1. **Microservices**: Separate business logic
2. **Containerization**: Docker for local development
3. **CI/CD**: Automated deployment pipeline
4. **Monitoring**: Error tracking and analytics

## 📝 Conclusion

This is a **MVP (Minimum Viable Product)** designed for:

- ✅ Maximum simplicity
- ✅ Rapid development
- ✅ Small team (4 people)
- ✅ 100% free hosting (Vercel + GitHub Gist)
- ✅ Zero database costs

The architecture is **serverless and simple**, perfect for validating the concept before scaling to a more robust solution.

## 🔗 Key Technologies

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Vercel Serverless Functions
- **Storage**: GitHub Gist (free, versioned JSON storage)
- **Deployment**: Vercel (100% free tier)
- **Rate Limiting**: Client-side (localStorage)
- **Authentication**: Dummy (any password works)

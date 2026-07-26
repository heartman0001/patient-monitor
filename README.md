# Patient Monitor — Real-Time Form & Staff Dashboard

A responsive, real-time patient input form and staff monitoring system built with **Next.js (App Router)**, **TypeScript**, **TailwindCSS**, **React Hook Form + Zod**, and **Socket.io**.

Patients fill out their information through a validated form, and the data synchronizes instantly to a staff dashboard — no page refresh needed.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | TailwindCSS v4 |
| **Forms** | React Hook Form + Zod validation |
| **Real-Time** | Socket.io (server) + Socket.io-client |
| **Server** | Express (embedded Socket.io server) |
| **Icons** | Google Material Symbols |

---

## Project Structure

```
patient-monitor/
├── app/                        # Next.js App Router pages
│   ├── layout.tsx              # Root layout (nav, Inter font, Material Icons)
│   ├── page.tsx                # Landing page (hero, how it works, tech stack)
│   ├── globals.css             # Global styles + design tokens
│   ├── patient/
│   │   └── page.tsx            # Patient Form page
│   └── staff/
│       └── page.tsx            # Staff Dashboard page
├── components/
│   ├── common/
│   │   ├── Button.tsx          # Reusable button (primary/secondary/ghost/destructive)
│   │   └── Card.tsx            # Container card + CardHeader/CardBody/CardFooter
│   ├── form/
│   │   ├── InputField.tsx      # Text input with label, validation error, styling
│   │   ├── SelectField.tsx     # Select dropdown with label & validation
│   │   └── PatientForm.tsx     # Full patient form with real-time sync
│   └── staff/
│       ├── StatusBadge.tsx     # Status indicator (dot-only or label mode)
│       ├── PatientCard.tsx     # Detailed patient data display
│       ├── StatsOverview.tsx   # 4 metric cards (total/filling/submitted/inactive)
│       ├── PatientSessionList.tsx  # Clickable list of active patients
│       ├── ActivityFeed.tsx    # Real-time activity timeline
│       └── MonitoringPanel.tsx # Detailed patient monitoring view
├── hooks/
│   ├── useSocket.ts            # Patient socket hook (connect, update, submit)
│   └── useStaffDashboard.ts    # Staff socket hook (sessions list, activity feed)
├── lib/
│   ├── schema.ts               # Zod schema for patient form validation
│   └── socket.ts               # Singleton socket.io-client (shared connection)
├── server/
│   └── socket.ts               # Express + Socket.io server (sessions, rooms, cleanup)
├── types/
│   └── patient.ts              # TypeScript types (PatientData, Session, Events, etc.)
└── package.json
```

---

## Design Decisions (UI/UX)

### StudioBlank Design System

The UI follows a **monochrome, flat, no-radius** design language:

| Token | Value |
|-------|-------|
| Primary | `#0A0A0A` (near-black) |
| Background | `#FAFAFA` (off-white) |
| Card bg | `#FFFFFF` |
| Card border | `#E5E5E5` |
| Input border | `#D4D4D8` → focus `#0A0A0A` |
| Error | `#DC2626` |
| Status success | `#16A34A` |
| Status warning | `#CA8A04` |

- **Border radius**: `0px` on all elements — sharp, clean edges
- **Shadows**: none — flat design
- **Gradients**: none — pure monochrome
- **Typography**: Inter (Google Fonts), body 14px
- **Focus states**: border color change instead of box-shadow rings
- **Icons**: Google Material Symbols Outlined (variable font)

### Responsive Breakpoints

| Screen | Layout |
|--------|--------|
| Mobile (< 1024px) | Single column, stacked sections |
| Desktop (≥ 1024px) | 3-column grid: Patient List (1) + Monitoring/Activity (2) |

- **Stats**: 2 columns on mobile → 4 columns on desktop
- **Patient Form**: 1 column → 2–3 column grid for fields
- **Navigation**: Sticky top nav with backdrop blur

---

## Component Architecture

### Patient Form (`/patient`)

```
PatientPage
└── PatientForm
    ├── Session banner (session ID, copy button)
    ├── Card
    │   ├── CardHeader (title + StatusBadge + connection dot)
    │   └── CardBody
    │       ├── Personal Information section
    │       │   └── InputField / SelectField (grid)
    │       ├── Contact Information section
    │       ├── Additional Information section
    │       └── Emergency Contact section
    └── CardFooter (Submit button)
```

**Key behaviors:**
- Fields debounced (300ms) and sent to server in real-time
- Status changes: inactive (mount) → filling (first keystroke) via `isDirty` guard
- Auto-inactive after 5 seconds of no typing
- On submit: sends final data, shows success screen with "New Form" button
- Session ID generated client-side on mount (avoids hydration mismatch)

### Staff Dashboard (`/staff`)

```
StaffView
├── Header (title, connection status, session count)
├── StatsOverview (4 metric cards)
└── Grid (3-column desktop, 1-column mobile)
    ├── PatientSessionList
    │   └── Session rows (avatar, name, time, StatusBadge, Dismiss/View icons)
    └── MonitoringPanel (when session selected) | ActivityFeed (default)
        ├── MonitoringPanel
        │   ├── Session info bar (back button, session ID, StatusBadge, Close)
        │   └── PatientCard (two-column field display)
        └── ActivityFeed
            └── ActivityItem (icon, patient name, description, timestamp)
```

**Key behaviors:**
- Real-time session list updates via `session-list-update` event
- Activity feed auto-scrolls to top on new events
- Session monitoring: selects a session → connects to its room → receives live updates
- Dismiss: removes session from active list (patient can re-activate by typing)

---

## Real-Time Synchronization Flow

### Socket Architecture

```
┌──────────────────────┐         ┌──────────────────────┐
│   Patient Browser     │         │    Staff Browser      │
│   (socket.io-client)  │         │   (socket.io-client)  │
├──────────────────────┤         ├──────────────────────┤
│  connectSocket(id)   │         │ connectStaffSocket()  │
│  → join-session id   │         │ → join-staff-room     │
└──────────┬───────────┘         └───────────┬──────────┘
           │                                 │
           ▼                                 ▼
┌───────────────────────────────────────────────────────┐
│              Express + Socket.io Server                │
│                       Port 3004                        │
├───────────────────────────────────────────────────────┤
│  rooms:                                                │
│    staff-room ← all staff sockets                      │
│    session-xxxx ← patient + monitoring staff           │
│                                                       │
│  data stores:                                          │
│    sessions Map: sessionId → PatientSession            │
│    socketSessions Map: socketId → sessionId           │
│    pendingDisconnects: timely disconnect handling       │
│    activityHistory: last 50 events                     │
└───────────────────────────────────────────────────────┘
```

### Event Flow

```
PATIENT ACTION           SERVER                      STAFF DASHBOARD
─────────────────────────────────────────────────────────────────────
Open form
  ──join-session──▶    Create session (inactive)
                        ──session-list-update────▶   Appears in list
                        ──activity-event────────▶    "Opened the form"

Type a field
  ──form-update──▶    Update session data
  (debounced 300ms)   Set status = filling
                        ──patient-update───────▶    Live field data
                        ──session-list-update──▶    Status updated
                        ──activity-event────────▶   "Updated 3 field(s)"

Stop typing 5s
  ──form-status──▶    Set status = inactive
                        ──patient-status───────▶    Status dot changes
                        ──session-list-update──▶    Dashboard updates

Submit form
  ──form-submit──▶    Set status = submitted
                        ──patient-update───────▶    Final data
                        ──patient-status───────▶    Status = submitted
                        ──session-list-update──▶    Stats update
                        ──activity-event────────▶   "Submitted the form"

Close browser
  disconnect          15s grace period
                        If submitted → preserved
                        Else → session deleted
                        ──session-list-update──▶    Session removed
```

### Key Design Points

1. **Singleton socket**: All clients share one socket.io connection. `connectSocket()` and `connectStaffSocket()` both use the same underlying socket instance, each emitting different join events.

2. **Room isolation**: Each patient session is its own room. Staff join the `staff-room` to receive aggregated dashboard data, and join individual session rooms when monitoring a specific patient.

3. **sessionId filtering**: The `usePatientSocket` hook guards `patient-update` handlers with `updatedSession.id === sessionId` to prevent stale data from old room subscriptions (since the socket never leaves previous rooms).

4. **Status preservation**: Joining an existing session (whether staff viewing or patient reconnecting) **does not change** the session's status. Status is only modified by patient actions (`form-update`, `form-submit`, `form-status`) or auto-cleanup.

---

## Session Management & Lifecycle

```
                    ┌──────────┐
                    │  Open    │
                    │  Form    │
                    └────┬─────┘
                         │ join-session
                         ▼
                  ┌──────────────┐
                  │   Inactive   │ ◄── initial status
                  └──────┬───────┘
                         │ first keystroke (isDirty + form-update)
                         ▼
                  ┌──────────────┐
            ┌────▶│   Filling    │◀────┐
            │     └──────┬───────┘     │
            │            │             │
            │   5min no activity       │ form-update
            │            │             │ (typing again)
            │            ▼             │
            │     ┌──────────────┐     │
            └─────│   Inactive   │─────┘
                  └──────────────┘
                         │ submit
                         ▼
                  ┌──────────────┐
                  │  Submitted   │ ◄── preserved on disconnect
                  └──────┬───────┘
                         │ 10 min auto-dismiss
                         ▼
                  ┌──────────────┐
                  │  Dismissed   │
                  └──────────────┘
```

### Auto-Cleanup (runs every 30s)

| Condition | Action |
|-----------|--------|
| Filling + no activity for 5 min | → Mark as **inactive** |
| Submitted + 10 min elapsed | → Auto-**dismiss** (hidden from list) |
| Inactive + 30 min elapsed | → **Remove** entirely |
| Dismissed + 30 min elapsed | → **Remove** entirely |

### Disconnect Handling

- **Grace period**: 15 seconds after socket disconnect
- **If patient reconnects** within 15s → session preserved with all data
- **If submitted** → session **preserved** for staff review (not deleted)
- **If filling/inactive** → session **removed** after grace period

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd patient-monitor

# Install dependencies
npm install
```

### Running Locally

You need to start **both** the Next.js dev server and the Socket.io server:

```bash
# Option 1: Run both simultaneously
npm run dev:all

# Option 2: Run in separate terminals
npm run dev           # Next.js on http://localhost:3000
npm run dev:socket    # Socket.io on http://localhost:3004
```

Then open:
- **Patient Form**: [http://localhost:3000/patient](http://localhost:3000/patient)
- **Staff Dashboard**: [http://localhost:3000/staff](http://localhost:3000/staff)

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3004` | Socket.io server URL |
| `SOCKET_PORT` | `3004` | Socket.io server port |

---

## Deployment

### Deploy to Vercel (Frontend)

1. Push to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Set build command: `npm run build`
4. Set output directory: `.next`

### Deploy Socket.io Server

The Socket.io server (`server/socket.ts`) needs a separate deployment (e.g., Railway, Render, Heroku, or a VPS).

```bash
# Start the socket server
npx tsx server/socket.ts
```

Set `NEXT_PUBLIC_SOCKET_URL` to the deployed socket server URL.

---

## Future Improvements

- [ ] Persistent storage (SQLite/PostgreSQL) for sessions across server restarts
- [ ] Leave previous session room when staff switches monitoring target
- [ ] Pagination / search for large numbers of sessions
- [ ] Unit and integration tests
- [ ] Authentication for staff dashboard
- [ ] PDF export of submitted patient data
- [ ] Reconnection with session persistence in localStorage

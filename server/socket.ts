import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import type { PatientData, FormStatus, PatientSession, ActivityEvent, StaffDashboardData } from '../types/patient';

const app = express();
app.use(cors());

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',')
      : ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const sessions = new Map<string, PatientSession>();
const dismissedSessions = new Set<string>(); // Track dismissed session IDs
const socketSessions = new Map<string, string>(); // socketId → sessionId
const pendingDisconnects = new Map<string, ReturnType<typeof setTimeout>>(); // sessionId → pending removal timeout
const activityHistory: ActivityEvent[] = [];
const MAX_ACTIVITY = 50;

const DISCONNECT_GRACE_MS = 15_000; // 15 seconds grace period before removing session

// ========== Auto-Cleanup Configuration ==========
const INACTIVE_TIMEOUT_MS = 5 * 60 * 1000;     // 5 min: auto-mark as inactive
const STALE_REMOVAL_MS = 30 * 60 * 1000;        // 30 min: remove entirely
const SUBMITTED_CLEANUP_MS = 10 * 60 * 1000;    // 10 min: auto-dismiss after submit
const CLEANUP_INTERVAL_MS = 30 * 1000;          // Check every 30 seconds

// ========== Helper Functions ==========

function getDashboardData(): StaffDashboardData {
  // Filter out dismissed sessions from active list
  const sessionList = Array.from(sessions.values())
    .filter((s) => !dismissedSessions.has(s.id))
    .sort((a, b) => b.lastUpdated - a.lastUpdated);

  return {
    sessions: sessionList,
    activityFeed: [...activityHistory].reverse(),
    stats: {
      total: sessionList.length,
      filling: sessionList.filter((s) => s.status === 'filling').length,
      submitted: sessionList.filter((s) => s.status === 'submitted').length,
      inactive: sessionList.filter((s) => s.status === 'inactive').length,
    },
  };
}

function addActivity(sessionId: string, type: ActivityEvent['type'], description: string, patientName: string) {
  const event: ActivityEvent = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    sessionId,
    type,
    description,
    timestamp: Date.now(),
    patientName,
  };
  activityHistory.push(event);
  if (activityHistory.length > MAX_ACTIVITY) activityHistory.shift();
  io.to('staff-room').emit('activity-event', event);
}

function broadcastSessionList() {
  io.to('staff-room').emit('session-list-update', getDashboardData());
}

// ========== Auto-Cleanup ==========

function runCleanup() {
  const now = Date.now();
  let changed = false;

  for (const [id, session] of sessions.entries()) {
    // Skip dismissed sessions - they'll be fully removed later
    if (dismissedSessions.has(id)) {
      if (now - session.lastUpdated > STALE_REMOVAL_MS) {
        sessions.delete(id);
        dismissedSessions.delete(id);
        changed = true;
      }
      continue;
    }

    const age = now - session.lastUpdated;

    // Case 1: Filling but no activity for 5+ min → auto-mark as inactive
    if (session.status === 'filling' && age > INACTIVE_TIMEOUT_MS) {
      session.status = 'inactive';
      session.lastUpdated = now;
      sessions.set(id, session);
      const name = session.data.firstName ? `${session.data.firstName} ${session.data.lastName || ''}`.trim() : 'Anonymous';
      addActivity(id, 'status-changed', 'Session timed out (inactive)', name);
      changed = true;
    }

    // Case 2: Submitted for 10+ min → auto-dismiss
    if (session.status === 'submitted' && age > SUBMITTED_CLEANUP_MS) {
      dismissedSessions.add(id);
      const name = session.data.firstName ? `${session.data.firstName} ${session.data.lastName || ''}`.trim() : 'Anonymous';
      addActivity(id, 'session-dismissed', 'Auto-archived (submitted)', name);
      changed = true;
    }

    // Case 3: Inactive for 30+ min → remove entirely
    if (session.status === 'inactive' && age > STALE_REMOVAL_MS) {
      sessions.delete(id);
      changed = true;
    }
  }

  if (changed) broadcastSessionList();
}

// Run cleanup every 30 seconds
const cleanupTimer = setInterval(runCleanup, CLEANUP_INTERVAL_MS);

// ========== Socket Events ==========

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  // Staff joins global staff room
  socket.on('join-staff-room', () => {
    socket.join('staff-room');
    socket.emit('session-list-update', getDashboardData());
    console.log(`Staff joined: ${socket.id}`);
  });

  socket.on('get-all-sessions', () => {
    socket.emit('session-list-update', getDashboardData());
  });

  // Staff dismisses a session
  socket.on('dismiss-session', (sessionId: string) => {
    dismissedSessions.add(sessionId);
    const session = sessions.get(sessionId);
    const name = session?.data.firstName ? `${session.data.firstName} ${session.data.lastName || ''}`.trim() : 'Anonymous';
    addActivity(sessionId, 'session-dismissed', 'Dismissed by staff', name);
    broadcastSessionList();
    console.log(`Session dismissed: ${sessionId}`);
  });

  // Patient joins a specific session
  socket.on('join-session', (sessionId: string) => {
    socket.join(sessionId);

    // Re-activate if was dismissed
    dismissedSessions.delete(sessionId);

    const isNew = !sessions.has(sessionId);
    if (isNew) {
      sessions.set(sessionId, {
        id: sessionId,
        data: {},
        status: 'inactive',
        lastUpdated: Date.now(),
      });
      addActivity(sessionId, 'session-created', 'Opened the form', 'Anonymous');
      broadcastSessionList();
    } else {
      // Existing session — someone is monitoring or reconnecting
      // DO NOT change status here! Status is managed by patient actions:
      // form-update → 'filling', form-submit → 'submitted', auto-cleanup → 'inactive'
      // Staff viewing should NOT change the patient's status.
      const session = sessions.get(sessionId)!;

      // Send current session data to the joining socket immediately
      // (so staff sees existing data without waiting for patient to type again)
      socket.emit('patient-update', session);
      socket.emit('patient-status', { id: sessionId, status: session.status });
    }

    // Update socket mapping for this session
    // (handles reconnection with new socket.id)
    socketSessions.set(socket.id, sessionId);

    // Cancel any pending disconnect for this session
    const pendingTimeout = pendingDisconnects.get(sessionId);
    if (pendingTimeout) {
      clearTimeout(pendingTimeout);
      pendingDisconnects.delete(sessionId);
      console.log(`Session reconnected before grace period expired: ${sessionId}`);
    }

    socket.emit('session-connected', sessionId);
    console.log(`Session joined: ${sessionId}`);
  });

  socket.on('form-update', (data: Partial<PatientData>) => {
    const sessionId = [...socket.rooms].find((r) => r !== socket.id && r !== 'staff-room');
    if (!sessionId) return;

    const session = sessions.get(sessionId);
    if (session) {
      // Re-activate if was dismissed
      dismissedSessions.delete(sessionId);

      const changedFields = Object.keys(data).filter((k) => data[k as keyof PatientData] !== undefined);
      session.data = { ...session.data, ...data };
      session.status = 'filling';
      session.lastUpdated = Date.now();
      sessions.set(sessionId, session);

      socket.to(sessionId).emit('patient-update', session);

      if (changedFields.length > 0) {
        const name = data.firstName ? `${data.firstName} ${data.lastName || ''}`.trim() : 'Anonymous';
        addActivity(sessionId, 'field-updated', `Updated ${changedFields.length} field(s)`, name);
      }
      broadcastSessionList();
    }
  });

  socket.on('form-status', (data: { status: FormStatus }) => {
    const sessionId = [...socket.rooms].find((r) => r !== socket.id && r !== 'staff-room');
    if (!sessionId) return;

    const session = sessions.get(sessionId);
    if (session) {
      dismissedSessions.delete(sessionId);
      session.status = data.status;
      session.lastUpdated = Date.now();
      sessions.set(sessionId, session);

      io.to(sessionId).emit('patient-status', { id: sessionId, status: data.status });
      broadcastSessionList();
    }
  });

  socket.on('form-submit', () => {
    const sessionId = [...socket.rooms].find((r) => r !== socket.id && r !== 'staff-room');
    if (!sessionId) return;

    const session = sessions.get(sessionId);
    if (session) {
      dismissedSessions.delete(sessionId);
      session.status = 'submitted';
      session.lastUpdated = Date.now();
      sessions.set(sessionId, session);

      io.to(sessionId).emit('patient-update', session);
      io.to(sessionId).emit('patient-status', { id: sessionId, status: 'submitted' as FormStatus });

      const name = session.data.firstName ? `${session.data.firstName} ${session.data.lastName || ''}`.trim() : 'Anonymous';
      addActivity(sessionId, 'form-submitted', 'Submitted the form', name);
      broadcastSessionList();
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);

    const sessionId = socketSessions.get(socket.id);
    if (!sessionId) return;

    socketSessions.delete(socket.id);

    // Don't remove immediately — give a grace period for reconnection
    // (handles brief network blips, server restarts, etc.)
    const existingTimeout = pendingDisconnects.get(sessionId);
    if (existingTimeout) clearTimeout(existingTimeout);

    pendingDisconnects.set(
      sessionId,
      setTimeout(() => {
        pendingDisconnects.delete(sessionId);
        const session = sessions.get(sessionId);
        if (!session) return;

        const name = session.data.firstName ? `${session.data.firstName} ${session.data.lastName || ''}`.trim() : 'Anonymous';

        // Don't delete submitted sessions — keep them for staff to review
        // They'll be auto-dismissed by the cleanup timer after SUBMITTED_CLEANUP_MS
        if (session.status === 'submitted') {
          console.log(`Session ${sessionId} (submitted) preserved after disconnect`);
          return;
        }

        addActivity(sessionId, 'session-dismissed', 'Patient disconnected', name);
        sessions.delete(sessionId);
        dismissedSessions.delete(sessionId);
        broadcastSessionList();
        console.log(`Session removed after grace period: ${sessionId}`);
      }, DISCONNECT_GRACE_MS)
    );
  });
});

// Cleanup timer on shutdown
process.on('SIGTERM', () => {
  clearInterval(cleanupTimer);
  for (const t of pendingDisconnects.values()) clearTimeout(t);
  pendingDisconnects.clear();
  httpServer.close();
});
process.on('SIGINT', () => {
  clearInterval(cleanupTimer);
  for (const t of pendingDisconnects.values()) clearTimeout(t);
  pendingDisconnects.clear();
  httpServer.close();
});

const PORT = process.env.SOCKET_PORT || 3004;

httpServer.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
  console.log(`Auto-cleanup: inactive ${INACTIVE_TIMEOUT_MS/60000}m | stale ${STALE_REMOVAL_MS/60000}m | submitted ${SUBMITTED_CLEANUP_MS/60000}m`);
});

export { httpServer, io };

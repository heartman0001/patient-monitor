'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { connectStaffSocket } from '@/lib/socket';
import type { PatientSession, ActivityEvent, StaffDashboardData } from '@/types/patient';

export function useStaffDashboard(enabled: boolean = true) {
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  const [stats, setStats] = useState({ total: 0, filling: 0, submitted: 0, inactive: 0 });
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof connectStaffSocket> | null>(null);

  const refreshSessions = useCallback(() => {
    socketRef.current?.emit('get-all-sessions');
  }, []);

  const dismissSession = useCallback((sessionId: string) => {
    socketRef.current?.emit('dismiss-session', sessionId);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const socket = connectStaffSocket();
    socketRef.current = socket;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleSessionConnected = () => setConnected(true);
    const handleSessionListUpdate = (data: StaffDashboardData) => {
      setSessions(data.sessions);
      setStats(data.stats);
      setActivityFeed(data.activityFeed);
    };
    const handleActivityEvent = (event: ActivityEvent) => {
      setActivityFeed((prev) => [event, ...prev].slice(0, 50));
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('session-connected', handleSessionConnected);
    socket.on('session-list-update', handleSessionListUpdate);
    socket.on('activity-event', handleActivityEvent);

    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('session-connected', handleSessionConnected);
      socket.off('session-list-update', handleSessionListUpdate);
      socket.off('activity-event', handleActivityEvent);
    };
  }, [enabled]);

  return { sessions, activityFeed, stats, connected, refreshSessions, dismissSession };
}

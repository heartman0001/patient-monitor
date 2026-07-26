'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { connectSocket } from '@/lib/socket';
import type { PatientData, FormStatus, PatientSession } from '@/types/patient';

export function usePatientSocket(sessionId: string, enabled: boolean = true) {
  const [session, setSession] = useState<PatientSession | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof connectSocket> | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const socket = connectSocket(sessionId);
    socketRef.current = socket;

    const handleConnect = () => setConnected(true);
    const handleDisconnect = () => setConnected(false);
    const handleSessionConnected = () => setConnected(true);
    const handlePatientUpdate = (updatedSession: PatientSession) => {
      // Only accept updates for the session we're currently monitoring
      if (updatedSession.id === sessionId) setSession(updatedSession);
    };
    const handlePatientStatus = (data: { id: string; status: FormStatus }) => {
      // Only accept status updates for the session we're currently monitoring
      if (data.id === sessionId) {
        setSession((prev) => prev ? { ...prev, status: data.status } : prev);
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('session-connected', handleSessionConnected);
    socket.on('patient-update', handlePatientUpdate);
    socket.on('patient-status', handlePatientStatus);

    // If already connected, set connected state
    if (socket.connected) setConnected(true);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('session-connected', handleSessionConnected);
      socket.off('patient-update', handlePatientUpdate);
      socket.off('patient-status', handlePatientStatus);
    };
  }, [sessionId, enabled]);

  const updateForm = useCallback((data: Partial<PatientData>) => {
    socketRef.current?.emit('form-update', data);
  }, []);

  const updateStatus = useCallback((status: FormStatus) => {
    socketRef.current?.emit('form-status', { status });
  }, []);

  const submitForm = useCallback(() => {
    socketRef.current?.emit('form-submit');
  }, []);

  return { session, connected, updateForm, updateStatus, submitForm };
}

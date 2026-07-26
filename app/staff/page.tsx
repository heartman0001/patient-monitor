'use client';

import React, { useState, useCallback } from 'react';
import { useStaffDashboard } from '@/hooks/useStaffDashboard';
import { usePatientSocket } from '@/hooks/useSocket';
import StatsOverview from '@/components/staff/StatsOverview';
import PatientSessionList from '@/components/staff/PatientSessionList';
import ActivityFeed from '@/components/staff/ActivityFeed';
import MonitoringPanel from '@/components/staff/MonitoringPanel';

export default function StaffView() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const { sessions, activityFeed, stats, connected, dismissSession } = useStaffDashboard(true);

  const { session } = usePatientSocket(selectedSessionId || '', !!selectedSessionId);

  const handleSelectSession = useCallback((sessionId: string) => {
    setSelectedSessionId((prev) => (prev === sessionId ? null : sessionId));
  }, []);

  const handleCloseMonitoring = useCallback(() => {
    setSelectedSessionId(null);
  }, []);

  const handleDismissSession = useCallback((sessionId: string) => {
    dismissSession(sessionId);
    if (selectedSessionId === sessionId) {
      setSelectedSessionId(null);
    }
  }, [dismissSession, selectedSessionId]);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-[26px] font-bold text-[#0A0A0A] tracking-tight">Staff Dashboard</h1>
            <p className="text-[14px] text-[#71717A] mt-0.5">Monitor patient form submissions in real-time</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.05em] ${
              connected ? 'text-[#0A0A0A]' : 'text-[#DC2626]'
            }`}>
              <span className={`w-1.5 h-1.5 ${connected ? 'bg-[#0A0A0A]' : 'bg-[#DC2626]'}`} />
              {connected ? 'Connected' : 'Disconnected'}
            </span>
            {stats.total > 0 && (
              <span className="text-[11px] font-medium text-[#71717A] uppercase tracking-[0.05em]">
                {stats.total} session{stats.total !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* STATS OVERVIEW */}
      <div className="mb-6">
        <StatsOverview
          total={stats.total}
          filling={stats.filling}
          submitted={stats.submitted}
          inactive={stats.inactive}
        />
      </div>

      {/* MAIN CONTENT - Desktop: 2 columns, Mobile: 1 column */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Session List */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <PatientSessionList
            sessions={sessions}
            selectedSessionId={selectedSessionId}
            onSelectSession={handleSelectSession}
            onDismissSession={handleDismissSession}
            isLoading={!connected && sessions.length === 0}
          />
        </div>

        {/* Right Column - Monitoring or Activity Feed */}
        <div className="lg:col-span-2 order-1 lg:order-2">
          {selectedSessionId ? (
            <MonitoringPanel
              sessionId={selectedSessionId}
              session={session}
              onClose={handleCloseMonitoring}
            />
          ) : (
            <div>
              <div className="mb-4 lg:hidden">
                <p className="text-[13px] text-[#71717A]">
                  Select a patient session from the list below to start monitoring.
                </p>
              </div>
              <ActivityFeed events={activityFeed} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

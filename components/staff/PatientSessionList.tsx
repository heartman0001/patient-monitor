'use client';

import React from 'react';
import StatusBadge from '@/components/staff/StatusBadge';
import type { PatientSession } from '@/types/patient';

interface PatientSessionListProps {
  sessions: PatientSession[];
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDismissSession?: (sessionId: string) => void;
  isLoading?: boolean;
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

export default function PatientSessionList({
  sessions,
  selectedSessionId,
  onSelectSession,
  onDismissSession,
  isLoading = false,
}: PatientSessionListProps) {

  if (isLoading) {
    return (
      <div className="bg-white border border-[#E5E5E5]">
        <div className="px-5 py-4 border-b border-[#E5E5E5]">
          <h3 className="text-[13px] font-medium text-[#0A0A0A] uppercase tracking-[0.05em]">Patient Sessions</h3>
        </div>
        <div className="px-5 py-12 text-center">
          <div className="w-8 h-8 mx-auto mb-3 bg-[#F4F4F5] flex items-center justify-center">
            <svg className="w-4 h-4 text-[#A1A1AA] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
          <p className="text-[14px] text-[#71717A]">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E5E5]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#E5E5E5] flex items-center justify-between">
        <h3 className="text-[13px] font-medium text-[#0A0A0A] uppercase tracking-[0.05em]">
          Patient Sessions
          {sessions.length > 0 && <span className="text-[#71717A] ml-1">({sessions.length})</span>}
        </h3>
        <span className={`w-2 h-2 ${sessions.length > 0 ? 'bg-[#0A0A0A] animate-pulse' : 'bg-[#D4D4D8]'}`} />
      </div>

      {/* Active Sessions */}
      {sessions.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="w-10 h-10 mx-auto mb-3 bg-[#F4F4F5] flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px] text-[#A1A1AA]">visibility_off</span>
          </div>
          <p className="text-[14px] text-[#71717A]">No active sessions</p>
          <p className="text-[12px] text-[#A1A1AA] mt-1">Waiting for patients to open the form...</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F4F4F5]">
          {sessions.map((session) => {
            const name = session.data.firstName
              ? `${session.data.firstName} ${session.data.lastName || ''}`.trim()
              : 'Anonymous Patient';
            const initial = session.data.firstName?.[0]?.toUpperCase() || session.data.lastName?.[0]?.toUpperCase() || '?';
            const isSelected = selectedSessionId === session.id;

            return (
              <div
                key={session.id}
                className={`px-5 py-3 flex items-center justify-between gap-2 cursor-pointer transition-colors duration-150 ${
                  isSelected ? 'bg-[#F4F4F5] border-l-2 border-[#0A0A0A]' : 'hover:bg-[#FAFAFA]'
                }`}
                onClick={() => onSelectSession(session.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-[#0A0A0A]' : 'bg-[#F4F4F5]'
                  }`}>
                    <span className={`text-[12px] font-medium ${isSelected ? 'text-[#FAFAFA]' : 'text-[#71717A]'}`}>{initial}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-[#0A0A0A] truncate">{name}</p>
                    <p className="text-[11px] text-[#A1A1AA]">{formatTime(session.lastUpdated)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <StatusBadge status={session.status} pulse />
                  {onDismissSession && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onDismissSession(session.id); }}
                      className="flex items-center justify-center w-7 h-7 text-[#A1A1AA] hover:text-[#DC2626] hover:bg-[#FEF2F2] transition-colors"
                      title="Dismiss session"
                    >
                      <span className="material-symbols-outlined text-[16px] leading-none">delete</span>
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); onSelectSession(session.id); }}
                    className="flex items-center justify-center w-7 h-7 text-[#71717A] hover:text-[#0A0A0A] hover:bg-[#F4F4F5] transition-colors"
                    title="View session"
                  >
                    <span className="material-symbols-outlined text-[16px] leading-none">visibility</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}


    </div>
  );
}

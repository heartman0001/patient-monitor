'use client';

import React from 'react';
import PatientCard from '@/components/staff/PatientCard';
import StatusBadge from '@/components/staff/StatusBadge';
import Button from '@/components/common/Button';
import Card, { CardBody } from '@/components/common/Card';
import type { PatientSession } from '@/types/patient';

interface MonitoringPanelProps {
  sessionId: string;
  session: PatientSession | null;
  onClose: () => void;
}

export default function MonitoringPanel({ sessionId, session, onClose }: MonitoringPanelProps) {
  return (
    <div className="space-y-4">
      {/* Session info bar */}
      <div className="flex items-center justify-between gap-3 bg-white border border-[#E5E5E5] px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="flex items-center justify-center w-7 h-7 hover:bg-[#F4F4F5] transition-colors"
            title="Back to dashboard"
          >
            <span className="material-symbols-outlined text-[18px] text-[#71717A] leading-none">arrow_back</span>
          </button>
          <span className="w-px h-4 bg-[#E5E5E5]" />
          <span className="text-[12px] font-medium text-[#71717A] uppercase tracking-[0.05em]">Monitoring</span>
          <code className="text-[13px] font-mono text-[#0A0A0A] truncate">{sessionId}</code>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {session && <StatusBadge status={session.status} pulse />}
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>
      </div>

      {/* Session data */}
      {session ? (
        <PatientCard session={session} />
      ) : (
        <Card>
          <CardBody className="py-16 text-center">
            <div className="w-10 h-10 mx-auto mb-4 bg-[#F4F4F5] flex items-center justify-center">
              <svg className="w-5 h-5 text-[#A1A1AA] animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-[14px] text-[#71717A]">Waiting for patient data...</p>
            <p className="text-[12px] text-[#A1A1AA] mt-1">Make sure the patient is filling their form.</p>
          </CardBody>
        </Card>
      )}
    </div>
  );
}

'use client';

import React from 'react';
import Card, { CardBody, CardHeader } from '@/components/common/Card';
import StatusBadge from '@/components/staff/StatusBadge';
import type { PatientSession } from '@/types/patient';

interface PatientCardProps { session: PatientSession; }

const statusAvatarColors: Record<string, string> = {
  submitted: 'bg-[#16A34A]',
  filling: 'bg-[#CA8A04]',
  inactive: 'bg-[#A1A1AA]',
};

function FieldRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-baseline gap-3 py-2 border-b border-[#F4F4F5] last:border-0">
      <span className="text-[12px] font-medium text-[#71717A] uppercase tracking-[0.05em] min-w-[100px] shrink-0">{label}</span>
      <span className="text-[14px] text-[#0A0A0A] break-words">{value}</span>
    </div>
  );
}

export default function PatientCard({ session }: PatientCardProps) {
  const { data, status, lastUpdated } = session;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 flex items-center justify-center ${statusAvatarColors[status] || 'bg-[#0A0A0A]'}`}>
              <span className="text-[13px] font-medium text-[#FAFAFA]">
                {data.firstName?.[0]?.toUpperCase() || data.lastName?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h3 className="text-[15px] font-semibold text-[#0A0A0A] tracking-tight">
                {data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : 'Anonymous Patient'}
              </h3>
              <p className="text-[12px] text-[#71717A]">Updated {new Date(lastUpdated).toLocaleTimeString()}</p>
            </div>
          </div>
          <StatusBadge status={status} pulse />
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          <div>
            <FieldRow label="First Name" value={data.firstName} />
            <FieldRow label="Middle Name" value={data.middleName} />
            <FieldRow label="Last Name" value={data.lastName} />
            <FieldRow label="Date of Birth" value={data.dateOfBirth} />
            <FieldRow label="Gender" value={data.gender} />
            <FieldRow label="Phone" value={data.phoneNumber} />
            <FieldRow label="Email" value={data.email} />
          </div>
          <div>
            <FieldRow label="Address" value={data.address} />
            <FieldRow label="Language" value={data.preferredLanguage} />
            <FieldRow label="Nationality" value={data.nationality} />
            <FieldRow label="Religion" value={data.religion} />
            <FieldRow label="Emergency Contact" value={data.emergencyContact?.name} />
            <FieldRow label="Relationship" value={data.emergencyContact?.relationship} />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

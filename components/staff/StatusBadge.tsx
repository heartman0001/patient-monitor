'use client';

import React from 'react';
import type { FormStatus } from '@/types/patient';

interface StatusBadgeProps {
  status: FormStatus;
  pulse?: boolean;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

const dotSizes = { sm: 'w-2 h-2', md: 'w-3 h-3' };

const statusConfig: Record<FormStatus, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'bg-[#16A34A]' },
  filling: { label: 'Filling', color: 'bg-[#CA8A04]' },
  inactive: { label: 'Inactive', color: 'bg-[#D4D4D8]' },
};

export default function StatusBadge({ status, pulse = false, size = 'sm', showLabel = false }: StatusBadgeProps) {
  const config = statusConfig[status];

  if (showLabel) {
    // Full badge with text label (used in Patient form)
    const labelColors: Record<FormStatus, string> = {
      submitted: 'bg-[#16A34A]/10 text-[#16A34A] border border-[#16A34A]/30',
      filling: 'bg-[#CA8A04]/10 text-[#CA8A04] border border-[#CA8A04]/30',
      inactive: 'bg-[#F4F4F5] text-[#A1A1AA] border border-[#E5E5E5]',
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium uppercase tracking-[0.05em] ${labelColors[status]}`}>
        <span className={`w-1.5 h-1.5 ${config.color} ${pulse && status === 'filling' ? 'animate-pulse' : ''}`} />
        {config.label}
      </span>
    );
  }

  // Just a colored dot (used in Staff dashboard)
  return (
    <span
      className={`inline-flex rounded-full ${dotSizes[size]} ${config.color} ${
        pulse && status === 'filling' ? 'animate-pulse' : ''
      }`}
      title={config.label}
    />
  );
}

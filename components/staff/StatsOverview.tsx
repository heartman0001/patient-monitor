'use client';

import React from 'react';

interface StatsOverviewProps {
  total: number;
  filling: number;
  submitted: number;
  inactive: number;
}

export default function StatsOverview({ total, filling, submitted, inactive }: StatsOverviewProps) {
  const stats = [
    { label: 'Total Patients', value: total, color: 'bg-[#0A0A0A]', textColor: 'text-[#0A0A0A]' },
    { label: 'Active (Filling)', value: filling, color: 'bg-[#CA8A04]', textColor: 'text-[#CA8A04]' },
    { label: 'Submitted', value: submitted, color: 'bg-[#16A34A]', textColor: 'text-[#16A34A]' },
    { label: 'Inactive', value: inactive, color: 'bg-[#D4D4D8]', textColor: 'text-[#71717A]' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white border border-[#E5E5E5] px-5 py-4">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 ${stat.color}`} />
            <span className="text-[12px] font-medium text-[#71717A] uppercase tracking-[0.05em]">{stat.label}</span>
          </div>
          <p className={`text-[32px] font-bold tracking-tight ${stat.textColor}`}>{stat.value}</p>
        </div>
      ))}
    </div>
  );
}

'use client';

import React, { useRef, useEffect } from 'react';
import type { ActivityEvent } from '@/types/patient';

interface ActivityFeedProps {
  events: ActivityEvent[];
}

function formatTime(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 10) return 'Just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

const eventIcons: Record<ActivityEvent['type'], React.ReactNode> = {
  'session-created': <span className="material-symbols-outlined text-[15px] leading-none">person_add</span>,
  'field-updated': <span className="material-symbols-outlined text-[15px] leading-none">edit_note</span>,
  'status-changed': <span className="material-symbols-outlined text-[15px] leading-none">schedule</span>,
  'form-submitted': <span className="material-symbols-outlined text-[15px] leading-none">task_alt</span>,
  'session-dismissed': <span className="material-symbols-outlined text-[15px] leading-none">delete</span>,
};

function ActivityItem({ event }: { event: ActivityEvent }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#F4F4F5] last:border-0">
      <div className={`w-7 h-7 flex items-center justify-center shrink-0 mt-0.5 ${
        event.type === 'form-submitted' ? 'bg-[#16A34A]/10 text-[#16A34A]' :
        event.type === 'session-created' ? 'bg-[#CA8A04]/10 text-[#CA8A04]' :
        event.type === 'session-dismissed' ? 'bg-[#DC2626]/10 text-[#DC2626]' :
        'bg-[#F4F4F5] text-[#71717A]'
      }`}>
        {eventIcons[event.type]}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[#0A0A0A] leading-snug">
          <span className="font-medium">{event.patientName}</span>
          <span className="text-[#71717A]"> {event.type === 'session-created' ? 'started filling the form' : event.description}</span>
        </p>
        <p className="text-[11px] text-[#A1A1AA] mt-0.5">{formatTime(event.timestamp)}</p>
      </div>
    </div>
  );
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const prevLength = useRef(events.length);

  useEffect(() => {
    if (events.length > prevLength.current && listRef.current) {
      listRef.current.scrollTop = 0;
    }
    prevLength.current = events.length;
  }, [events.length]);

  return (
    <div className="bg-white border border-[#E5E5E5]">
      <div className="px-5 py-4 border-b border-[#E5E5E5]">
        <h3 className="text-[13px] font-medium text-[#0A0A0A] uppercase tracking-[0.05em]">
          Activity Feed
          {events.length > 0 && <span className="text-[#71717A] ml-1 font-normal normal-case">({events.length})</span>}
        </h3>
      </div>
      <div ref={listRef} className="px-5 divide-y divide-[#F4F4F5] max-h-[400px] overflow-y-auto">
        {events.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[14px] text-[#A1A1AA]">No recent activity</p>
            <p className="text-[11px] text-[#D4D4D8] mt-1">Activity will appear here when patients interact with the form</p>
          </div>
        ) : (
          events.map((event) => <ActivityItem key={event.id} event={event} />)
        )}
      </div>
    </div>
  );
}

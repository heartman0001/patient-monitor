export interface EmergencyContact {
  name: string;
  relationship: string;
}

export interface PatientData {
  firstName: string;
  middleName?: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  phoneNumber: string;
  email: string;
  address: string;
  preferredLanguage: string;
  nationality: string;
  emergencyContact?: EmergencyContact;
  religion?: string;
}

export type FormStatus = 'submitted' | 'filling' | 'inactive';

export interface PatientSession {
  id: string;
  data: Partial<PatientData>;
  status: FormStatus;
  lastUpdated: number;
}

export interface ActivityEvent {
  id: string;
  sessionId: string;
  type: 'session-created' | 'field-updated' | 'status-changed' | 'form-submitted' | 'session-dismissed';
  description: string;
  timestamp: number;
  patientName: string;
}

export interface StaffDashboardData {
  sessions: PatientSession[];
  activityFeed: ActivityEvent[];
  stats: {
    total: number;
    filling: number;
    submitted: number;
    inactive: number;
  };
}

export interface ServerToClientEvents {
  'patient-update': (session: PatientSession) => void;
  'patient-status': (data: { id: string; status: FormStatus }) => void;
  'session-connected': (sessionId: string) => void;
  'session-list-update': (data: StaffDashboardData) => void;
  'activity-event': (event: ActivityEvent) => void;
}

export interface ClientToServerEvents {
  'form-update': (data: Partial<PatientData>) => void;
  'form-status': (data: { status: FormStatus }) => void;
  'form-submit': () => void;
  'join-session': (sessionId: string) => void;
  'join-staff-room': () => void;
  'get-all-sessions': () => void;
  'dismiss-session': (sessionId: string) => void;
}

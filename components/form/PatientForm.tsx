'use client';

import React, { useEffect, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientFormSchema, type PatientFormData } from '@/lib/schema';
import InputField from '@/components/form/InputField';
import SelectField from '@/components/form/SelectField';
import Button from '@/components/common/Button';
import Card, { CardBody, CardHeader, CardFooter } from '@/components/common/Card';
import StatusBadge from '@/components/staff/StatusBadge';
import { usePatientSocket } from '@/hooks/useSocket';

const genderOptions = [
  { value: 'male', label: 'Male' }, { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' }, { value: 'prefer-not-to-say', label: 'Prefer not to say' },
];
const languageOptions = [
  { value: 'english', label: 'English' }, { value: 'spanish', label: 'Spanish' },
  { value: 'french', label: 'French' }, { value: 'german', label: 'German' },
  { value: 'chinese', label: 'Chinese' }, { value: 'japanese', label: 'Japanese' },
  { value: 'korean', label: 'Korean' }, { value: 'arabic', label: 'Arabic' },
  { value: 'hindi', label: 'Hindi' }, { value: 'thai', label: 'Thai' },
  { value: 'vietnamese', label: 'Vietnamese' }, { value: 'other', label: 'Other' },
];
const nationalityOptions = [
  { value: 'us', label: 'American' }, { value: 'uk', label: 'British' }, { value: 'ca', label: 'Canadian' },
  { value: 'au', label: 'Australian' }, { value: 'de', label: 'German' }, { value: 'fr', label: 'French' },
  { value: 'jp', label: 'Japanese' }, { value: 'kr', label: 'Korean' }, { value: 'cn', label: 'Chinese' },
  { value: 'in', label: 'Indian' }, { value: 'th', label: 'Thai' }, { value: 'vn', label: 'Vietnamese' },
  { value: 'other', label: 'Other' },
];

export default function PatientForm() {
  const [sessionId, setSessionId] = React.useState('');

  // Generate sessionId client-side only to avoid hydration mismatch
  React.useEffect(() => {
    setSessionId(`patient-${Math.random().toString(36).substring(2, 10)}`);
  }, []);
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inactivityRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastChangeRef = useRef<number>(Date.now());
  const { connected, updateForm, updateStatus, submitForm } = usePatientSocket(sessionId, !!sessionId);
  const { register, handleSubmit, formState: { errors, isDirty }, watch } = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { firstName: '', middleName: '', lastName: '', dateOfBirth: '', gender: undefined, phoneNumber: '', email: '', address: '', preferredLanguage: '', nationality: '', emergencyContactName: '', emergencyContactRelationship: '', religion: '' },
    mode: 'onBlur',
  });
  const watchedFields = watch();
  const sendUpdate = useCallback((data: PatientFormData) => {
    updateForm({
      firstName: data.firstName, middleName: data.middleName || undefined, lastName: data.lastName,
      dateOfBirth: data.dateOfBirth, gender: data.gender, phoneNumber: data.phoneNumber, email: data.email,
      address: data.address, preferredLanguage: data.preferredLanguage, nationality: data.nationality,
      emergencyContact: data.emergencyContactName ? { name: data.emergencyContactName, relationship: data.emergencyContactRelationship || '' } : undefined,
      religion: data.religion || undefined,
    });
  }, [updateForm]);
  useEffect(() => {
    if (!isDirty || isSubmitted) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => sendUpdate(watchedFields as PatientFormData), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [watchedFields, isDirty, isSubmitted, sendUpdate]);
  useEffect(() => {
    if (isSubmitted || !isDirty) return;
    lastChangeRef.current = Date.now();
    updateStatus('filling');
    if (inactivityRef.current) clearTimeout(inactivityRef.current);
    inactivityRef.current = setTimeout(() => { if (Date.now() - lastChangeRef.current >= 5000) updateStatus('inactive'); }, 5000);
    return () => { if (inactivityRef.current) clearTimeout(inactivityRef.current); };
  }, [watchedFields, isSubmitted, isDirty, updateStatus]);
  const onSubmit = (data: PatientFormData) => { sendUpdate(data); submitForm(); setIsSubmitted(true); };
  const handleCopySessionId = async () => {
    try { await navigator.clipboard.writeText(sessionId); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* */ }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-6 py-12">
      {/* Session banner — minimal */}
      <div className="mb-8 flex items-center justify-between gap-4 border border-[#E5E5E5] px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[12px] font-medium text-[#71717A] uppercase tracking-[0.05em] shrink-0">Session</span>
          <code className="text-[13px] font-mono text-[#0A0A0A] truncate">{sessionId}</code>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button type="button" onClick={handleCopySessionId} className="text-[12px] font-medium text-[#71717A] hover:text-[#0A0A0A] transition-colors duration-150">{copied ? 'Copied' : 'Copy'}</button>
          <span className="w-1.5 h-1.5 bg-[#0A0A0A]" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[20px] font-semibold text-[#0A0A0A] tracking-tight">Patient Information</h1>
              <p className="text-[14px] text-[#71717A] mt-0.5">Fill in your personal details below</p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={isSubmitted ? 'submitted' : connected ? 'filling' : 'inactive'} pulse showLabel />
              <span className={`w-1.5 h-1.5 ${connected ? 'bg-[#0A0A0A]' : 'bg-[#D4D4D8]'}`} />
            </div>
          </div>
        </CardHeader>

        {isSubmitted ? (
          <CardBody>
            <div className="py-16 text-center">
              <div className="w-12 h-12 mx-auto mb-5 bg-[#0A0A0A] flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-[#FAFAFA]">check_circle</span>
              </div>
              <h2 className="text-[24px] font-semibold text-[#0A0A0A] mb-2 tracking-tight">Form Submitted</h2>
              <p className="text-[14px] text-[#71717A] mb-8 max-w-sm mx-auto">Your information has been received. A staff member will review it shortly.</p>
              <Button variant="secondary" onClick={() => { window.location.reload(); }}>New Form</Button>
            </div>
          </CardBody>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardBody>
              <div className="space-y-10">
                <div>
                  <h2 className="text-[13px] font-medium text-[#71717A] uppercase tracking-[0.05em] mb-5 pb-2 border-b border-[#E5E5E5]">Personal Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    <InputField label="First Name" name="firstName" placeholder="John" required error={errors.firstName?.message} register={register} />
                    <InputField label="Middle Name" name="middleName" placeholder="Michael" error={errors.middleName?.message} register={register} />
                    <InputField label="Last Name" name="lastName" placeholder="Doe" required error={errors.lastName?.message} register={register} />
                    <InputField label="Date of Birth" name="dateOfBirth" type="date" required error={errors.dateOfBirth?.message} register={register} />
                    <SelectField label="Gender" name="gender" options={genderOptions} placeholder="Select gender" required error={errors.gender?.message} register={register} />
                    <InputField label="Phone Number" name="phoneNumber" type="tel" placeholder="+1 (555) 123-4567" required error={errors.phoneNumber?.message} register={register} />
                  </div>
                </div>
                <div>
                  <h2 className="text-[13px] font-medium text-[#71717A] uppercase tracking-[0.05em] mb-5 pb-2 border-b border-[#E5E5E5]">Contact Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="Email" name="email" type="email" placeholder="john.doe@example.com" required error={errors.email?.message} register={register} />
                    <InputField label="Address" name="address" placeholder="123 Main Street, City" required error={errors.address?.message} register={register} />
                  </div>
                </div>
                <div>
                  <h2 className="text-[13px] font-medium text-[#71717A] uppercase tracking-[0.05em] mb-5 pb-2 border-b border-[#E5E5E5]">Additional Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <SelectField label="Preferred Language" name="preferredLanguage" options={languageOptions} placeholder="Select language" required error={errors.preferredLanguage?.message} register={register} />
                    <SelectField label="Nationality" name="nationality" options={nationalityOptions} placeholder="Select nationality" required error={errors.nationality?.message} register={register} />
                    <InputField label="Religion" name="religion" placeholder="e.g., Christianity, Buddhism" error={errors.religion?.message} register={register} />
                  </div>
                </div>
                <div>
                  <h2 className="text-[13px] font-medium text-[#71717A] uppercase tracking-[0.05em] mb-5 pb-2 border-b border-[#E5E5E5]">Emergency Contact <span className="font-normal normal-case text-[#A1A1AA] ml-2 text-[12px]">(optional)</span></h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <InputField label="Contact Name" name="emergencyContactName" placeholder="Jane Doe" error={errors.emergencyContactName?.message} register={register} />
                    <InputField label="Relationship" name="emergencyContactRelationship" placeholder="Spouse, Parent, Sibling" error={errors.emergencyContactRelationship?.message} register={register} />
                  </div>
                </div>
              </div>
            </CardBody>
            <CardFooter className="flex justify-end">
              {!connected && !isSubmitted && <span className="text-[12px] text-[#71717A] mr-auto">Connecting to server...</span>}
              <Button type="submit" variant="primary" size="md">Submit Form</Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
}

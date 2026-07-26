'use client';

import React from 'react';

interface Option { value: string; label: string; }

interface SelectFieldProps {
  label: string;
  name: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: any;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export default function SelectField({
  label, name, options, placeholder = 'Select an option',
  required = false, error, register, onChange, className = '',
}: SelectFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={name} className="block text-[13px] font-medium text-[#71717A] tracking-tight">
        {label}
        {required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      <select
        id={name}
        {...register(name, { onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChange?.(e) })}
        className={`
          w-full h-10 px-3 text-[14px] font-normal text-[#0A0A0A] bg-white border appearance-none
          focus:outline-none focus:border-[#0A0A0A] focus:ring-0
          ${error ? 'border-[#DC2626]' : 'border-[#D4D4D8] hover:border-[#A1A1AA]'}
        `}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '12px',
        }}
      >
        <option value="" className="text-[#A1A1AA]">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p className="text-[12px] text-[#DC2626] mt-1">{error}</p>}
    </div>
  );
}

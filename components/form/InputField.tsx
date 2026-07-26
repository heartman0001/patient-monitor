'use client';

import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  register: any;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function InputField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  register,
  onChange,
  className = '',
}: InputFieldProps) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label htmlFor={name} className="block text-[13px] font-medium text-[#71717A] tracking-tight">
        {label}
        {required && <span className="text-[#DC2626] ml-0.5">*</span>}
      </label>
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        {...register(name, {
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e),
        })}
        className={`
          w-full h-10 px-3 text-[14px] font-normal text-[#0A0A0A] bg-white border
          placeholder:text-[#A1A1AA]
          focus:outline-none focus:border-[#0A0A0A] focus:ring-0
          disabled:bg-[#F4F4F5] disabled:border-[#E5E5E5] disabled:text-[#A1A1AA]
          ${error ? 'border-[#DC2626]' : 'border-[#D4D4D8] hover:border-[#A1A1AA]'}
        `}
      />
      {error && <p className="text-[12px] text-[#DC2626] mt-1">{error}</p>}
    </div>
  );
}

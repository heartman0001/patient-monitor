import { z } from 'zod';

export const patientFormSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long'),
  middleName: z.string().max(50, 'Middle name is too long').optional().or(z.literal('')),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long'),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine(
      (val) => {
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: 'Invalid date format' }
    ),
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    message: 'Please select a gender',
  }),
  phoneNumber: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^[\d\s\-+()]{7,20}$/,
      'Please enter a valid phone number'
    ),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address is too long'),
  preferredLanguage: z
    .string()
    .min(1, 'Preferred language is required'),
  nationality: z
    .string()
    .min(1, 'Nationality is required'),
  emergencyContactName: z
    .string()
    .max(50, 'Name is too long')
    .optional()
    .or(z.literal('')),
  emergencyContactRelationship: z
    .string()
    .max(50, 'Relationship is too long')
    .optional()
    .or(z.literal('')),
  religion: z
    .string()
    .max(50, 'Religion is too long')
    .optional()
    .or(z.literal('')),
});

export type PatientFormData = z.infer<typeof patientFormSchema>;

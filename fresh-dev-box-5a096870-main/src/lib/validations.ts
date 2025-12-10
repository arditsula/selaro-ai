import { z } from 'zod';

// Auth validation schemas
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'E-Mail-Adresse ist erforderlich')
  .email('Ungültige E-Mail-Adresse')
  .max(255, 'E-Mail darf maximal 255 Zeichen lang sein');

export const passwordSchema = z
  .string()
  .min(1, 'Passwort ist erforderlich')
  .min(6, 'Passwort muss mindestens 6 Zeichen lang sein')
  .max(128, 'Passwort darf maximal 128 Zeichen lang sein');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Passwort-Bestätigung ist erforderlich'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Passwort-Bestätigung ist erforderlich'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwörter stimmen nicht überein',
    path: ['confirmPassword'],
  });

// Settings validation schemas
export const phoneSchema = z
  .string()
  .trim()
  .max(30, 'Telefonnummer darf maximal 30 Zeichen lang sein')
  .regex(/^[+\d\s\-()]*$/, 'Ungültiges Telefonnummer-Format')
  .optional()
  .or(z.literal(''));

export const clinicSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Praxisname ist erforderlich')
    .max(100, 'Praxisname darf maximal 100 Zeichen lang sein'),
  phone_number: phoneSchema,
  address: z
    .string()
    .trim()
    .max(200, 'Adresse darf maximal 200 Zeichen lang sein')
    .optional()
    .or(z.literal('')),
  instructions: z
    .string()
    .trim()
    .max(5000, 'Anweisungen dürfen maximal 5000 Zeichen lang sein')
    .optional()
    .or(z.literal('')),
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ClinicSettingsFormData = z.infer<typeof clinicSettingsSchema>;

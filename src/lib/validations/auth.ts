import { z } from 'zod';

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址')
    .max(254, '邮箱地址过长'),
  password: z
    .string()
    .min(1, '请输入密码')
    .min(8, '密码至少需要8个字符')
    .max(128, '密码不能超过128个字符'),
});

// Register validation schema
export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, '请输入姓名')
    .max(50, '姓名不能超过50个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z\s]+$/, '姓名只能包含中文、英文和空格'),
  lastName: z
    .string()
    .min(1, '请输入姓氏')
    .max(50, '姓氏不能超过50个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z\s]+$/, '姓氏只能包含中文、英文和空格'),
  email: z
    .string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址')
    .max(254, '邮箱地址过长'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^1[3-9]\d{9}$/.test(val), {
      message: '请输入有效的手机号码',
    }),
  password: z
    .string()
    .min(8, '密码至少需要8个字符')
    .max(128, '密码不能超过128个字符')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '密码必须包含大小写字母、数字和特殊字符'
    ),
  confirmPassword: z.string().min(1, '请确认密码'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: '请同意服务条款和隐私政策',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// Profile update validation schema
export const profileUpdateSchema = z.object({
  firstName: z
    .string()
    .min(1, '请输入姓名')
    .max(50, '姓名不能超过50个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z\s]+$/, '姓名只能包含中文、英文和空格'),
  lastName: z
    .string()
    .min(1, '请输入姓氏')
    .max(50, '姓氏不能超过50个字符')
    .regex(/^[\u4e00-\u9fa5a-zA-Z\s]+$/, '姓氏只能包含中文、英文和空格'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^1[3-9]\d{9}$/.test(val), {
      message: '请输入有效的手机号码',
    }),
  avatarUrl: z.string().url('请输入有效的头像URL').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, '请输入邮箱')
    .email('请输入有效的邮箱地址')
    .max(254, '邮箱地址过长'),
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, '密码至少需要8个字符')
    .max(128, '密码不能超过128个字符')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '密码必须包含大小写字母、数字和特殊字符'
    ),
  confirmPassword: z.string().min(1, '请确认密码'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, '请输入当前密码'),
  newPassword: z
    .string()
    .min(8, '新密码至少需要8个字符')
    .max(128, '新密码不能超过128个字符')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      '新密码必须包含大小写字母、数字和特殊字符'
    ),
  confirmNewPassword: z.string().min(1, '请确认新密码'),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: '两次输入的新密码不一致',
  path: ['confirmNewPassword'],
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: '新密码不能与当前密码相同',
  path: ['newPassword'],
});

// Type exports
export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

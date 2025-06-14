import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ResetPasswordForm } from '@/components/forms/reset-password-form';
import { useAuthStore } from '@/store/auth';

// Mock the auth store
jest.mock('@/store/auth');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

// Mock Next.js router and search params
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams('access_token=test&refresh_token=test&type=recovery');

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams,
}));

describe('ResetPasswordForm', () => {
  const mockResetPassword = jest.fn();

  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      resetPassword: mockResetPassword,
      isLoading: false,
      user: null,
      isAuthenticated: false,
      setUser: jest.fn(),
      setLoading: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
      updateProfile: jest.fn(),
      forgotPassword: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders reset password form correctly', () => {
    render(<ResetPasswordForm />);
    
    expect(screen.getByText('请输入您的新密码。密码必须包含大小写字母、数字和特殊字符。')).toBeInTheDocument();
    expect(screen.getByLabelText('新密码')).toBeInTheDocument();
    expect(screen.getByLabelText('确认新密码')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重置密码' })).toBeInTheDocument();
  });

  it('validates password requirements', async () => {
    render(<ResetPasswordForm />);
    
    const passwordInput = screen.getByLabelText('新密码');
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    
    const submitButton = screen.getByRole('button', { name: '重置密码' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('密码至少需要8个字符')).toBeInTheDocument();
    });
  });

  it('validates password complexity', async () => {
    render(<ResetPasswordForm />);
    
    const passwordInput = screen.getByLabelText('新密码');
    fireEvent.change(passwordInput, { target: { value: 'simplepassword' } });
    
    const submitButton = screen.getByRole('button', { name: '重置密码' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('密码必须包含大小写字母、数字和特殊字符')).toBeInTheDocument();
    });
  });

  it('validates password confirmation', async () => {
    render(<ResetPasswordForm />);
    
    const passwordInput = screen.getByLabelText('新密码');
    const confirmPasswordInput = screen.getByLabelText('确认新密码');
    
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPass123!' } });
    
    const submitButton = screen.getByRole('button', { name: '重置密码' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('两次输入的密码不一致')).toBeInTheDocument();
    });
  });

  it('shows password strength indicator', () => {
    render(<ResetPasswordForm />);
    
    const passwordInput = screen.getByLabelText('新密码');
    
    // Test weak password
    fireEvent.change(passwordInput, { target: { value: 'weak' } });
    expect(screen.getByText('很弱')).toBeInTheDocument();
    
    // Test strong password
    fireEvent.change(passwordInput, { target: { value: 'StrongPass123!' } });
    expect(screen.getByText('很强')).toBeInTheDocument();
  });

  it('submits form with valid passwords', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    
    render(<ResetPasswordForm />);
    
    const passwordInput = screen.getByLabelText('新密码');
    const confirmPasswordInput = screen.getByLabelText('确认新密码');
    
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123!' } });
    
    const submitButton = screen.getByRole('button', { name: '重置密码' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('ValidPass123!');
    });
  });

  it('shows success message after successful reset', async () => {
    mockResetPassword.mockResolvedValue(undefined);
    
    render(<ResetPasswordForm />);
    
    const passwordInput = screen.getByLabelText('新密码');
    const confirmPasswordInput = screen.getByLabelText('确认新密码');
    
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123!' } });
    
    const submitButton = screen.getByRole('button', { name: '重置密码' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('密码重置成功')).toBeInTheDocument();
      expect(screen.getByText('您的密码已成功重置。正在跳转到登录页面...')).toBeInTheDocument();
    });
  });

  it('shows error message on reset failure', async () => {
    const errorMessage = '重置失败';
    mockResetPassword.mockRejectedValue(new Error(errorMessage));
    
    render(<ResetPasswordForm />);
    
    const passwordInput = screen.getByLabelText('新密码');
    const confirmPasswordInput = screen.getByLabelText('确认新密码');
    
    fireEvent.change(passwordInput, { target: { value: 'ValidPass123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'ValidPass123!' } });
    
    const submitButton = screen.getByRole('button', { name: '重置密码' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows error for invalid reset link', () => {
    // Mock invalid search params
    const invalidSearchParams = new URLSearchParams('type=invalid');
    jest.mocked(require('next/navigation').useSearchParams).mockReturnValue(invalidSearchParams);
    
    render(<ResetPasswordForm />);
    
    expect(screen.getByText('无效的重置链接，请重新申请密码重置。')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '重置密码' })).toBeDisabled();
  });
});

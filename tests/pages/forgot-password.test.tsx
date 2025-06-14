import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordForm } from '@/components/forms/forgot-password-form';
import { useAuthStore } from '@/store/auth';

// Mock the auth store
jest.mock('@/store/auth');
const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

describe('ForgotPasswordForm', () => {
  const mockForgotPassword = jest.fn();

  beforeEach(() => {
    mockUseAuthStore.mockReturnValue({
      forgotPassword: mockForgotPassword,
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
      resetPassword: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders forgot password form correctly', () => {
    render(<ForgotPasswordForm />);
    
    expect(screen.getByText('输入您的邮箱地址，我们将向您发送密码重置链接。')).toBeInTheDocument();
    expect(screen.getByLabelText('邮箱地址')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '发送重置链接' })).toBeInTheDocument();
    expect(screen.getByText('返回登录')).toBeInTheDocument();
  });

  it('validates email input', async () => {
    render(<ForgotPasswordForm />);
    
    const submitButton = screen.getByRole('button', { name: '发送重置链接' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('请输入邮箱')).toBeInTheDocument();
    });
  });

  it('validates email format', async () => {
    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText('邮箱地址');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    
    const submitButton = screen.getByRole('button', { name: '发送重置链接' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('请输入有效的邮箱地址')).toBeInTheDocument();
    });
  });

  it('submits form with valid email', async () => {
    mockForgotPassword.mockResolvedValue(undefined);
    
    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText('邮箱地址');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: '发送重置链接' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('shows success message after successful submission', async () => {
    mockForgotPassword.mockResolvedValue(undefined);
    
    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText('邮箱地址');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: '发送重置链接' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('重置邮件已发送')).toBeInTheDocument();
      expect(screen.getByText(/我们已向.*test@example.com.*发送了密码重置链接/)).toBeInTheDocument();
    });
  });

  it('shows error message on submission failure', async () => {
    const errorMessage = '邮箱不存在';
    mockForgotPassword.mockRejectedValue(new Error(errorMessage));
    
    render(<ForgotPasswordForm />);
    
    const emailInput = screen.getByLabelText('邮箱地址');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    const submitButton = screen.getByRole('button', { name: '发送重置链接' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', () => {
    mockUseAuthStore.mockReturnValue({
      forgotPassword: mockForgotPassword,
      isLoading: true,
      user: null,
      isAuthenticated: false,
      setUser: jest.fn(),
      setLoading: jest.fn(),
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      refreshUser: jest.fn(),
      updateProfile: jest.fn(),
      resetPassword: jest.fn(),
    });

    render(<ForgotPasswordForm />);
    
    expect(screen.getByText('发送中...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /发送中/ })).toBeDisabled();
  });
});

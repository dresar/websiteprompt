import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSimpleFormValidation } from '@/hooks/useSimpleFormValidation';
import { userService, jwtUtils } from '@/lib/mockDatabase';

interface LoginFormProps {
  onLoginSuccess: (user: any) => void;
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onSwitchToRegister }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    values,
    errors,
    isValid,
    handleChange,
    handleBlur,
    validateForm
  } = useSimpleFormValidation({
    username: '',
    password: ''
  }, {
    username: (value) => {
      if (!value) return 'Username atau email harus diisi';
      if (value.length < 3) return 'Username minimal 3 karakter';
      return '';
    },
    password: (value) => {
      if (!value) return 'Password harus diisi';
      if (value.length < 6) return 'Password minimal 6 karakter';
      return '';
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi input sebelum submit
    if (!values.username || !values.password) {
      setError('Username dan password harus diisi');
      return;
    }
    
    if (!validateForm()) {
      setError('Mohon perbaiki kesalahan pada form');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const user = await userService.authenticateUser(values.username, values.password);
      
      if (!user) {
        setError('Username/email atau password salah');
        return;
      }

      // Generate token
      const token = jwtUtils.generateToken(user.id);
      
      // Store in localStorage
      localStorage.setItem('authToken', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      
      onLoginSuccess(user);
    } catch (error) {
      console.error('Login error:', error);
      setError('Terjadi kesalahan saat login. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
        <CardDescription className="text-center">
          Masuk ke akun Anda untuk melanjutkan
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="username">Username atau Email</Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="Masukkan username atau email"
              value={values.username}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.username ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Masukkan password"
              value={values.password}
              onChange={handleChange}
              onBlur={handleBlur}
              className={errors.password ? 'border-red-500' : ''}
              disabled={isLoading}
            />
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!isValid || isLoading}
          >
            {isLoading ? 'Sedang masuk...' : 'Masuk'}
          </Button>

          <div className="text-center">
            <Button
              type="button"
              variant="link"
              onClick={onSwitchToRegister}
              disabled={isLoading}
            >
              Belum punya akun? Daftar di sini
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};